import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, getDashboardForRole } from '../../context/AuthContext'
import Loader from '../common/Loader'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <Loader fullPage message="Verifying authentication..." />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to the dashboard appropriate for their actual role
    const correctDashboard = getDashboardForRole(user.role)
    return <Navigate to={correctDashboard} replace />
  }

  return children
}
