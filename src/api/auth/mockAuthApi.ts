import { type MfaChallenge, type User } from '../../stores/auth'

export interface AuthError {
  code: 'INVALID_CREDENTIALS' | 'INVALID_MFA_CODE' | 'INVALID_CHALLENGE'
  message: string
}

export type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: AuthError }

interface MockUser extends User {
  password: string
  mfaCode: string
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

const pendingChallenges = new Map<string, string>()

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  const visibleCharacter = localPart.charAt(0)
  const hiddenCharacters = '*'.repeat(Math.max(localPart.length - 1, 1))

  return `${visibleCharacter}${hiddenCharacters}@${domain}`
}

function toPublicUser(user: MockUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResult<MfaChallenge>> {
  await wait(MOCK_DELAY_MS)

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

  const challengeId = crypto.randomUUID()
  pendingChallenges.set(challengeId, user.id)

  return {
    success: true,
    data: {
      challengeId,
      maskedEmail: maskEmail(user.email),
    },
  }
}

export async function verifyMfa(
  challengeId: string,
  code: string,
): Promise<AuthResult<User>> {
  await wait(MOCK_DELAY_MS)

  const userId = pendingChallenges.get(challengeId)

  if (!userId) {
    return {
      success: false,
      error: {
        code: 'INVALID_CHALLENGE',
        message: 'Your verification session is no longer valid. Please sign in again.',
      },
    }
  }

  const user = mockUsers.find((candidate) => candidate.id === userId)

  if (!user || user.mfaCode !== code.trim()) {
    return {
      success: false,
      error: {
        code: 'INVALID_MFA_CODE',
        message: 'The verification code is incorrect.',
      },
    }
  }

  pendingChallenges.delete(challengeId)

  return {
    success: true,
    data: toPublicUser(user),
  }
}

export function cancelMfaChallenge(challengeId: string): void {
  pendingChallenges.delete(challengeId)
}
