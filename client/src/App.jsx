import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ErrorBoundary } from './components/errors/ErrorBoundary'
import AppLayout from './components/layout/AppLayout'
import LoadingScreen from './components/common/LoadingScreen'

// Lazy-loaded pages
const Landing      = lazy(() => import('./pages/Auth/Landing'))
const Login        = lazy(() => import('./pages/Auth/Login'))
const AuthCallback = lazy(() => import('./pages/Auth/AuthCallback'))
const Dashboard    = lazy(() => import('./pages/Dashboard/Dashboard'))
const RepoExplorer = lazy(() => import('./pages/Repository/RepoExplorer'))
const RepoDetail   = lazy(() => import('./pages/Repository/RepoDetail'))
const ReviewList   = lazy(() => import('./pages/Review/ReviewList'))
const ReviewDetail = lazy(() => import('./pages/Review/ReviewDetail'))
const Profile      = lazy(() => import('./pages/Profile/Profile'))
const Settings     = lazy(() => import('./pages/Settings/Settings'))
const NotFound     = lazy(() => import('./pages/ErrorPages/NotFound'))

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/"  element={<GuestRoute><Landing /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected - inside layout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard"          element={<Dashboard />} />
          <Route path="/repos"              element={<RepoExplorer />} />
          <Route path="/repos/:owner/:repo" element={<RepoDetail />} />
          <Route path="/reviews"            element={<ReviewList />} />
          <Route path="/reviews/:id"        element={<ReviewDetail />} />
          <Route path="/profile"            element={<Profile />} />
          <Route path="/settings"           element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg, #0F172A)',
                color: 'var(--toast-text, #fff)',
                border: '1px solid var(--toast-border, #1E293B)',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
