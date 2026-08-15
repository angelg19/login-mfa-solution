import './FormError.css'

interface FormErrorProps {
  message: string
}

export default function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null
  }

  return (
    <p className="form-error" role="alert">
      {message}
    </p>
  )
}
