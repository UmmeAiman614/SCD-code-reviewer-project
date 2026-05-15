import { motion } from 'framer-motion'
import { Code2 } from 'lucide-react'

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center
                    bg-light-bg dark:bg-dark-bg">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
            <Code2 size={32} className="text-accent" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-accent/30 animate-ping" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-accent"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </div>
          <p className="text-sm text-light-text dark:text-dark-text font-medium">{message}</p>
        </div>
      </motion.div>
    </div>
  )
}
