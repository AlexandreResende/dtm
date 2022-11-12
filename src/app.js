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

module.exports = app;
