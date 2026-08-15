import { useState, type InputHTMLAttributes } from 'react'
import './PasswordInput.css'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export default function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)
  const actionLabel = isVisible ? 'Hide password' : 'Show password'

  return (
    <div className="password-input">
      <input type={isVisible ? 'text' : 'password'} {...props} />
      <button
        className="password-input__toggle"
        type="button"
        aria-label={actionLabel}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}
      >
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}
