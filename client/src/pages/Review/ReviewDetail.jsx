import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, GitBranch, Clock, AlertTriangle, XCircle, Info, ChevronDown, Filter, FileCode } from 'lucide-react'
import { reviewService } from '../../services/index'
import { useAsync } from '../../hooks/useAsync'
import { CardSkeleton } from '../../components/loaders/Skeletons'
import { ErrorState } from '../../components/errors/ErrorState'
import { ScoreRing } from '../../components/common/ScoreRing'

const SEV_CONFIG = {
  critical: { cls: 'badge-critical', Icon: XCircle,       bg: 'bg-red-500/5 border-red-500/20' },
  warning:  { cls: 'badge-warning',  Icon: AlertTriangle, bg: 'bg-amber-500/5 border-amber-500/20' },
  info:     { cls: 'badge-info',     Icon: Info,          bg: '' },
}

function IssueCard({ issue }) {
  const [open, setOpen] = useState(false)
  const { cls, Icon, bg } = SEV_CONFIG[issue.severity] || SEV_CONFIG.info

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${bg || 'border-light-border dark:border-dark-border'}`}>
      <button className="w-full flex items-start gap-3 p-4 text-left" onClick={() => setOpen(o => !o)}>
        <Icon size={15} className={`mt-0.5 flex-shrink-0 ${
          issue.severity === 'critical' ? 'text-red-500' :
          issue.severity === 'warning'  ? 'text-amber-500' : 'text-blue-500'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cls}>{issue.severity}</span>
            <span className="text-sm font-medium text-slate-800 dark:text-white">{issue.rule}</span>
            {issue.file && (
              <span className="flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted font-mono">
                <FileCode size={10} /> {issue.file.split('/').pop()}
                {issue.line ? `:${issue.line}` : ''}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{issue.message}</p>
        </div>
        <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && issue.suggestion && (
          <motion.div
            initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-light-border dark:border-dark-border">
              <p className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wide mt-3 mb-1.5">
                Suggestion
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{issue.suggestion}</p>
              {issue.code && (
                <pre className="mt-2 p-3 bg-slate-900 rounded-lg text-xs font-mono text-green-400 overflow-x-auto">
                  {issue.code}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ReviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sevFilter, setSevFilter] = useState('all')

  const { data: review, loading, error, execute: retry } =
    useAsync(() => reviewService.get(id).then(r => r.data?.review), [id])

  if (loading) return <div className="page"><div className="space-y-4"><CardSkeleton /><CardSkeleton /></div></div>
  if (error)   return <div className="page"><ErrorState title="Review not found" message={error} onRetry={retry} /></div>
  if (!review) return null

  const issues  = review.issues || []
  const filtered = sevFilter === 'all' ? issues : issues.filter(i => i.severity === sevFilter)
  const counts   = { critical: issues.filter(i=>i.severity==='critical').length, warning: issues.filter(i=>i.severity==='warning').length, info: issues.filter(i=>i.severity==='info').length }

  return (
    <div className="page">
      <button onClick={() => navigate('/reviews')}
        className="flex items-center gap-2 text-sm text-light-text dark:text-dark-text hover:text-accent transition-colors">
        <ArrowLeft size={14} /> Back to Reviews
      </button>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="card p-6">
        <div className="flex items-start gap-6 flex-wrap">
          <ScoreRing score={review.score ?? 0} size={92} stroke={8} label="Quality Score" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch size={16} className="text-accent" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{review.repoName}</h2>
            </div>
            <p className="text-sm text-light-text dark:text-dark-text flex items-center gap-1.5 mb-4">
              <Clock size={12} />
              {new Date(review.createdAt).toLocaleDateString('en-US', { dateStyle:'long' })}
              · {review.filesScanned ?? 0} files · {review.linesScanned ?? 0} lines
            </p>

            <div className="flex gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 badge-critical">
                <XCircle size={12} /> {counts.critical} Critical
              </span>
              <span className="flex items-center gap-1.5 badge-warning">
                <AlertTriangle size={12} /> {counts.warning} Warnings
              </span>
              <span className="flex items-center gap-1.5 badge-info">
                <Info size={12} /> {counts.info} Info
              </span>
            </div>
          </div>
        </div>

        {review.summary && (
          <div className="mt-5 pt-5 border-t border-light-border dark:border-dark-border">
            <p className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wide mb-2">Summary</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.summary}</p>
          </div>
        )}
      </motion.div>

      {/* Issues */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Filter size={15} className="text-accent" />
            Issues ({filtered.length})
          </h3>
          <div className="flex rounded-xl overflow-hidden border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
            {['all','critical','warning','info'].map(s => (
              <button key={s} onClick={() => setSevFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors
                  ${sevFilter === s ? 'bg-accent text-white' : 'text-light-text dark:text-dark-text hover:text-slate-800 dark:hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-light-text dark:text-dark-text text-sm">No issues for this filter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((issue, i) => (
              <motion.div key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.02 }}>
                <IssueCard issue={issue} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
