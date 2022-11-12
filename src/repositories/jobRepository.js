const { Op } = require("sequelize");

const { sequelize } = require('../model');

class JobRepository {
  constructor() {
    this.repository = sequelize.models.Job;
  }

  async findById(id) {
    return this.repository.findOne({ where: { id } });
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
