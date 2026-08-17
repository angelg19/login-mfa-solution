import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { cancelPreAuth, submitOtp } from '../api/auth/mockAuthApi'
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
  const authStep = useAuthStore((state) => state.authStep)
  const preAuthToken = useAuthStore((state) => state.preAuthToken)
  const pendingEmail = useAuthStore((state) => state.pendingEmail)
  const completeAuth = useAuthStore((state) => state.completeAuth)
  const resetFlow = useAuthStore((state) => state.resetFlow)

  if (authStep === 'COMPLETE') {
    return <Navigate to="/dashboard" replace />
  }

  if (authStep !== 'OTP_INPUT' || !preAuthToken || !pendingEmail) {
    return <Navigate to="/login" replace />
  }

  const activePreAuthToken = preAuthToken

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await submitOtp(activePreAuthToken, code)

      if (!result.success) {
        if (result.error.code === 'INVALID_PRE_AUTH_TOKEN') {
          resetFlow()
          navigate('/login', {
            replace: true,
            state: { authError: result.error.message },
          })
          return
        }

        setError(result.error.message)
        return
      }

      completeAuth(result.data)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Unable to verify the code right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDifferentAccount() {
    cancelPreAuth(activePreAuthToken)
    resetFlow()
  }

  return (
    <AuthCard
      headingId="mfa-heading"
      eyebrow="Security check"
      title="Verify it's you"
      description={
        <>
          Enter the 6-digit code sent to <strong>{pendingEmail}</strong>.
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
