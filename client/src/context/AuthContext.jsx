import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const fetchedRef = useRef(false)

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('cs-token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
      setError(null)
    } catch (err) {
      const status = err.response?.status
      if (status === 401 || status === 403) {
        localStorage.removeItem('cs-token')
        setUser(null)
      } else {
        setError('Cannot reach server. Check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchMe()
    }
  }, [fetchMe])

  // Redirect to GitHub OAuth — callback goes to FRONTEND /auth/callback
  const loginWithGitHub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
    if (!clientId || clientId === 'undefined' || clientId === 'your_github_oauth_app_client_id') {
      toast.error('GitHub Client ID not set. Add VITE_GITHUB_CLIENT_ID to client/.env')
      return
    }
    const redirectUri = `${window.location.origin}/auth/callback`
    const params = new URLSearchParams({
      client_id:    clientId,
      redirect_uri: redirectUri,
      scope:        'read:user user:email repo',
    })
    window.location.href = `https://github.com/login/oauth/authorize?${params}`
  }

  const handleToken = useCallback(async (token) => {
    localStorage.setItem('cs-token', token)
    await fetchMe()
  }, [fetchMe])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('cs-token')
    setUser(null)
    toast.success('Signed out successfully')
    window.location.href = '/login'
  }, [])

  const retry = () => { setLoading(true); setError(null); fetchMe() }

  return (
    <AuthContext.Provider value={{
      user, loading, error, loginWithGitHub,
      handleToken, logout, retry,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
