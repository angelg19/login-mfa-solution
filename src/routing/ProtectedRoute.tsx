import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

export default function ProtectedRoute() {
  const { status } = useAuthStore()

  if (status === 'awaiting-mfa') {
    return <Navigate to="/mfa" replace />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
