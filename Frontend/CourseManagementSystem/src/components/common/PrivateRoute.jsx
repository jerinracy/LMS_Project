import { Navigate, useLocation } from 'react-router-dom'

import LoadingSpinner from './LoadingSpinner'
import { useAuth } from '../../contexts/useAuth'

export default function PrivateRoute({ children, roles }) {
  const { isAuthenticated, isBootstrapping, user } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return <LoadingSpinner label="Checking session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
