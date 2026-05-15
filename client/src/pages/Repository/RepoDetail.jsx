import { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, GitFork, Eye, Play, Folder, FileCode, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { repoService, reviewService } from '../../services/index'
import { useAsync } from '../../hooks/useAsync'
import { CardSkeleton } from '../../components/loaders/Skeletons'
import { ErrorState } from '../../components/errors/ErrorState'
import toast from 'react-hot-toast'

export default function RepoDetail() {
  const { owner, repo } = useParams()
  const navigate        = useNavigate()
  const [path, setPath] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  // Fetch repo metadata
  const { data: repoData, loading: repoLoading, error: repoError, execute: retryRepo } =
    useAsync(() => repoService.get(owner, repo).then(r => r.data?.repo), [owner, repo])

  // Fetch file tree (re-fetches when path changes)
  const { data: files, loading: filesLoading, error: filesError, execute: retryFiles } =
    useAsync(
      useCallback(() => repoService.files(owner, repo, path).then(r => r.data?.files || []), [owner, repo, path]),
      [owner, repo, path]
    )

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const { data } = await reviewService.analyze(owner, repo)
      toast.success('Analysis complete!')
      navigate(`/reviews/${data.review._id}`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed. Please try again.'
      toast.error(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  const navigatePath = (newPath) => setPath(newPath)
  const goUp = () => {
    const parts = path.split('/').filter(Boolean)
    parts.pop()
    setPath(parts.join('/'))
  }

  const pathParts = path.split('/').filter(Boolean)

  if (repoLoading) return (
    <div className="page">
      <div className="grid gap-4"><CardSkeleton /><CardSkeleton /></div>
    </div>
  )

  if (repoError) return (
    <div className="page">
      <ErrorState title="Failed to load repository" message={repoError} onRetry={retryRepo} />
    </div>
  )

  return (
    <div className="page">
      <button onClick={() => navigate('/repos')}
        className="flex items-center gap-2 text-sm text-light-text dark:text-dark-text hover:text-accent transition-colors">
        <ArrowLeft size={14} /> Back to Repositories
      </button>

      {/* Repo header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {owner}/{repo}
            </h2>
            {repoData?.description && (
              <p className="text-sm text-light-text dark:text-dark-text mb-3">{repoData.description}</p>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              {repoData?.language && (
                <span className="badge badge-accent">{repoData.language}</span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-light-text dark:text-dark-text">
                <Star size={13} className="text-amber-500" /> {repoData?.stargazers_count ?? 0}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-light-text dark:text-dark-text">
                <GitFork size={13} /> {repoData?.forks_count ?? 0}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-light-text dark:text-dark-text">
                <Eye size={13} /> {repoData?.watchers_count ?? 0}
              </span>
            </div>
          </div>

          <button onClick={handleAnalyze} disabled={analyzing} className="btn btn-primary gap-2">
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {analyzing ? 'Analyzing…' : 'Analyze Repository'}
          </button>
        </div>
      </motion.div>

      {/* File browser */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        transition={{ delay:0.1 }} className="card p-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm font-mono mb-4 flex-wrap">
          <button onClick={() => navigatePath('')}
            className="text-accent hover:underline">{repo}</button>
          {pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-light-muted dark:text-dark-muted" />
              <button
                onClick={() => navigatePath(pathParts.slice(0, i+1).join('/'))}
                className="text-accent hover:underline">{part}</button>
            </span>
          ))}
        </div>

        {filesError ? (
          <ErrorState title="Couldn't load files" message={filesError} onRetry={retryFiles} />
        ) : filesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : (
          <div className="divide-y divide-light-border dark:divide-dark-border">
            {path && (
              <button onClick={goUp}
                className="flex items-center gap-3 py-2.5 px-2 w-full text-left
                           hover:bg-slate-50 dark:hover:bg-dark-card2 rounded-lg transition-colors
                           text-light-text dark:text-dark-text text-sm">
                <Folder size={15} className="text-blue-400" /> ..
              </button>
            )}
            {!files?.length && !path && (
              <div className="flex items-center gap-2 py-6 text-sm text-light-text dark:text-dark-text">
                <AlertCircle size={15} /> This repository appears to be empty
              </div>
            )}
            {(files || []).map(file => (
              <div key={file.path || file.name}
                className="flex items-center gap-3 py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-dark-card2
                           rounded-lg transition-colors cursor-pointer"
                onClick={() => file.type === 'dir' && navigatePath(file.path)}>
                {file.type === 'dir'
                  ? <Folder size={15} className="text-blue-400 flex-shrink-0" />
                  : <FileCode size={15} className="text-light-muted dark:text-dark-muted flex-shrink-0" />}
                <span className={`text-sm font-mono flex-1 ${file.type === 'dir' ? 'text-slate-800 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                  {file.name}
                </span>
                {file.size != null && file.type !== 'dir' && (
                  <span className="text-xs text-light-muted dark:text-dark-muted">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
