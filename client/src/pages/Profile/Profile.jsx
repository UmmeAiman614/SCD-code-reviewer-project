import { motion } from 'framer-motion'
import { Github, Mail, Calendar, Code2, Star, ExternalLink, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { reviewService } from '../../services/index'
import { useAsync } from '../../hooks/useAsync'
import { StatSkeleton } from '../../components/loaders/Skeletons'

export default function Profile() {
  const { user, logout } = useAuth()
  const { data: stats, loading } = useAsync(() => reviewService.stats().then(r => r.data), [])

  if (!user) return null

  return (
    <div className="page max-w-2xl">
      {/* Profile card */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="card p-6">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <img
              src={user.avatarUrl || `https://avatars.githubusercontent.com/u/${user.githubId}`}
              alt={user.name}
              className="w-20 h-20 rounded-2xl ring-2 ring-light-border dark:ring-dark-border"
              onError={e => { e.target.src = 'https://github.com/github.png' }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-light-card dark:border-dark-card" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-light-text dark:text-dark-text text-sm">@{user.githubUsername}</p>
            {user.bio && <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">{user.bio}</p>}
            <div className="flex flex-wrap gap-3 mt-3">
              {user.email && (
                <span className="flex items-center gap-1.5 text-xs text-light-text dark:text-dark-text">
                  <Mail size={12} /> {user.email}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-light-text dark:text-dark-text">
                <Calendar size={12} />
                Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month:'long', year:'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap mt-5 pt-5 border-t border-light-border dark:border-dark-border">
          <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-secondary btn-sm gap-2">
            <Github size={14} /> View GitHub <ExternalLink size={12} />
          </a>
          <button onClick={logout} className="btn btn-danger btn-sm gap-2">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4"><StatSkeleton /><StatSkeleton /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5 text-center">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Code2 size={18} className="text-accent" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalReviews ?? 0}</p>
            <p className="text-sm text-light-text dark:text-dark-text mt-1">Total Reviews</p>
          </div>
          <div className="card p-5 text-center">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star size={18} className="text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {stats?.avgScore ? `${stats.avgScore}/10` : '–'}
            </p>
            <p className="text-sm text-light-text dark:text-dark-text mt-1">Avg Score</p>
          </div>
        </div>
      )}

      {/* Account info */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Account Information</h3>
        <div className="space-y-1">
          {[
            { label: 'GitHub Username', value: `@${user.githubUsername}` },
            { label: 'Display Name',   value: user.name },
            { label: 'Email',          value: user.email || 'Not provided' },
            { label: 'Auth Method',    value: 'GitHub OAuth 2.0' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-3 border-b border-light-border dark:border-dark-border last:border-0">
              <span className="text-sm text-light-text dark:text-dark-text">{label}</span>
              <span className="text-sm font-medium text-slate-800 dark:text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
