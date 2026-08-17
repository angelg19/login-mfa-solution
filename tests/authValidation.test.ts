import { describe, it } from '@jest/globals'
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../src/validation/authValidation'

describe('auth validation', () => {
  describe('validateName', () => {
    it('requires a name', () => {
      expect(validateName('')).toEqual(['Full name is required.'])
    })

    it('reports length and character violations together', () => {
      expect(validateName('1')).toEqual([
        'Full name must be between 2 and 36 characters.',
        'Full name can contain only letters, spaces, hyphens, apostrophes, and periods.',
      ])
    })

    it('rejects names longer than 36 characters', () => {
      expect(validateName('A'.repeat(37))).toContain(
        'Full name must be between 2 and 36 characters.',
      )
    })

    it.each(['Anne-Marie', "D'Angelo", 'O’Connor', 'J. Smith', 'José Álvarez'])(
      'accepts valid name punctuation and Unicode letters in %s',
      (name) => {
        expect(validateName(name)).toEqual([])
      },
    )
  })

  describe('validateEmail', () => {
    it('requires an email address', () => {
      expect(validateEmail('')).toBe('Email address is required.')
    })

    it('rejects an invalid email format', () => {
      expect(validateEmail('not-an-email')).toBe(
        'Enter a valid email address, such as name@example.com.',
      )
    })

    it('accepts a valid email format', () => {
      expect(validateEmail('person@example.com')).toBeNull()
    })
  })

  describe('validatePassword', () => {
    it('reports every unmet password requirement', () => {
      expect(validatePassword('short')).toEqual([
        'Password must be between 8 and 24 characters.',
        'Password must include at least one uppercase letter.',
        'Password must include at least one symbol.',
      ])
    })

    it('rejects passwords longer than 24 characters', () => {
      expect(validatePassword(`ValidPassword!${'a'.repeat(20)}`)).toContain(
        'Password must be between 8 and 24 characters.',
      )
    })

    it('reports missing lowercase, uppercase, and symbol requirements', () => {
      expect(validatePassword('UPPERCASE!')).toContain(
        'Password must include at least one lowercase letter.',
      )
      expect(validatePassword('lowercase!')).toContain(
        'Password must include at least one uppercase letter.',
      )
      expect(validatePassword('Password123')).toContain(
        'Password must include at least one symbol.',
      )
    })

    it('accepts a password that meets every requirement', () => {
      expect(validatePassword('ValidPassword!')).toEqual([])
    })
  })
})
