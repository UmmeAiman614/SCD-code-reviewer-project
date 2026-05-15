const { asyncHandler, ApiError, sendSuccess } = require('../utils/helpers')
const gh       = require('../services/githubService')
const analyzer = require('../services/codeAnalyzer')
const Review   = require('../models/Review')
const User     = require('../models/User')
const logger   = require('../utils/logger')

const getToken = async (userId) => {
  const user = await User.findById(userId).select('+githubToken').lean()
  if (!user?.githubToken) throw ApiError.unauthorized('GitHub session expired.')
  return user.githubToken
}

// ── POST /api/reviews/analyze ────────────────────────────
const analyze = asyncHandler(async (req, res) => {
  const { owner, repo } = req.body
  if (!owner || !repo) throw ApiError.badRequest('owner and repo are required')

  const token = await getToken(req.user._id)

  logger.info(`Analysis started: ${owner}/${repo} by user ${req.user._id}`)

  // Collect analyzable files
  const files = await gh.getAnalyzableFiles(token, owner, repo)
  if (!files.length)
    throw ApiError.badRequest('No JavaScript/TypeScript files found in this repository.')

  let allIssues = [], totalLines = 0, filesScanned = 0

  for (const file of files) {
    try {
      const content = await gh.getFileContent(token, owner, repo, file.path)
      if (!content) continue
      const { issues, linesScanned } = analyzer.analyzeFile(content, file.path)
      allIssues   = allIssues.concat(issues)
      totalLines += linesScanned
      filesScanned++
    } catch (e) {
      logger.warn(`Skipped ${file.path}: ${e.message}`)
    }
  }

  // Sort: critical → warning → info
  const ORDER = { critical: 0, warning: 1, info: 2 }
  allIssues.sort((a, b) => (ORDER[a.severity] ?? 3) - (ORDER[b.severity] ?? 3))

  const score   = analyzer.scoreCode(allIssues, totalLines)
  const summary = analyzer.summarize(allIssues, score, filesScanned)

  // Get default branch
  let branch = 'main'
  try { const r = await gh.getRepo(token, owner, repo); branch = r.default_branch || 'main' } catch {}

  const review = await Review.create({
    user:     req.user._id,
    repoName: `${owner}/${repo}`,
    owner, repo, branch, score, summary,
    issues:   allIssues.slice(0, 300),
    filesScanned,
    linesScanned: totalLines,
    status: 'completed',
  })

  logger.info(`Analysis complete: ${owner}/${repo} → score ${score}`)
  sendSuccess(res, { review }, 201)
})

// ── GET /api/reviews ─────────────────────────────────────
const list = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50)
  const page  = Math.max(Number(req.query.page)  || 1,  1)
  const skip  = (page - 1) * limit

  const [reviews, total] = await Promise.all([
    Review.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments({ user: req.user._id }),
  ])

  sendSuccess(res, { reviews, total, page, pages: Math.ceil(total / limit) })
})

// ── GET /api/reviews/stats ───────────────────────────────
const stats = asyncHandler(async (req, res) => {
  const [agg] = await Review.aggregate([
    { $match: { user: req.user._id } },
    { $group: {
      _id:          null,
      totalReviews: { $sum: 1 },
      avgScore:     { $avg: '$score' },
      totalIssues:  { $sum: { $size: '$issues' } },
      repos:        { $addToSet: '$repoName' },
    }},
    { $project: {
      totalReviews:  1,
      avgScore:      { $round: ['$avgScore', 1] },
      totalIssues:   1,
      reposAnalyzed: { $size: '$repos' },
    }},
  ])
  sendSuccess(res, agg || { totalReviews: 0, avgScore: 0, totalIssues: 0, reposAnalyzed: 0 })
})

// ── GET /api/reviews/:id ─────────────────────────────────
const getOne = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id }).lean()
  if (!review) throw ApiError.notFound('Review not found')
  sendSuccess(res, { review })
})

// ── DELETE /api/reviews/:id ──────────────────────────────
const remove = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  if (!review) throw ApiError.notFound('Review not found')
  sendSuccess(res, { message: 'Review deleted' })
})

module.exports = { analyze, list, stats, getOne, remove }
