const { Op } = require("sequelize");

const { sequelize } = require('../model');
const { ContractStatuses } = require('../enums/contractStatuses');

class JobRepository {
  constructor() {
    this.repository = sequelize.models.Job;
  }

  async findUnpaidJobs(contractId) {
    return this.repository.findAll({
      where: {
        contractId,
        paid: { [Op.not]: true }
      },
    });
  }
}

module.exports = { JobRepository };
