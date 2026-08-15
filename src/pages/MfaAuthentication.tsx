import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { cancelMfaChallenge, verifyMfa } from '../api/auth/mockAuthApi'
import AuthCard from '../shared/components/AuthCard'
import Button from '../shared/components/Button'
import FormError from '../shared/components/FormError'
import FormField from '../shared/components/FormField'
import { useAuthStore } from '../stores/auth'
import './MfaAuthentication.css'

export default function MfaAuthenticationPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const pendingChallenge = useAuthStore((state) => state.pendingChallenge)
  const status = useAuthStore((state) => state.status)
  const completeMfa = useAuthStore((state) => state.completeMfa)
  const signOut = useAuthStore((state) => state.signOut)

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  if (!pendingChallenge) {
    return <Navigate to="/login" replace />
  }

  const challenge = pendingChallenge

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await verifyMfa(challenge.challengeId, code)

      if (!result.success) {
        setError(result.error.message)
        return
      }

      completeMfa(result.data)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Unable to verify the code right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDifferentAccount() {
    cancelMfaChallenge(challenge.challengeId)
    signOut()
  }

  return (
    <AuthCard
      headingId="mfa-heading"
      eyebrow="Security check"
      title="Verify it's you"
      description={
        <>
          Enter the 6-digit code sent to <strong>{challenge.maskedEmail}</strong>.
        </>
      }
      className="mfa-card"
      footer={
        <p>
          Not your account?{' '}
          <Link to="/login" onClick={handleDifferentAccount}>
            Return to sign in
          </Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <FormField
          id="verification-code"
          label="Verification code"
          hint={<p id="code-hint">The code expires after this browser session.</p>}
        >
          <input
            className="mfa-code-input"
            id="verification-code"
            name="verification-code"
            type="text"
            value={code}
            onChange={(event) => {
              setError('')
              setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
            }}
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            aria-describedby="code-hint"
            autoFocus
            required
          />
        </FormField>

        <FormError message={error} />

        <Button
          type="submit"
          fullWidth
          disabled={isSubmitting || code.length !== 6}
        >
          {isSubmitting ? 'Verifying...' : 'Verify and continue'}
        </Button>
      </form>
    </AuthCard>
  )
}
