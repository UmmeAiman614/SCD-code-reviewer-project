import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { ErrorBoundary } from '../errors/ErrorBoundary'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen]       = useState(true)
  const [mobileSidebarOpen, setMobileOpen]  = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors duration-200">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setMobileOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
