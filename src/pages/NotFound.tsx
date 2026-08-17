import { useNavigate } from 'react-router-dom'
import AuthCard from '../shared/components/AuthCard'
import Button from '../shared/components/Button'
import { useAuthStore } from '../stores/auth'
import './NotFound.css'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const authStep = useAuthStore((state) => state.authStep)
  const destination =
    authStep === 'COMPLETE'
      ? { path: '/dashboard', label: 'Return to dashboard' }
      : authStep === 'OTP_INPUT'
        ? { path: '/mfa', label: 'Return to verification' }
        : { path: '/login', label: 'Return to sign in' }

  return (
    <AuthCard
      headingId="not-found-heading"
      eyebrow="Error 404"
      title="Page not found"
      description="The page you requested does not exist or may have been moved."
      className="not-found-card"
    >
      <Button
        fullWidth
        onClick={() => navigate(destination.path, { replace: true })}
      >
        {destination.label}
      </Button>
    </AuthCard>
  )
}
