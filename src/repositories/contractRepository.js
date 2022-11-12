const { Op } = require("sequelize");

const { sequelize } = require('../model');
const { ContractStatuses } = require('../enums/contractStatuses');

class ContractRepository {
  constructor() {
    this.repository = sequelize.models.Contract;
  }

  async findByIdAndClientId(id, clientId) {
    return  this.repository.findOne({ where: { id, clientId } });
  }

  async findByIdAndContractorId(id, contractorId) {
    return  this.repository.findOne({ where: { id, contractorId } });
  }
}

module.exports = { ContractRepository };
