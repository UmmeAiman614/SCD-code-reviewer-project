const router = require('express').Router()
const { githubCallback, getMe, logout } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

// POST /api/auth/github/callback  — frontend sends { code } after GitHub redirect
router.post('/github/callback', githubCallback)

// GET  /api/auth/me               — returns current logged-in user
router.get('/me', protect, getMe)

// POST /api/auth/logout           — clears server-side state (token is stateless)
router.post('/logout', protect, logout)

module.exports = router
