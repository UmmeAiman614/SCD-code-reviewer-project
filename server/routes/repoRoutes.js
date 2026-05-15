const router = require('express').Router()
const { listRepos, getRepo, getContents, getFile } = require('../controllers/repoController')
const { protect } = require('../middleware/authMiddleware')

// All repo routes require authentication
router.use(protect)

// GET /api/repos                          — list all user repos
router.get('/', listRepos)

// GET /api/repos/:owner/:repo             — get single repo metadata
router.get('/:owner/:repo', getRepo)

// GET /api/repos/:owner/:repo/contents    — get directory contents
router.get('/:owner/:repo/contents', getContents)

// GET /api/repos/:owner/:repo/file        — get single file content (?path=...)
router.get('/:owner/:repo/file', getFile)

module.exports = router
