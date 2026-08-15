import { describe, expect, it } from '@jest/globals'
import {
  cancelMfaChallenge,
  login,
  verifyMfa,
} from '../src/api/auth/mockAuthApi'

describe('mockAuthApi', () => {
  it('rejects invalid credentials without creating an MFA challenge', async () => {
    const result = await login('viewer@example.com', 'wrong-password')

    expect(result).toMatchObject({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Credentials could not be verified. Please try again',
      },
    })
  })

  it('requires the correct MFA code before returning the authenticated user', async () => {
    const loginResult = await login('editor@example.com', 'Editor123!')

    expect(loginResult.success).toBe(true)
    if (!loginResult.success) return

    expect(loginResult.data).toEqual({
      challengeId: expect.any(String),
      maskedEmail: 'e*****@example.com',
    })

    const invalidMfaResult = await verifyMfa(loginResult.data.challengeId, '000000')
    expect(invalidMfaResult).toMatchObject({
      success: false,
      error: { code: 'INVALID_MFA_CODE' },
    })

    const validMfaResult = await verifyMfa(loginResult.data.challengeId, '654321')
    expect(validMfaResult).toEqual({
      success: true,
      data: {
        id: 'user-read-write',
        email: 'editor@example.com',
        name: 'Read Write User',
        role: 'read-write',
      },
    })
  })

  it('cannot reuse a completed MFA challenge', async () => {
    const loginResult = await login('viewer@example.com', 'Viewer123!')
    expect(loginResult.success).toBe(true)
    if (!loginResult.success) return

    await verifyMfa(loginResult.data.challengeId, '123456')
    const reusedChallenge = await verifyMfa(loginResult.data.challengeId, '123456')

    expect(reusedChallenge).toMatchObject({
      success: false,
      error: { code: 'INVALID_CHALLENGE' },
    })
  })

  it('invalidates an abandoned MFA challenge', async () => {
    const loginResult = await login('viewer@example.com', 'Viewer123!')
    expect(loginResult.success).toBe(true)
    if (!loginResult.success) return

    cancelMfaChallenge(loginResult.data.challengeId)
    const cancelledChallenge = await verifyMfa(
      loginResult.data.challengeId,
      '123456',
    )

    expect(cancelledChallenge).toMatchObject({
      success: false,
      error: { code: 'INVALID_CHALLENGE' },
    })
  })
})
