import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, GitBranch, FileSearch, User,
  Settings, Code2, ChevronLeft, ChevronRight, LogOut, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/repos',     icon: GitBranch,       label: 'Repositories' },
  { to: '/reviews',   icon: FileSearch,      label: 'Reviews' },
  { to: '/profile',   icon: User,            label: 'Profile' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
]

export default function Sidebar({ open, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth()

  const SidebarContent = ({ collapsed }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-light-border dark:border-dark-border
                      ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/25">
          <Code2 size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-base leading-none">CodeSense</p>
            <p className="text-xs text-light-text dark:text-dark-text mt-0.5">Code Reviewer</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-light-border dark:border-dark-border space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <img
              src={user.avatarUrl || `https://avatars.githubusercontent.com/u/${user.githubId}`}
              alt={user.name}
              className="w-8 h-8 rounded-full ring-2 ring-light-border dark:ring-dark-border flex-shrink-0"
              onError={e => { e.target.src = 'https://github.com/github.png' }}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-light-text dark:text-dark-text truncate">@{user.githubUsername}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`nav-link w-full text-red-500 hover:bg-red-500/10 hover:text-red-500
                     dark:hover:bg-red-500/10 ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-7 w-6 h-6
                   bg-light-card dark:bg-dark-card2 border border-light-border dark:border-dark-border
                   rounded-full items-center justify-center z-10
                   hover:border-accent hover:text-accent transition-all duration-200
                   text-light-text dark:text-dark-text"
      >
        {open ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col relative flex-shrink-0
                    bg-light-card dark:bg-dark-card
                    border-r border-light-border dark:border-dark-border
                    transition-all duration-300 ease-in-out
                    ${open ? 'w-60' : 'w-16'}`}
      >
        <SidebarContent collapsed={!open} />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col
                         bg-light-card dark:bg-dark-card
                         border-r border-light-border dark:border-dark-border
                         lg:hidden"
            >
              <button
                onClick={onMobileClose}
                className="absolute right-3 top-3 p-2 rounded-lg
                           hover:bg-slate-100 dark:hover:bg-dark-card2
                           text-light-text dark:text-dark-text"
              >
                <X size={16} />
              </button>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
