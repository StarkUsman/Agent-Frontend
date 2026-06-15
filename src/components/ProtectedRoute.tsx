import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../contexts/CurrentUserContext'
import type { Permission } from '../lib/permissions'

interface ProtectedRouteProps {
  children: ReactNode
  permission?: Permission
  fallback?: string
}

const ProtectedRoute = ({ children, permission, fallback = '/dashboard' }: ProtectedRouteProps) => {
  const { hasPermission } = useCurrentUser()

  if (!localStorage.getItem('access_token')) {
    return <Navigate to="/" replace />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
