import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileSearch, GitBranch, Clock, Trash2, ChevronRight, AlertTriangle } from 'lucide-react'
import { reviewService } from '../../services/index'
import { useAsync } from '../../hooks/useAsync'
import { TableRowSkeleton } from '../../components/loaders/Skeletons'
import { ErrorState } from '../../components/errors/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { ScoreRing } from '../../components/common/ScoreRing'
import toast from 'react-hot-toast'

export default function ReviewList() {
  const { data, loading, error, execute: retry, setData } =
    useAsync(() => reviewService.list().then(r => r.data), [])

  const handleDelete = async (e, id) => {
    e.preventDefault()
    if (!confirm('Delete this review?')) return
    try {
      await reviewService.delete(id)
      setData(prev => ({ ...prev, reviews: prev.reviews.filter(r => r._id !== id) }))
      toast.success('Review deleted')
    } catch {
      toast.error('Failed to delete review')
    }
  }

  const reviews = data?.reviews || []

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Code Reviews</h2>
          <p className="page-sub">{reviews.length} review{reviews.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/repos" className="btn btn-primary btn-sm gap-2">
          <GitBranch size={14} /> New Review
        </Link>
      </div>

      {loading ? <TableRowSkeleton rows={6} /> :
       error   ? <ErrorState title="Failed to load reviews" message={error} onRetry={retry} /> :
       reviews.length === 0 ? (
         <EmptyState icon={FileSearch} title="No reviews yet"
           description="Analyze a repository to get your first code review"
           action={<Link to="/repos" className="btn btn-primary btn-sm">Browse Repositories</Link>} />
       ) : (
         <div className="card divide-y divide-light-border dark:divide-dark-border overflow-hidden">
           {reviews.map((review, i) => (
             <motion.div key={review._id}
               initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.04 }}>
               <Link to={`/reviews/${review._id}`}
                 className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-dark-card2
                            transition-colors group">
                 <ScoreRing score={review.score ?? 0} size={48} stroke={5} />
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                     <GitBranch size={13} className="text-accent flex-shrink-0" />
                     <span className="font-medium text-slate-800 dark:text-white text-sm truncate">
                       {review.repoName}
                     </span>
                   </div>
                   <div className="flex items-center gap-3 text-xs text-light-text dark:text-dark-text flex-wrap">
                     <span className="flex items-center gap-1">
                       <Clock size={10} /> {new Date(review.createdAt).toLocaleDateString('en-US', { dateStyle:'medium' })}
                     </span>
                     <span className="flex items-center gap-1">
                       <AlertTriangle size={10} /> {review.issues?.length ?? 0} issues
                     </span>
                     <span className="badge badge-success">{review.status}</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-1">
                   <button onClick={e => handleDelete(e, review._id)}
                     className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500
                                transition-colors opacity-0 group-hover:opacity-100">
                     <Trash2 size={14} />
                   </button>
                   <ChevronRight size={16} className="text-slate-400 group-hover:text-accent transition-colors" />
                 </div>
               </Link>
             </motion.div>
           ))}
         </div>
       )}
    </div>
  )
}
