/**
 * Auth Store
 *
 * Holds client-side authentication and UI state. Mock API behavior remains in
 * api/auth/mockAuthApi.ts so this store does not simulate backend concerns.
 */

import { create } from 'zustand'

/**
 * The client-side authentication state machine. Route guards use this value to
 * decide which screen is valid; changing steps does not itself verify a user.
 * Only a successful response from the mock API should advance the flow.
 */
export type AuthStep = 'PASSWORD_INPUT' | 'OTP_INPUT' | 'COMPLETE'
export type UserRole = 'read-only' | 'read-write'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  authStep: AuthStep

  /**
   * Temporary data needed to continue step two. The token is an opaque handle
   * to API-owned state, so credentials and the pending user profile never need
   * to be copied into the client store before MFA succeeds.
   */
  preAuthToken: string | null
  pendingEmail: string | null

  beginOtp: (preAuthToken: string, pendingEmail: string) => void
  completeAuth: (user: User) => void
  resetFlow: () => void
}

const initialAuthState = {
  user: null,
  isAuthenticated: false,
  authStep: 'PASSWORD_INPUT' as const,
  preAuthToken: null,
  pendingEmail: null,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialAuthState,

  /**
   * Password verification succeeded, but the user is not authenticated yet.
   * Clearing any existing user prevents stale authenticated data from
   * surviving when a new MFA flow begins.
   */
  beginOtp: (preAuthToken, pendingEmail) =>
    set({
      user: null,
      isAuthenticated: false,
      authStep: 'OTP_INPUT',
      preAuthToken,
      pendingEmail,
    }),

  /**
   * OTP verification is the only transition that installs the public user and
   * marks the session complete. Pre-authentication data is discarded because
   * its token is single-use and has already been consumed by the API.
   */
  completeAuth: (user) =>
    set({
      user,
      isAuthenticated: true,
      authStep: 'COMPLETE',
      preAuthToken: null,
      pendingEmail: null,
    }),

  /**
   * Returns client state to the first step for sign-out or a fresh login. If an
   * MFA attempt is being abandoned, its API-side token must also be cancelled
   * through cancelPreAuth before this client reference is removed.
   */
  resetFlow: () => set(initialAuthState),
}))
