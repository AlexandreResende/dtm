const { StatusCodes: { FORBIDDEN } } = require('http-status-codes');

const { ProfileType } = require('../enums/profileType');

const verifyProfile = async (req, res, next) => {
    const profile = req.profile;

    if (profile.type !== ProfileType.CLIENT) {
      return res.status(FORBIDDEN).json({ message: 'Only clients can pay for jobs' });
    }

    req.profile = profile
    next()
}
module.exports = { verifyProfile };
