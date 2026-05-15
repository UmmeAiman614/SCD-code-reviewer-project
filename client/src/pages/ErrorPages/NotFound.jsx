import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Code2 } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <motion.div
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Code2 size={36} className="text-accent" />
        </div>
        <h1 className="text-7xl font-extrabold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Page not found</h2>
        <p className="text-light-text dark:text-dark-text mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary btn-lg gap-2">
          <Home size={18} /> Go to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}
