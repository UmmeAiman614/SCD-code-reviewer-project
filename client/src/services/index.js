import api from './api'

// ── Auth ──────────────────────────────────────────────────
export const authService = {
  me:     ()      => api.get('/auth/me'),
  logout: ()      => api.post('/auth/logout'),
  exchangeToken: (code) => api.post('/auth/github/exchange', { code }),
}

// ── Repos ─────────────────────────────────────────────────
export const repoService = {
  list:       (page = 1, perPage = 30) =>
    api.get('/repos', { params: { page, per_page: perPage } }),

  get:        (owner, repo) =>
    api.get(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`),

  files:      (owner, repo, path = '') =>
    api.get(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents`, {
      params: { path },
    }),

  fileContent: (owner, repo, path) =>
    api.get(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/file`, {
      params: { path },
    }),
}

// ── Reviews ────────────────────────────────────────────────
export const reviewService = {
  analyze:    (owner, repo) => api.post('/reviews/analyze', { owner, repo }),
  list:       (params)      => api.get('/reviews', { params }),
  get:        (id)          => api.get(`/reviews/${id}`),
  delete:     (id)          => api.delete(`/reviews/${id}`),
  stats:      ()            => api.get('/reviews/stats'),
}
