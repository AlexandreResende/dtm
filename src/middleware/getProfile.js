const { StatusCodes: { UNAUTHORIZED } } = require('http-status-codes');

const getProfile = async (req, res, next) => {
    const {Profile} = req.app.get('models')
    const profile = await Profile.findOne({where: {id: req.get('profile_id') || 0}})
    if(!profile) return res.status(UNAUTHORIZED).end()
    req.profile = profile
    next()
}
module.exports = {getProfile}