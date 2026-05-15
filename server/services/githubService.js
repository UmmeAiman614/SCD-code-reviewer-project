const axios    = require('axios')
const NodeCache = require('node-cache')
const logger   = require('../utils/logger')
const { ApiError } = require('../utils/helpers')

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 })

const gh = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 20000,
  headers: {
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
})

// Attach token to every request
const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

// Map GitHub API errors to friendly messages
const handleGhError = (err) => {
  const status  = err.response?.status
  const message = err.response?.data?.message || err.message

  if (status === 401) throw ApiError.unauthorized('GitHub token is invalid or expired. Please sign in again.')
  if (status === 403 && message?.includes('rate limit'))
    throw new ApiError('GitHub API rate limit exceeded. Please wait a few minutes.', 429)
  if (status === 403) throw ApiError.forbidden('Access denied by GitHub.')
  if (status === 404) throw ApiError.notFound('Repository or resource not found on GitHub.')
  if (status === 422) throw ApiError.badRequest('Invalid repository name or parameters.')
  logger.error('GitHub API error:', { status, message })
  throw new ApiError(`GitHub API error: ${message}`, status || 502)
}

// ── Exchange code for access token ──────────────────────
const exchangeCode = async (code) => {
  const res = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id:     process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: 'application/json' }, timeout: 15000 }
  ).catch(err => {
    logger.error('Token exchange failed:', err.message)
    throw new ApiError('Failed to exchange GitHub code for token.', 502)
  })

  if (res.data.error) {
    const desc = res.data.error_description || res.data.error
    if (desc.includes('bad_verification_code'))
      throw new ApiError('GitHub OAuth code expired or already used. Please sign in again.', 400)
    throw new ApiError(desc, 400)
  }

  return res.data.access_token
}

// ── Get authenticated user ───────────────────────────────
const getUser = async (token) => {
  const cacheKey = `user:${token.slice(-12)}`
  const cached   = cache.get(cacheKey)
  if (cached) return cached

  try {
    const { data } = await gh.get('/user', authHeaders(token))
    cache.set(cacheKey, data, 120)
    return data
  } catch (err) { handleGhError(err) }
}

// ── List repositories ────────────────────────────────────
const listRepos = async (token, page = 1, perPage = 50) => {
  const cacheKey = `repos:${token.slice(-12)}:${page}`
  const cached   = cache.get(cacheKey)
  if (cached) return cached

  try {
    const { data } = await gh.get('/user/repos', {
      ...authHeaders(token),
      params: { sort: 'updated', per_page: perPage, page, affiliation: 'owner,collaborator' },
    })
    cache.set(cacheKey, data, 180)
    return data
  } catch (err) { handleGhError(err) }
}

// ── Get single repo ──────────────────────────────────────
const getRepo = async (token, owner, repo) => {
  const cacheKey = `repo:${owner}/${repo}`
  const cached   = cache.get(cacheKey)
  if (cached) return cached

  try {
    const { data } = await gh.get(`/repos/${owner}/${repo}`, authHeaders(token))
    cache.set(cacheKey, data, 120)
    return data
  } catch (err) { handleGhError(err) }
}

// ── Get repo contents ────────────────────────────────────
const getContents = async (token, owner, repo, path = '') => {
  const cacheKey = `contents:${owner}/${repo}:${path}`
  const cached   = cache.get(cacheKey)
  if (cached) return cached

  try {
    const { data } = await gh.get(`/repos/${owner}/${repo}/contents/${path}`, authHeaders(token))
    const result   = Array.isArray(data) ? data : [data]
    cache.set(cacheKey, result, 90)
    return result
  } catch (err) { handleGhError(err) }
}

// ── Get file content ─────────────────────────────────────
const getFileContent = async (token, owner, repo, path) => {
  try {
    const { data } = await gh.get(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, authHeaders(token))
    if (!data.content) return ''
    return Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8')
  } catch (err) { handleGhError(err) }
}

// ── Recursively get JS/TS files for analysis ─────────────
const SKIP_DIRS = new Set(['node_modules','.git','dist','build','coverage','.next','vendor','__pycache__','.cache'])
const VALID_EXT = ['.js','.jsx','.ts','.tsx','.mjs','.cjs']

const getAnalyzableFiles = async (token, owner, repo, path = '', depth = 0) => {
  if (depth > 4) return []
  let files = []

  try {
    const contents = await getContents(token, owner, repo, path)
    for (const item of contents) {
      if (files.length >= 60) break
      if (item.type === 'dir') {
        if (SKIP_DIRS.has(item.name)) continue
        const sub = await getAnalyzableFiles(token, owner, repo, item.path, depth + 1)
        files.push(...sub)
      } else if (item.type === 'file') {
        const ext = VALID_EXT.find(e => item.name.endsWith(e))
        if (ext && (item.size || 0) < 150_000) files.push(item)
      }
    }
  } catch (err) {
    logger.warn(`Skipped path "${path}": ${err.message}`)
  }

  return files
}

module.exports = { exchangeCode, getUser, listRepos, getRepo, getContents, getFileContent, getAnalyzableFiles }
