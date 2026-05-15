const { verify }    = require('../utils/jwt')
const { ApiError }  = require('../utils/helpers')
const User          = require('../models/User')

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer '))
      return next(ApiError.unauthorized('No token provided'))

    const token   = header.split(' ')[1]
    const decoded = verify(token)

    const user = await User.findById(decoded.id).lean()
    if (!user) return next(ApiError.unauthorized('User not found'))

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return next(ApiError.unauthorized('Token expired. Please sign in again.'))
    return next(ApiError.unauthorized('Invalid token'))
  }
}

module.exports = { protect }
