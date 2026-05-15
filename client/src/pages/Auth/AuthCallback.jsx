import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingScreen from '../../components/common/LoadingScreen'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function AuthCallback() {
  const [params]        = useSearchParams()
  const { handleToken } = useAuth()
  const navigate        = useNavigate()
  const ranRef          = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const code  = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      navigate('/login?error=oauth_denied', { replace: true })
      return
    }

    api.post('/auth/github/callback', { code })
      .then(({ data }) => {
        return handleToken(data.token).then(() => {
          toast.success(`Welcome, ${data.user?.name?.split(' ')[0] || 'Developer'}! 🎉`)
          navigate('/dashboard', { replace: true })
        })
      })
      .catch(err => {
        const status = err.response?.status
        if (status === 429) navigate('/login?error=rate_limit', { replace: true })
        else if (status === 400) navigate('/login?error=code_expired', { replace: true })
        else navigate('/login?error=oauth_failed', { replace: true })
      })
  }, []) // eslint-disable-line

  return <LoadingScreen message="Completing GitHub sign in…" />
}
