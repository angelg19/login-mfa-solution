import './BrandHeader.css'

interface BrandHeaderProps {
  className?: string
}

export default function BrandHeader({ className = '' }: BrandHeaderProps) {
  return (
    <div className={`brand-header ${className}`.trim()} aria-label="Login MFA UI Flow">
      <img
        className="brand-header__logo"
        src="/favicon-mfa.png"
        width="44"
        height="44"
        alt=""
      />
      <span className="brand-header__title">Login MFA UI Flow</span>
    </div>
  )
}
