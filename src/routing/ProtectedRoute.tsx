import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

export default function ProtectedRoute() {
  const authStep = useAuthStore((state) => state.authStep)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (authStep === 'OTP_INPUT') {
    return <Navigate to="/mfa" replace />
  }

  if (authStep !== 'COMPLETE' || !isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
