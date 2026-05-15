import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Zap, Shield, Search, GitBranch, Star, ChevronRight, CheckCircle } from 'lucide-react'
import { ThemeToggle } from '../../components/buttons/ThemeToggle'

const FEATURES = [
  { icon: Zap,     title: 'Instant Analysis',   desc: 'Scan entire repositories in seconds with our rule-based engine.' },
  { icon: Shield,  title: 'Security Checks',    desc: 'Detect hardcoded secrets, eval usage, and unsafe patterns.' },
  { icon: Search,  title: 'Deep Code Scan',     desc: 'Line-by-line analysis across all JS/TS files.' },
  { icon: GitBranch, title: 'GitHub Native',    desc: 'OAuth login, repo browser, and file explorer built-in.' },
]

const CHECKS = ['console.log detection', 'Long function warnings', 'Hardcoded secrets', 'Magic numbers', 'Unused variables', 'Duplicate blocks']

export default function Landing() {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-200">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/25">
            <Code2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-lg">CodeSense</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-4 pt-16 pb-20 max-w-4xl mx-auto">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <span className="badge badge-accent mb-6 inline-flex">
            <Star size={12} /> Open Beta — Free to use
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            Ship better code,<br />
            <span className="text-gradient">faster.</span>
          </h1>
          <p className="text-xl text-light-text dark:text-dark-text mb-10 max-w-xl mx-auto leading-relaxed">
            AI-powered code reviews with deep GitHub integration. Catch bugs, security issues, and bad practices before they ship.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/login" className="btn btn-primary btn-lg gap-2.5">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              Sign in with GitHub
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Learn More <ChevronRight size={16} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Everything you need</h2>
          <p className="text-light-text dark:text-dark-text">Built for developers who care about code quality</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i*0.1 }}
              className="card p-6 hover:border-accent/40 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-accent" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-light-text dark:text-dark-text leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What we detect */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">What we detect</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {CHECKS.map(check => (
              <div key={check} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-accent flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{check}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-sm text-light-text dark:text-dark-text border-t border-light-border dark:border-dark-border">
        CodeSense © 2025 — Smart Code Reviewer
      </footer>
    </div>
  )
}
