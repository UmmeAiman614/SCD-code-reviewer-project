import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle({ className = '' }) {
  const { toggle, isDark } = useTheme()
  return (
    <button
      onClick={toggle}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center
                  hover:bg-slate-100 dark:hover:bg-dark-card2
                  text-slate-600 dark:text-slate-400
                  transition-colors duration-200 ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 30, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
