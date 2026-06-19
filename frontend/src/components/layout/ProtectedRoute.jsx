import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui/index.jsx'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to user's own dashboard
    const roleRoute = { ADMIN: '/admin', TEACHER: '/teacher', STUDENT: '/student', Coordinator: '/admin', Deen: '/admin' }
    return <Navigate to={roleRoute[user?.role] || '/login'} replace />
  }

  return children
}
