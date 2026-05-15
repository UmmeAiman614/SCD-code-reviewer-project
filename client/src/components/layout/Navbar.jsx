import { Menu, Bell, Search } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { ThemeToggle } from '../buttons/ThemeToggle'
import { useAuth } from '../../context/AuthContext'

const BREADCRUMBS = {
  '/dashboard': 'Dashboard',
  '/repos':     'Repositories',
  '/reviews':   'Reviews',
  '/profile':   'Profile',
  '/settings':  'Settings',
}

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const title = Object.entries(BREADCRUMBS).find(([k]) => pathname.startsWith(k))?.[1] ?? 'CodeSense'

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6
                       bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md
                       border-b border-light-border dark:border-dark-border
                       transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card2
                     text-light-text dark:text-dark-text transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-semibold text-slate-900 dark:text-white text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card2
                           text-light-text dark:text-dark-text transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>

        {user && (
          <Link to="/profile" className="ml-1">
            <img
              src={user.avatarUrl || `https://avatars.githubusercontent.com/u/${user.githubId}`}
              alt={user.name}
              className="w-8 h-8 rounded-full ring-2 ring-light-border dark:ring-dark-border
                         hover:ring-accent transition-all duration-200"
              onError={e => { e.target.src = 'https://github.com/github.png' }}
            />
          </Link>
        )}
      </div>
    </header>
  )
}
