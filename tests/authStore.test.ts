import { beforeEach, describe, expect, it } from '@jest/globals'
import { useAuthStore, type MfaChallenge, type User } from '../src/stores/auth'

const challenge: MfaChallenge = {
  challengeId: 'challenge-1',
  maskedEmail: 'e*****@example.com',
}

const user: User = {
  id: 'user-read-write',
  email: 'editor@example.com',
  name: 'Read Write User',
  role: 'read-write',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().signOut()
  })

  it('tracks the MFA challenge without authenticating the user', () => {
    useAuthStore.getState().beginMfa(challenge)

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      pendingChallenge: challenge,
      status: 'awaiting-mfa',
    })
  })

  it('authenticates only after MFA is completed', () => {
    useAuthStore.getState().beginMfa(challenge)
    useAuthStore.getState().completeMfa(user)

    expect(useAuthStore.getState()).toMatchObject({
      user,
      pendingChallenge: null,
      status: 'authenticated',
    })
  })

  it('clears the authenticated session on sign out', () => {
    useAuthStore.getState().completeMfa(user)
    useAuthStore.getState().signOut()

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      pendingChallenge: null,
      status: 'signed-out',
    })
  })
})
