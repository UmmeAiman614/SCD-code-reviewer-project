const router = require('express').Router()
const { analyze, list, stats, getOne, remove } = require('../controllers/reviewController')
const { protect } = require('../middleware/authMiddleware')

// All review routes require authentication
router.use(protect)

// POST /api/reviews/analyze       — trigger full repo analysis
router.post('/analyze', analyze)

// GET  /api/reviews/stats         — aggregate stats for dashboard (must be before /:id)
router.get('/stats', stats)

// GET  /api/reviews               — list all reviews for current user
router.get('/', list)

// GET  /api/reviews/:id           — single review detail
router.get('/:id', getOne)

// DELETE /api/reviews/:id         — delete a review
router.delete('/:id', remove)

module.exports = router
