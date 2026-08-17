/**
 * This intentionally lightweight pattern catches common formatting mistakes.
 * It does not attempt to prove that an address or domain exists; that would
 * require server-side verification such as sending a confirmation message.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LOWERCASE_PATTERN = /[a-z]/
const UPPERCASE_PATTERN = /[A-Z]/
const SYMBOL_PATTERN = /[^A-Za-z0-9\s]/

export function validateEmail(email: string): string | null {
  const normalizedEmail = email.trim()

  if (!normalizedEmail) {
    return 'Email address is required.'
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return 'Enter a valid email address, such as name@example.com.'
  }

  return null
}

export function validatePassword(password: string): string[] {
  if (!password) {
    return ['Password is required.']
  }

  /**
   * Password validation collects every unmet rule instead of returning after
   * the first failure, allowing the form to tell the user everything that must
   * be corrected in a single attempt.
   */
  const errors: string[] = []

  if (password.length < 8 || password.length > 24) {
    errors.push('Password must be between 8 and 24 characters.')
  }

  if (!LOWERCASE_PATTERN.test(password)) {
    errors.push('Password must include at least one lowercase letter.')
  }

  if (!UPPERCASE_PATTERN.test(password)) {
    errors.push('Password must include at least one uppercase letter.')
  }

  if (!SYMBOL_PATTERN.test(password)) {
    errors.push('Password must include at least one symbol.')
  }

  return errors
}
