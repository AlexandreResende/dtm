const express = require('express');
const bodyParser = require('body-parser');
const { StatusCodes: { NOT_FOUND, FORBIDDEN } } = require('http-status-codes');

const { sequelize } = require('./model');
const { ProfileType } = require('./enums/profileType');
const { getProfile } = require('./middleware/getProfile');
const { verifyProfile } = require('./middleware/verifyProfile');

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

const { ContractRepository } = require('./repositories/contractRepository');
const { JobRepository } = require('./repositories/jobRepository');
const { OperationRepository } = require('./repositories/operationRepository');
const { ProfileRepository } = require('./repositories/profileRepository');

app.get('/contracts/:id', getProfile ,async (req, res) =>{
    const {id} = req.params;
    const { id: profileId, type: profileType } = req.profile;
    let contract;

    if (profileType === ProfileType.CLIENT) {
        contract = await (new ContractRepository().findByIdAndClientId(id, profileId));
    } else {
        contract = await (new ContractRepository().findByIdAndContractorId(id, profileId));
    }

    if(!contract) {
        return res.status(NOT_FOUND).end();
    }

    res.json(contract);
});

app.get('/contracts', getProfile, async (req, res) => {
    const { id: profileId, type: profileType } = req.profile;
    let contracts;

    if (profileType === ProfileType.CLIENT) {
        contracts = await (new ContractRepository().findByClientIdAndNotTerminatedStatus(profileId));
    } else {
        contracts = await (new ContractRepository().findByContractorIdAndNotTerminatedStatus(profileId));
    }

    res.json(contracts);
});

app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const { id: profileId, type: profileType } = req.profile;
    let contracts;
    let contractIds = [];
    let jobs = [];

    if (profileType === ProfileType.CLIENT) {
        contracts = await (new ContractRepository().findByClientIdAndActive(profileId));
    } else {
        contracts = await (new ContractRepository().findByContractorIdAndActive(profileId));
    }

    contracts.filter((contract) => contractIds.push(contract.id));
    contractIds = contractIds.filter((contractId, index) => contractIds.indexOf(contractId) === index);

    // TODO: Do this using sequelize in one query. Much better than looping on contracts
    // or could create a method in the repository to use the ''in'' operator
    for (contractId of contractIds) {
        const jobsByContractId = await (new JobRepository().findUnpaidJobs(contractId));

        jobs = jobs.concat(jobsByContractId);
    }

    res.json(jobs);
});

app.post('/jobs/:jobId/pay', getProfile, verifyProfile, async (req, res) => {
    const client = req.profile;
    const jobId = req.params.jobId;

    const job = await (new JobRepository().findById(jobId));

    if (!job) {
        return res.status(NOT_FOUND).json({ message: 'Job not found' });
    }

    if (job.paid) {
        return res.status(FORBIDDEN).json({ message: 'Job already paid' });
    }

    const contractId = job.ContractId;
    const contract = await (new ContractRepository().findById(contractId));

    if (contract.ClientId !== client.id) {
        return res.status(FORBIDDEN).json({ message: 'The contract is not related to the specified client' });
    }

    const contractorId = contract.ContractorId;
    const contractor = await (new ProfileRepository().findById(contractorId));

    if (!contractor) {
        return res.status(NOT_FOUND).json({ message: 'Contractor not found' });
    }

    if (job.price > contractor.balance) {
        return res.status(FORBIDDEN).json({ message: 'The contractor has insuficient funds' });
    }

    await (new OperationRepository().pay(contract.ClientId, contractorId, jobId, job.price));

    res.json();
});

/**
 * There, MAY, be a glitch in this feature. The client could make x deposits in
 * the allowed threshold and this will consequently increase its balance far
 * more than 'we' wanted. The client will just have more work to do.
 * However we could work something like that the amount deposited could not be
 * greater than 25% his total of jobs to pay minus the balance that it has.
 * This way we would prevent the client to have a huge amount of money in the account.
 * IMHO, I dont see any value on exploring the 'glitch' because the client is not getting interests in
 * the deposited money.
 */
app.post('/balances/deposit/:userId', getProfile, verifyProfile, async (req, res) => {
    const clientId = req.profile.id;
    const amountToDeposit = req.body.amount;
    let contracts;
    let contractIds = [];
    let jobs = [];
    let totalValueOfUnpaidJobs = 0;

    contracts = await (new ContractRepository().findByClientIdAndActive(clientId));

    contracts.filter((contract) => contractIds.push(contract.id));
    contractIds = contractIds.filter((contractId, index) => contractIds.indexOf(contractId) === index);

    // TODO: Do this using sequelize in one query. Much better than looping on contracts
    // or could create a method in the repository to use the ''in'' operator
    for (contractId of contractIds) {
        const jobsByContractId = await (new JobRepository().findUnpaidJobs(contractId));

        jobs = jobs.concat(jobsByContractId);
    }

    jobs.filter(job => totalValueOfUnpaidJobs += job.price);
    const maxAmountToBeDeposited = totalValueOfUnpaidJobs * 1.25;

    if (amountToDeposit > maxAmountToBeDeposited) {
        return res.status(FORBIDDEN).json({ message: 'Amount to be deposited exceeding allowed value' });
    }

    await (new OperationRepository().deposit(clientId, amountToDeposit));

    res.json();
});

module.exports = app;
