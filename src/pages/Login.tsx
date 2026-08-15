import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth/mockAuthApi'
import AuthCard from '../shared/components/AuthCard'
import Button from '../shared/components/Button'
import FormError from '../shared/components/FormError'
import FormField from '../shared/components/FormField'
import PasswordInput from '../shared/components/PasswordInput'
import { useAuthStore } from '../stores/auth'
import { validateEmail, validatePassword } from '../validation/authValidation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const navigate = useNavigate()
  const beginMfa = useAuthStore((state) => state.beginMfa)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const nextEmailError = validateEmail(email)
    const nextPasswordErrors = validatePassword(password)
    setEmailTouched(true)
    setPasswordTouched(true)
    setEmailError(nextEmailError)
    setPasswordErrors(nextPasswordErrors)

    if (nextEmailError || nextPasswordErrors.length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await login(email, password)

      if (!result.success) {
        setError(result.error.message)
        return
      }

      beginMfa(result.data)
      navigate('/mfa')
    } catch {
      setError('Unable to sign in right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      headingId="login-heading"
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Enter your credentials to continue securely."
      footer={
        <p>
          Don&apos;t have an account? <Link to="/signup">Create one</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField id="email" label="Email address" error={emailError}>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              const nextEmail = event.target.value
              setError('')
              setEmail(nextEmail)
              if (emailTouched) {
                setEmailError(validateEmail(nextEmail))
              }
            }}
            onBlur={() => {
              setEmailTouched(true)
              setEmailError(validateEmail(email))
            }}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'email-error' : undefined}
            required
          />
        </FormField>

        <FormField id="password" label="Password" error={passwordErrors}>
          <PasswordInput
            id="password"
            name="password"
            value={password}
            onChange={(event) => {
              const nextPassword = event.target.value
              setError('')
              setPassword(nextPassword)
              if (passwordTouched) {
                setPasswordErrors(validatePassword(nextPassword))
              }
            }}
            onBlur={() => {
              setPasswordTouched(true)
              setPasswordErrors(validatePassword(password))
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            aria-invalid={passwordErrors.length > 0}
            aria-describedby={passwordErrors.length > 0 ? 'password-error' : undefined}
            minLength={8}
            required
          />
        </FormField>

        <FormError message={error} />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  )
}
