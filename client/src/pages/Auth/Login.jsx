import { motion } from 'framer-motion'
import { Code2, Github, Zap, Shield, GitBranch, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle } from '../../components/buttons/ThemeToggle'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

const PERKS = [
  { icon: Zap,       text: 'Instant repo analysis' },
  { icon: Shield,    text: 'Security vulnerability detection' },
  { icon: GitBranch, text: 'Full GitHub integration' },
]

const ERROR_MESSAGES = {
  oauth_denied:  'GitHub login was cancelled.',
  oauth_failed:  'GitHub OAuth failed. Please try again.',
  code_expired:  'Login link expired. Please try again.',
  rate_limit:    'Too many requests. Please wait a moment.',
  server_error:  'Server error during login. Please try again.',
}

export default function Login() {
  const { loginWithGitHub } = useAuth()
  const [params] = useSearchParams()

  useEffect(() => {
    const err = params.get('error')
    if (err && ERROR_MESSAGES[err]) toast.error(ERROR_MESSAGES[err])
  }, [params])

  return (
    <div className="min-h-screen flex bg-light-bg dark:bg-dark-bg transition-colors duration-200">
      {/* Left decorative panel (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-dark-bg">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(228,74,40,0.25) 0%, transparent 65%)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/30">
            <Code2 size={20} className="text-white" />
          </div>
          <span className="font-bold text-white text-xl">CodeSense</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-5">
            Review code<br />
            <span className="bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent">
              like a pro.
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xs leading-relaxed">
            Catch bugs before they ship. Automated reviews powered by smart static analysis.
          </p>
          <div className="space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="w-9 h-9 bg-accent/15 border border-accent/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-accent" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">CodeSense © 2025</p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/25">
              <Code2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">CodeSense</span>
          </div>

          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border
                          rounded-2xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome back</h1>
            <p className="text-sm text-light-text dark:text-dark-text mb-8">
              Sign in with your GitHub account to continue
            </p>

            <button
              onClick={loginWithGitHub}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5
                         bg-slate-900 hover:bg-slate-800
                         dark:bg-white dark:hover:bg-slate-100
                         text-white dark:text-slate-900
                         font-semibold rounded-xl transition-all duration-200
                         active:scale-95 shadow-lg"
            >
              <Github size={20} />
              Continue with GitHub
            </button>

            <div className="mt-5 p-4 bg-slate-50 dark:bg-dark-card2 rounded-xl
                            border border-light-border dark:border-dark-border">
              <div className="flex items-start gap-2">
                <AlertCircle size={13} className="text-light-muted dark:text-dark-muted mt-0.5 flex-shrink-0" />
                <p className="text-xs text-light-text dark:text-dark-text leading-relaxed">
                  We request <strong>read-only</strong> access to your repositories.
                  Your code is never stored permanently.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-light-muted dark:text-dark-muted mt-6">
            CodeSense — Smart Code Reviewer
          </p>
        </motion.div>
      </div>
    </div>
  )
}
