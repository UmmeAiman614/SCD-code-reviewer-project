import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitBranch, FileSearch, AlertTriangle, Zap, ChevronRight, Clock, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { reviewService } from '../../services/index'
import { useAsync } from '../../hooks/useAsync'
import { StatSkeleton, TableRowSkeleton } from '../../components/loaders/Skeletons'
import { ErrorState } from '../../components/errors/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { ScoreRing } from '../../components/common/ScoreRing'

function StatCard({ icon: Icon, label, value, color, delay, to }) {
  const inner = (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ delay }}
      className="card-hover p-5 cursor-default"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value ?? '–'}</p>
      <p className="text-sm text-light-text dark:text-dark-text">{label}</p>
    </motion.div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function Dashboard() {
  const { user } = useAuth()

  const { data: stats, loading: statsLoading, error: statsError, execute: retryStats } =
    useAsync(() => reviewService.stats().then(r => r.data), [])

  const { data: reviewsData, loading: reviewsLoading, error: reviewsError, execute: retryReviews } =
    useAsync(() => reviewService.list({ limit: 5 }).then(r => r.data), [])

  const greeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="animate-fade-in">
        <h2 className="page-title">
          {greeting()}, {user?.name?.split(' ')[0] || 'Developer'} 👋
        </h2>
        <p className="page-sub">Here's your code quality overview</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : statsError ? (
        <ErrorState title="Couldn't load stats" message={statsError} onRetry={retryStats} type="warn" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileSearch}    label="Total Reviews"   value={stats?.totalReviews}  color="bg-accent/10 text-accent"         delay={0}    to="/reviews" />
          <StatCard icon={GitBranch}     label="Repos Analyzed"  value={stats?.reposAnalyzed} color="bg-blue-500/10 text-blue-500"     delay={0.05} to="/repos" />
          <StatCard icon={AlertTriangle} label="Issues Found"    value={stats?.totalIssues}   color="bg-amber-500/10 text-amber-500"   delay={0.1} />
          <StatCard icon={Zap}           label="Avg Score"       value={stats?.avgScore ? `${stats.avgScore}/10` : '–'} color="bg-green-500/10 text-green-500" delay={0.15} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent reviews */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-900 dark:text-white">Recent Reviews</h3>
              <Link to="/reviews" className="text-xs text-accent hover:underline flex items-center gap-1">
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {reviewsLoading ? <TableRowSkeleton rows={4} /> :
             reviewsError   ? <ErrorState message={reviewsError} onRetry={retryReviews} /> :
             !reviewsData?.reviews?.length ? (
               <EmptyState icon={FileSearch} title="No reviews yet"
                 description="Analyze a repository to get your first review"
                 action={<Link to="/repos" className="btn btn-primary btn-sm">Browse Repos</Link>} />
             ) : (
               <div className="space-y-1">
                 {reviewsData.reviews.map(review => (
                   <Link key={review._id} to={`/reviews/${review._id}`}
                     className="flex items-center gap-4 p-3 rounded-xl
                                hover:bg-slate-50 dark:hover:bg-dark-card2
                                transition-colors group">
                     <ScoreRing score={review.score ?? 0} size={44} stroke={5} />
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{review.repoName}</p>
                       <p className="text-xs text-light-text dark:text-dark-text flex items-center gap-1 mt-0.5">
                         <Clock size={10} />
                         {new Date(review.createdAt).toLocaleDateString()} · {review.issues?.length ?? 0} issues
                       </p>
                     </div>
                     <ChevronRight size={14} className="text-slate-400 group-hover:text-accent transition-colors" />
                   </Link>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Quick actions + tip */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { to:'/repos',    icon: GitBranch,  label: 'Browse Repositories', accent: true },
                { to:'/reviews',  icon: FileSearch, label: 'View All Reviews',    accent: false },
              ].map(({ to, icon: Icon, label, accent }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group
                    ${accent
                      ? 'bg-accent/5 border-accent/20 hover:bg-accent/10'
                      : 'bg-slate-50 dark:bg-dark-card2 border-light-border dark:border-dark-border hover:border-accent/30'
                    }`}>
                  <Icon size={16} className={accent ? 'text-accent' : 'text-light-text dark:text-dark-text'} />
                  <span className="text-sm font-medium text-slate-800 dark:text-white flex-1">{label}</span>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-accent transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="card p-5 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent"
          >
            <div className="w-8 h-8 bg-accent/15 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp size={16} className="text-accent" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Pro Tip</p>
            <p className="text-xs text-light-text dark:text-dark-text leading-relaxed">
              Run reviews regularly to maintain a high quality score and catch bugs before they reach production.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
