import type { ReactNode } from 'react'
import BrandHeader from './BrandHeader'
import './AuthCard.css'

interface AuthCardProps {
  headingId: string
  eyebrow: string
  title: string
  description: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export default function AuthCard({
  headingId,
  eyebrow,
  title,
  description,
  children,
  footer,
  className = '',
}: AuthCardProps) {
  return (
    <main className="app-page">
      <section
        className={`surface-card auth-card ${className}`.trim()}
        aria-labelledby={headingId}
      >
        <BrandHeader />

        <header className="auth-card__header">
          <p className="page-eyebrow">{eyebrow}</p>
          <h1 className="page-title" id={headingId}>
            {title}
          </h1>
          <div className="page-description">{description}</div>
        </header>

        {children}

        {footer && <footer className="auth-card__footer">{footer}</footer>}
      </section>
    </main>
  )
}
