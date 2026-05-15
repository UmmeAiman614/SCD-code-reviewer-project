import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitBranch, Star, GitFork, Lock, Globe, Search, RefreshCw, ChevronRight, Clock } from 'lucide-react'
import { repoService } from '../../services/index'
import { useAsync } from '../../hooks/useAsync'
import { useDebounce } from '../../hooks/useDebounce'
import { RepoCardSkeleton } from '../../components/loaders/Skeletons'
import { ErrorState } from '../../components/errors/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'

const FILTERS = ['All', 'Public', 'Private']
const LANGS   = ['All Languages']

function LanguageDot({ lang }) {
  const colors = { JavaScript:'#f1e05a', TypeScript:'#3178c6', Python:'#3572A5', Go:'#00ADD8', Rust:'#dea584', Ruby:'#701516', Java:'#b07219', CSS:'#563d7c', HTML:'#e34c26' }
  return (
    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/20"
      style={{ background: colors[lang] || '#64748B' }} />
  )
}

function timeAgo(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export default function RepoExplorer() {
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('All')
  const [lang,   setLang]     = useState('All Languages')
  const debouncedSearch = useDebounce(search, 250)

  const { data, loading, error, execute: retry } = useAsync(
    () => repoService.list().then(r => r.data), []
  )

  const repos = data?.repos || []

  const languages = useMemo(() => {
    const langs = [...new Set(repos.map(r => r.language).filter(Boolean))]
    return ['All Languages', ...langs.sort()]
  }, [repos])

  const filtered = useMemo(() => repos.filter(r => {
    const s = debouncedSearch.toLowerCase()
    const matchSearch = !s || r.name.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s)
    const matchFilter = filter === 'All' || (filter === 'Public' ? !r.private : r.private)
    const matchLang   = lang === 'All Languages' || r.language === lang
    return matchSearch && matchFilter && matchLang
  }), [repos, debouncedSearch, filter, lang])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Repositories</h2>
          <p className="page-sub">{repos.length} repositories • click one to analyze</p>
        </div>
        <button onClick={retry} disabled={loading}
          className="btn btn-secondary btn-sm gap-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted" />
          <input className="input pl-9 text-sm" placeholder="Search repositories..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium transition-colors
                ${filter === f ? 'bg-accent text-white' : 'text-light-text dark:text-dark-text hover:text-slate-800 dark:hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
        <select value={lang} onChange={e => setLang(e.target.value)}
          className="input text-sm w-auto min-w-36">
          {languages.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <RepoCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState title="Failed to fetch repositories" message={error} onRetry={retry} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={GitBranch}
          title={repos.length === 0 ? "No repositories found" : "No results"}
          description={repos.length === 0
            ? "Your GitHub repositories will appear here"
            : "Try adjusting your search or filters"
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((repo, i) => (
            <motion.div key={repo.id || repo.name}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.03 }}>
              <Link to={`/repos/${repo.owner?.login || repo.full_name?.split('/')[0]}/${repo.name}`}
                className="card-hover p-5 flex flex-col gap-3 h-full block">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {repo.private
                      ? <Lock size={13} className="text-amber-500 flex-shrink-0" />
                      : <Globe size={13} className="text-green-500 flex-shrink-0" />}
                    <h3 className="font-semibold text-slate-800 dark:text-white truncate text-sm">
                      {repo.name}
                    </h3>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                </div>

                {repo.description && (
                  <p className="text-xs text-light-text dark:text-dark-text line-clamp-2 leading-relaxed">
                    {repo.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-auto pt-1 flex-wrap">
                  {repo.language && (
                    <span className="flex items-center gap-1.5 text-xs text-light-text dark:text-dark-text">
                      <LanguageDot lang={repo.language} /> {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-light-text dark:text-dark-text">
                    <Star size={11} /> {repo.stargazers_count ?? 0}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-light-text dark:text-dark-text">
                    <GitFork size={11} /> {repo.forks_count ?? 0}
                  </span>
                  {repo.updated_at && (
                    <span className="flex items-center gap-1 text-xs text-light-text dark:text-dark-text ml-auto">
                      <Clock size={10} /> {timeAgo(repo.updated_at)}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
