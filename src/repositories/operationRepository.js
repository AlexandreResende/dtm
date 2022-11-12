const { sequelize } = require('../model');

class OperationRepository {
  constructor() {
    this.profileRepository = sequelize.models.Profile;
    this.jobRepository = sequelize.models.Job;
    this.transaction = sequelize.transaction;
  }

  async pay(clientId, contractorId, jobId, paymentValue) {
    try {
      await sequelize.transaction(async (transaction) => {
        await this.jobRepository.update(
          { paid: true, paymentDate: new Date().toISOString() },
          { where: { id: jobId } },
          { transaction },
        );
        await this.profileRepository.decrement(
          { balance: paymentValue },
          { where: { id: clientId } },
          { transaction },
        );
        await this.profileRepository.increment(
          { balance: paymentValue },
          { where: { id: contractorId } },
          { transaction },
        );
      });
    } catch (error) {
      // TODO: Improve error thrown when it occurs on transaction
      throw error;
    }
  }

  async deposit(clientId, amount) {
    await this.profileRepository.increment(
      { balance: amount },
      { where: { id: clientId }
    });
  }
}

module.exports = { OperationRepository };
