import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

export default function PublicOnlyRoute() {
  const status = useAuthStore((state) => state.status)

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  if (status === 'awaiting-mfa') {
    return <Navigate to="/mfa" replace />
  }

  return <Outlet />
}
