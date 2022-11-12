const { Op } = require("sequelize");

const { sequelize } = require('../model');
const { ContractStatuses } = require('../enums/contractStatuses');

class ContractRepository {
  constructor() {
    this.repository = sequelize.models.Contract;
  }

  async findById(id) {
    return this.repository.findOne({ where: { id } });
  }

  async findByIdAndClientId(id, clientId) {
    return  this.repository.findOne({ where: { id, clientId } });
  }

  async findByIdAndContractorId(id, contractorId) {
    return  this.repository.findOne({ where: { id, contractorId } });
  }

  async findByClientIdAndNotTerminatedStatus(clientId) {
    return  this.repository.findAll({
      where: {
        clientId,
        status: { [Op.not]: ContractStatuses.TERMINATED },
      }
    });
  }

  async findByContractorIdAndNotTerminatedStatus(contractorId) {
    return  this.repository.findAll({
      where: {
        contractorId,
        status: { [Op.not]: ContractStatuses.TERMINATED },
      }
    });
  }

  async findByClientIdAndActive(clientId) {
    return  this.repository.findAll({
      where: {
        clientId,
        status: { [Op.eq]: ContractStatuses.IN_PROGRESS },
      }
    });
  }

  async findByContractorIdAndActive(contractorId) {
    return  this.repository.findAll({
      where: {
        contractorId,
        status: { [Op.eq]: ContractStatuses.IN_PROGRESS },
      }
    });
  }
}

module.exports = { ContractRepository };
