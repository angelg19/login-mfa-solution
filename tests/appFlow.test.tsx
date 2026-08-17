import { afterEach, beforeEach, describe, it, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App'
import * as mockAuthApi from '../src/api/auth/mockAuthApi'
import { useAuthStore } from '../src/stores/auth'

describe('application authentication flow', () => {
  beforeEach(() => {
    useAuthStore.getState().resetFlow()
    window.history.pushState({}, '', '/login')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('navigates to the separate Sign Up screen and completes the mock flow', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('link', { name: 'Create one' }))
    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Full name'), 'Sample User')
    await user.type(screen.getByLabelText('Email address'), 'sample@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password123!')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByRole('heading', { name: 'Account details received' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Thanks, Sample User.')).toBeInTheDocument()
  })

  it('shows an error when Sign Up uses an existing mock account email', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/signup')
    render(<App />)

    await user.type(screen.getByLabelText('Full name'), 'Existing User')
    await user.type(screen.getByLabelText('Email address'), 'VIEWER@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password123!')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByText('An account with this email address already exists.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Create an account' }),
    ).toBeInTheDocument()
  })

  it('recovers when the Sign Up request unexpectedly fails', async () => {
    jest.spyOn(mockAuthApi, 'submitSignUp').mockRejectedValueOnce(
      new Error('Network failure'),
    )
    const user = userEvent.setup()
    window.history.pushState({}, '', '/signup')
    render(<App />)

    await user.type(screen.getByLabelText('Full name'), 'Sample User')
    await user.type(screen.getByLabelText('Email address'), 'sample@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password123!')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByText(
        'Unable to submit your details right now. Please try again.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('completes login and MFA before showing the protected Dashboard', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Email address'), 'editor@example.com')
    await user.type(screen.getByLabelText('Password'), 'Editor123!')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', { name: "Verify it's you" }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('Verification code'), '654321')
    await user.click(screen.getByRole('button', { name: 'Verify and continue' }))

    expect(
      await screen.findByRole('heading', { name: 'Welcome, Read Write User' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Read & write')).toBeInTheDocument()
  })

  it('shows each email and password issue that needs to be fixed', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByText('Email address is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Email address'), 'invalid-email')
    await user.type(screen.getByLabelText('Password'), 'short')

    expect(
      screen.getByText('Enter a valid email address, such as name@example.com.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Password must be between 8 and 24 characters.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Password must include at least one uppercase letter.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Password must include at least one symbol.'),
    ).toBeInTheDocument()
  })

  it('allows the password to be shown and hidden', async () => {
    const user = userEvent.setup()
    render(<App />)

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('recovers when the login request unexpectedly fails', async () => {
    jest.spyOn(mockAuthApi, 'submitPassword').mockRejectedValueOnce(new Error('Network failure'))
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Email address'), 'editor@example.com')
    await user.type(screen.getByLabelText('Password'), 'Editor123!')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText('Unable to sign in right now. Please try again.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  })

  it('recovers when the MFA request unexpectedly fails', async () => {
    useAuthStore.getState().beginOtp('pre-auth-token', 'editor@example.com')
    window.history.pushState({}, '', '/mfa')
    jest.spyOn(mockAuthApi, 'submitOtp').mockRejectedValueOnce(new Error('Network failure'))
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Verification code'), '654321')
    await user.click(screen.getByRole('button', { name: 'Verify and continue' }))

    expect(
      await screen.findByText('Unable to verify the code right now. Please try again.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Verify and continue' })).toBeEnabled()
  })

  it('redirects a signed-out visitor away from the Dashboard', () => {
    window.history.pushState({}, '', '/dashboard')
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Sign in to your account' })).toBeInTheDocument()
  })

  it.each(['/login', '/signup'])(
    'redirects an authenticated user away from %s',
    (route) => {
      useAuthStore.setState({
        user: {
          id: 'user-read-write',
          email: 'editor@example.com',
          name: 'Read Write User',
          role: 'read-write',
        },
        isAuthenticated: true,
        authStep: 'COMPLETE',
        preAuthToken: null,
        pendingEmail: null,
      })
      window.history.pushState({}, '', route)
      render(<App />)

      expect(
        screen.getByRole('heading', { name: 'Welcome, Read Write User' }),
      ).toBeInTheDocument()
    },
  )

  it('shows a Not Found page for an unknown route and returns to login', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/does-not-exist')
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Return to sign in' }))
    expect(screen.getByRole('heading', { name: 'Sign in to your account' })).toBeInTheDocument()
  })

  it('returns an authenticated user from Not Found to the Dashboard', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().completeAuth({
      id: 'user-read-write',
      email: 'editor@example.com',
      name: 'Read Write User',
      role: 'read-write',
    })
    window.history.pushState({}, '', '/does-not-exist')
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Return to dashboard' }))

    expect(
      screen.getByRole('heading', { name: 'Welcome, Read Write User' }),
    ).toBeInTheDocument()
  })

  it('does not offer an unsupported Forgot Password action', () => {
    render(<App />)

    expect(screen.queryByText('Forgot password?')).not.toBeInTheDocument()
  })
})
