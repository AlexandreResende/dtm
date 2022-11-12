const { sequelize } = require('../model');

class ProfileRepository {
  constructor() {
    this.repository = sequelize.models.Profile;
  }

  async findById(id) {
    return this.repository.findOne({ where: { id: (id || 0) } });
  }
}

module.exports = { ProfileRepository };
