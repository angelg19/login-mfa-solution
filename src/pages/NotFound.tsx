import { useNavigate } from 'react-router-dom'
import AuthCard from '../shared/components/AuthCard'
import Button from '../shared/components/Button'
import './NotFound.css'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <AuthCard
      headingId="not-found-heading"
      eyebrow="Error 404"
      title="Page not found"
      description="The page you requested does not exist or may have been moved."
      className="not-found-card"
    >
      <Button fullWidth onClick={() => navigate('/login', { replace: true })}>
        Return to sign in
      </Button>
    </AuthCard>
  )
}
