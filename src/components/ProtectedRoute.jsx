import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoadingSpinner = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-border border-t-primary rounded-full animate-spin" />
      <p className="text-slate-400 text-sm font-dm">Loading Printzo…</p>
    </div>
  </div>
)

export const ProtectedRoute = ({ children, role }) => {
  const { user, userData, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/auth" replace />
  if (role && userData?.role !== role) {
    return <Navigate to={userData?.role === 'retailer' ? '/retailer' : '/customer'} replace />
  }

  return children
}

export const PublicRoute = ({ children }) => {
  const { user, userData, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (user && userData) {
    return <Navigate to={userData.role === 'retailer' ? '/retailer' : '/customer'} replace />
  }

  return children
}
