import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach token ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cs-token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle errors globally ───────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || error.message || 'An error occurred'

    if (status === 401) {
      localStorage.removeItem('cs-token')
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/auth')) {
        toast.error('Session expired. Please sign in again.')
        setTimeout(() => { window.location.href = '/login' }, 1500)
      }
    } else if (status === 429) {
      toast.error('Too many requests. Please slow down.')
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    }

    return Promise.reject(error)
  }
)

export default api
