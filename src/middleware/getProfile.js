const { StatusCodes: { UNAUTHORIZED } } = require('http-status-codes');

const { ProfileRepository } = require('../repositories/profileRepository');

const getProfile = async (req, res, next) => {
    const profile = await (new ProfileRepository().findById(req.get('profile_id')));

    if(!profile) {
        return res.status(UNAUTHORIZED).end();
    }

    console.log(profile);

    req.profile = profile;
    next();
}

module.exports = { getProfile };
