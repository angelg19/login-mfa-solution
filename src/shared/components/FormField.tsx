import type { ReactNode } from 'react'
import './FormField.css'

interface FormFieldProps {
  id: string
  label: string
  children: ReactNode
  action?: ReactNode
  hint?: ReactNode
  error?: string | readonly string[] | null
}

export default function FormField({
  id,
  label,
  children,
  action,
  hint,
  error,
}: FormFieldProps) {
  const errors = error == null ? [] : typeof error === 'string' ? [error] : error

  return (
    <div className="form-field">
      <div className="form-field__label-row">
        <label htmlFor={id}>{label}</label>
        {action}
      </div>
      {children}
      {hint && <div className="form-field__hint">{hint}</div>}
      {errors.length > 0 && (
        <div className="form-field__error" id={`${id}-error`} role="alert">
          {errors.length === 1 ? (
            errors[0]
          ) : (
            <ul>
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
