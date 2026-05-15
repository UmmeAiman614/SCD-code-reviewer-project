const { asyncHandler, ApiError, sendSuccess } = require('../utils/helpers')
const gh   = require('../services/githubService')
const User = require('../models/User')

const getToken = async (userId) => {
  const user = await User.findById(userId).select('+githubToken').lean()
  if (!user?.githubToken) throw ApiError.unauthorized('GitHub session expired. Please sign in again.')
  return user.githubToken
}

const listRepos = asyncHandler(async (req, res) => {
  const token = await getToken(req.user._id)
  const page    = Number(req.query.page) || 1
  const perPage = Number(req.query.per_page) || 50
  const repos   = await gh.listRepos(token, page, perPage)
  sendSuccess(res, { repos, page, per_page: perPage })
})

const getRepo = asyncHandler(async (req, res) => {
  const { owner, repo } = req.params
  if (!owner || !repo) throw ApiError.badRequest('owner and repo params are required')
  const token   = await getToken(req.user._id)
  const repoData = await gh.getRepo(token, owner, repo)
  sendSuccess(res, { repo: repoData })
})

const getContents = asyncHandler(async (req, res) => {
  const { owner, repo } = req.params
  const path  = req.query.path || ''
  const token = await getToken(req.user._id)
  const files = await gh.getContents(token, owner, repo, path)
  sendSuccess(res, { files })
})

const getFile = asyncHandler(async (req, res) => {
  const { owner, repo } = req.params
  const { path } = req.query
  if (!path) throw ApiError.badRequest('path query param required')
  const token   = await getToken(req.user._id)
  const content = await gh.getFileContent(token, owner, repo, path)
  sendSuccess(res, { content, path })
})

module.exports = { listRepos, getRepo, getContents, getFile }
