import { type User } from '../../stores/auth'

/**
 * This module acts as the backend boundary for the exercise. Its database and
 * pending sessions live only in browser memory, so they demonstrate request
 * sequencing rather than production-grade authentication or persistence.
 */

export interface AuthError {
  code:
    | 'INVALID_CREDENTIALS'
    | 'INVALID_MFA_CODE'
    | 'INVALID_PRE_AUTH_TOKEN'
    | 'EMAIL_IN_USE'
  message: string
}

/**
 * A discriminated result keeps expected authentication failures in the normal
 * return path while still allowing unexpected failures to reject the promise.
 */
export type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: AuthError }

export interface PasswordSubmission {
  preAuthToken: string
  pendingEmail: string
}

export interface SignUpSubmission {
  name: string
  email: string
  password: string
}

/** Private API record. Password and MFA secrets are never returned to the UI. */
interface MockUser extends User {
  password: string
  mfaCode: string
}

interface PendingAuthentication {
  userId: string
}

const MOCK_DELAY_MS = 500

const mockUsers: readonly MockUser[] = [
  {
    id: 'user-read-only',
    email: 'viewer@example.com',
    password: 'Viewer123!',
    mfaCode: '123456',
    name: 'Read Only User',
    role: 'read-only',
  },
  {
    id: 'user-read-write',
    email: 'editor@example.com',
    password: 'Editor123!',
    mfaCode: '654321',
    name: 'Read Write User',
    role: 'read-write',
  },
]

/**
 * Simulates a server-side pre-authentication cache. The client receives only
 * the random token; the token resolves to a user ID here without putting a
 * password, OTP, or unverified User object in Zustand.
 */
const pendingAuthentications = new Map<string, PendingAuthentication>()

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

/** Explicitly strips API-only credential fields before crossing into UI state. */
function toPublicUser(user: MockUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

export async function submitPassword(
  email: string,
  password: string,
): Promise<AuthResult<PasswordSubmission>> {
  await wait(MOCK_DELAY_MS)

  // Email matching is normalized, while passwords remain exact and case-sensitive.
  const normalizedEmail = email.trim().toLowerCase()
  const user = mockUsers.find(
    (candidate) =>
      candidate.email.toLowerCase() === normalizedEmail &&
      candidate.password === password,
  )

  if (!user) {
    return {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Credentials could not be verified. Please try again',
      },
    }
  }

  /**
   * Successful password verification creates an opaque, short-lived handle.
   * At this point the user has passed only the first factor and must not receive
   * a public profile or authenticated client state.
   */
  const preAuthToken = crypto.randomUUID()
  pendingAuthentications.set(preAuthToken, { userId: user.id })

  return {
    success: true,
    data: {
      preAuthToken,
      pendingEmail: user.email,
    },
  }
}

/**
 * Simulates the availability check a registration endpoint would perform.
 * Successful submissions are intentionally not added to mockUsers because the
 * assignment requires only a navigable sign-up demonstration, not persistence.
 */
export async function submitSignUp({
  email,
}: SignUpSubmission): Promise<AuthResult<null>> {
  await wait(MOCK_DELAY_MS)

  const normalizedEmail = email.trim().toLowerCase()
  const emailIsInUse = mockUsers.some(
    (candidate) => candidate.email.toLowerCase() === normalizedEmail,
  )

  if (emailIsInUse) {
    return {
      success: false,
      error: {
        code: 'EMAIL_IN_USE',
        message: 'An account with this email address already exists.',
      },
    }
  }

  return { success: true, data: null }
}

export async function submitOtp(
  preAuthToken: string,
  code: string,
): Promise<AuthResult<User>> {
  await wait(MOCK_DELAY_MS)

  // Token validation links this request to the user who passed step one.
  const pendingAuthentication = pendingAuthentications.get(preAuthToken)

  if (!pendingAuthentication) {
    return {
      success: false,
      error: {
        code: 'INVALID_PRE_AUTH_TOKEN',
        message: 'Your verification session is no longer valid. Please sign in again.',
      },
    }
  }

  const user = mockUsers.find(
    (candidate) => candidate.id === pendingAuthentication.userId,
  )

  /**
   * An incorrect code does not consume the token, allowing the user to retry.
   * A missing user is treated like a bad code so internal records are not
   * exposed through a more specific response.
   */
  if (!user || user.mfaCode !== code.trim()) {
    return {
      success: false,
      error: {
        code: 'INVALID_MFA_CODE',
        message: 'The verification code is incorrect.',
      },
    }
  }

  // Burn the token before returning success so a completed challenge cannot be replayed.
  pendingAuthentications.delete(preAuthToken)

  return {
    success: true,
    data: toPublicUser(user),
  }
}

export function cancelPreAuth(preAuthToken: string): void {
  // Abandoning MFA invalidates the API-side handle as well as resetting the UI.
  pendingAuthentications.delete(preAuthToken)
}
