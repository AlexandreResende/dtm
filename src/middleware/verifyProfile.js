const { StatusCodes: { FORBIDDEN } } = require('http-status-codes');

const { ProfileType } = require('../enums/profileType');

const verifyProfile = async (req, res, next) => {
    const profile = req.profile;

    if (profile.type !== ProfileType.CLIENT) {
      return res.status(FORBIDDEN).end();
    }

    req.profile = profile
    next()
}
module.exports = { verifyProfile };
