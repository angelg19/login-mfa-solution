import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { submitSignUp } from '../api/auth/mockAuthApi'
import AuthCard from '../shared/components/AuthCard'
import Button from '../shared/components/Button'
import FormError from '../shared/components/FormError'
import FormField from '../shared/components/FormField'
import PasswordInput from '../shared/components/PasswordInput'
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../validation/authValidation'
import './SignUp.css'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [nameErrors, setNameErrors] = useState<string[]>([])
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [emailTouched, setEmailTouched] = useState(false)
  const [nameTouched, setNameTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRequestError('')

    const nextNameErrors = validateName(name)
    const nextEmailError = validateEmail(email)
    const nextPasswordErrors = validatePassword(password)
    setNameTouched(true)
    setNameErrors(nextNameErrors)
    setEmailTouched(true)
    setPasswordTouched(true)
    setEmailError(nextEmailError)
    setPasswordErrors(nextPasswordErrors)

    if (
      nextNameErrors.length > 0 ||
      nextEmailError ||
      nextPasswordErrors.length > 0
    ) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitSignUp({
        name: name.trim(),
        email,
        password,
      })

      if (!result.success) {
        if (result.error.code === 'EMAIL_IN_USE') {
          setEmailError(result.error.message)
          return
        }

        setRequestError(result.error.message)
        return
      }

      setIsComplete(true)
    } catch {
      setRequestError('Unable to submit your details right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <AuthCard
        headingId="signup-complete-heading"
        eyebrow="Demo complete"
        title="Account details received"
        description="Registration is mocked for this exercise, so no account was saved."
      >
        <div className="signup-confirmation" role="status">
          <strong>Thanks, {name}.</strong>
          <p>Return to sign in with one of the supplied mock accounts.</p>
        </div>

        <Button fullWidth onClick={() => navigate('/login', { replace: true })}>
          Return to sign in
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      headingId="signup-heading"
      eyebrow="Get started"
      title="Create an account"
      description="Enter a few details to preview the sign-up experience."
      footer={
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField id="signup-name" label="Full name" error={nameErrors}>
          <input
            id="signup-name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => {
              const nextName = event.target.value
              setName(nextName)
              setRequestError('')
              if (nameTouched) {
                setNameErrors(validateName(nextName))
              }
            }}
            onBlur={() => {
              setNameTouched(true)
              setNameErrors(validateName(name))
            }}
            placeholder="Your name"
            autoComplete="name"
            aria-invalid={nameErrors.length > 0}
            aria-describedby={
              nameErrors.length > 0 ? 'signup-name-error' : undefined
            }
            required
          />
        </FormField>

        <FormField id="signup-email" label="Email address" error={emailError}>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              const nextEmail = event.target.value
              setEmail(nextEmail)
              setRequestError('')
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
            aria-describedby={emailError ? 'signup-email-error' : undefined}
            required
          />
        </FormField>

        <FormField id="signup-password" label="Password" error={passwordErrors}>
          <PasswordInput
            id="signup-password"
            name="password"
            value={password}
            onChange={(event) => {
              const nextPassword = event.target.value
              setPassword(nextPassword)
              setRequestError('')
              if (passwordTouched) {
                setPasswordErrors(validatePassword(nextPassword))
              }
            }}
            onBlur={() => {
              setPasswordTouched(true)
              setPasswordErrors(validatePassword(password))
            }}
            placeholder="Create a password"
            autoComplete="new-password"
            aria-invalid={passwordErrors.length > 0}
            aria-describedby={
              passwordErrors.length > 0 ? 'signup-password-error' : undefined
            }
            minLength={8}
            required
          />
        </FormField>

        <p className="signup-disclaimer">
          Demo only: these details will not be stored or used to create an account.
        </p>

        <FormError message={requestError} />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Checking details...' : 'Continue'}
        </Button>
      </form>
    </AuthCard>
  )
}
