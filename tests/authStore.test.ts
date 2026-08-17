import { beforeEach, describe, it } from '@jest/globals'
import { useAuthStore, type User } from '../src/stores/auth'

const user: User = {
  id: 'user-read-write',
  email: 'editor@example.com',
  name: 'Read Write User',
  role: 'read-write',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().resetFlow()
  })

  it('tracks pre-authentication data without authenticating the user', () => {
    useAuthStore.getState().beginOtp('pre-auth-token', 'editor@example.com')

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      isAuthenticated: false,
      authStep: 'OTP_INPUT',
      preAuthToken: 'pre-auth-token',
      pendingEmail: 'editor@example.com',
    })
  })

  it('authenticates only after OTP verification is completed', () => {
    useAuthStore.getState().beginOtp('pre-auth-token', 'editor@example.com')
    useAuthStore.getState().completeAuth(user)

    expect(useAuthStore.getState()).toMatchObject({
      user,
      isAuthenticated: true,
      authStep: 'COMPLETE',
      preAuthToken: null,
      pendingEmail: null,
    })
  })

  it('clears the authenticated session and flow state on reset', () => {
    useAuthStore.getState().completeAuth(user)
    useAuthStore.getState().resetFlow()

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      isAuthenticated: false,
      authStep: 'PASSWORD_INPUT',
      preAuthToken: null,
      pendingEmail: null,
    })
  })
})
