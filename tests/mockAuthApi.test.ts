import { describe, it } from '@jest/globals'
import {
  cancelPreAuth,
  submitOtp,
  submitPassword,
  submitSignUp,
} from '../src/api/auth/mockAuthApi'

describe('mockAuthApi', () => {
  it('rejects sign-up when the normalized email already belongs to a mock user', async () => {
    const result = await submitSignUp({
      name: 'Another User',
      email: '  VIEWER@example.com ',
      password: 'Password123!',
    })

    expect(result).toEqual({
      success: false,
      error: {
        code: 'EMAIL_IN_USE',
        message: 'An account with this email address already exists.',
      },
    })
  })

  it('accepts an unused sign-up email without persisting an account', async () => {
    const submission = {
      name: 'Sample User',
      email: 'sample@example.com',
      password: 'Password123!',
    }

    await expect(submitSignUp(submission)).resolves.toEqual({
      success: true,
      data: null,
    })
    await expect(submitSignUp(submission)).resolves.toEqual({
      success: true,
      data: null,
    })
  })

  it('rejects invalid credentials without creating a pre-authentication token', async () => {
    const result = await submitPassword('viewer@example.com', 'wrong-password')

    expect(result).toMatchObject({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Credentials could not be verified. Please try again',
      },
    })
  })

  it('requires the correct OTP before returning the authenticated user', async () => {
    const passwordResult = await submitPassword(
      'editor@example.com',
      'Editor123!',
    )

    expect(passwordResult.success).toBe(true)
    if (!passwordResult.success) return

    expect(passwordResult.data).toEqual({
      preAuthToken: expect.any(String),
      pendingEmail: 'editor@example.com',
    })

    const invalidOtpResult = await submitOtp(
      passwordResult.data.preAuthToken,
      '000000',
    )
    expect(invalidOtpResult).toMatchObject({
      success: false,
      error: { code: 'INVALID_MFA_CODE' },
    })

    const validOtpResult = await submitOtp(
      passwordResult.data.preAuthToken,
      '654321',
    )
    expect(validOtpResult).toEqual({
      success: true,
      data: {
        id: 'user-read-write',
        email: 'editor@example.com',
        name: 'Read Write User',
        role: 'read-write',
      },
    })
  })

  it('cannot reuse a completed pre-authentication token', async () => {
    const passwordResult = await submitPassword(
      'viewer@example.com',
      'Viewer123!',
    )
    expect(passwordResult.success).toBe(true)
    if (!passwordResult.success) return

    await submitOtp(passwordResult.data.preAuthToken, '123456')
    const reusedToken = await submitOtp(
      passwordResult.data.preAuthToken,
      '123456',
    )

    expect(reusedToken).toMatchObject({
      success: false,
      error: { code: 'INVALID_PRE_AUTH_TOKEN' },
    })
  })

  it('invalidates an abandoned pre-authentication token', async () => {
    const passwordResult = await submitPassword(
      'viewer@example.com',
      'Viewer123!',
    )
    expect(passwordResult.success).toBe(true)
    if (!passwordResult.success) return

    cancelPreAuth(passwordResult.data.preAuthToken)
    const cancelledToken = await submitOtp(
      passwordResult.data.preAuthToken,
      '123456',
    )

    expect(cancelledToken).toMatchObject({
      success: false,
      error: { code: 'INVALID_PRE_AUTH_TOKEN' },
    })
  })
})
