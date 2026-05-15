const { asyncHandler, ApiError, sendSuccess } = require('../utils/helpers')
const { sign }   = require('../utils/jwt')
const gh         = require('../services/githubService')
const User       = require('../models/User')
const logger     = require('../utils/logger')

/**
 * POST /api/auth/github/callback
 * Frontend sends { code } after GitHub redirects to /auth/callback
 */
const githubCallback = asyncHandler(async (req, res) => {
  const { code } = req.body
  if (!code) throw ApiError.badRequest('GitHub OAuth code is required')

  // 1. Exchange code → access token
  const accessToken = await gh.exchangeCode(code)

  // 2. Fetch GitHub profile
  const ghUser = await gh.getUser(accessToken)

  // 3. Upsert user in DB
  let user = await User.findOne({ githubId: String(ghUser.id) })
  const userData = {
    githubUsername: ghUser.login,
    name:           ghUser.name || ghUser.login,
    avatarUrl:      ghUser.avatar_url,
    bio:            ghUser.bio || '',
    githubToken:    accessToken,
    ...(ghUser.email && { email: ghUser.email }),
  }

  if (user) {
    Object.assign(user, userData)
    await user.save()
  } else {
    user = await User.create({ githubId: String(ghUser.id), ...userData })
  }

  // 4. Issue JWT
  const token = sign({ id: user._id })

  logger.info(`User logged in: @${user.githubUsername}`)

  sendSuccess(res, {
    token,
    user: {
      _id:            user._id,
      name:           user.name,
      githubUsername: user.githubUsername,
      avatarUrl:      user.avatarUrl,
      email:          user.email,
    },
  })
})

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user })
})

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // Token is stateless — client clears it; optionally we could blacklist it
  sendSuccess(res, { message: 'Logged out successfully' })
})

module.exports = { githubCallback, getMe, logout }
