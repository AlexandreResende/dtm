const express = require('express');
const bodyParser = require('body-parser');
const { StatusCodes: { NOT_FOUND } } = require('http-status-codes');

const { sequelize } = require('./model');
const { ProfileType } = require('./enums/profileType');
const { getProfile } = require('./middleware/getProfile');

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

const { ContractRepository } = require('./repositories/contractRepository');
const { JobRepository } = require('./repositories/jobRepository');

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

    // TODO: Do this using sequelize. Much better than looping on contracts
    for (contractId of contractIds) {
        const jobsByContractId = await (new JobRepository().findUnpaidJobs(contractId));

        jobs = jobs.concat(jobsByContractId);
    }

    res.json(jobs);
});

module.exports = app;
