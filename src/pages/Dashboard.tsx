import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import BrandHeader from '../shared/components/BrandHeader'
import Button from '../shared/components/Button'
import { useAuthStore } from '../stores/auth'
import './Dashboard.css'

export default function DashboardPage() {
  const [profileDescription, setProfileDescription] = useState(
    'This account can view the current workspace and its assigned resources.',
  )
  const [accessDescription, setAccessDescription] = useState(
    'Use this space to keep a short note about your access needs.',
  )
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const navigate = useNavigate()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const initials = user.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const roleLabel = user.role === 'read-write' ? 'Read & write' : 'Read only'
  const canEdit = user.role === 'read-write'

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="app-page dashboard-page">
      <section className="surface-card dashboard-card" aria-labelledby="dashboard-heading">
        <BrandHeader className="dashboard-brand" />

        <header className="dashboard-header">
          <div>
            <p className="page-eyebrow">Protected dashboard</p>
            <h1 className="page-title" id="dashboard-heading">
              Welcome, {user.name}
            </h1>
            <p className="page-description">
              You have successfully completed multi-factor authentication.
            </p>
          </div>

          <Button variant="secondary" onClick={handleSignOut}>
            Sign out
          </Button>
        </header>

        <div className="profile-card">
          <div
            className={`profile-avatar ${canEdit ? 'profile-avatar--read-write' : ''}`}
            aria-hidden="true"
          >
            {initials}
          </div>

          <div className="profile-details">
            <div className="profile-field">
              <span>Name</span>
              <strong>{user.name}</strong>
            </div>

            <div className="profile-field">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>

            <div className="profile-field">
              <span>Role</span>
              <strong
                className={`role-badge ${canEdit ? 'role-badge--read-write' : ''}`}
              >
                {roleLabel}
              </strong>
            </div>
          </div>
        </div>

        <section
          className="descriptions-section"
          aria-labelledby="descriptions-heading"
        >
          <div className="descriptions-header">
            <div>
              <p className="page-eyebrow">Account notes</p>
              <h2 id="descriptions-heading">Descriptions</h2>
            </div>
            <span className={`access-badge ${canEdit ? 'access-badge--editable' : ''}`}>
              {canEdit ? 'Editable' : 'Read only'}
            </span>
          </div>

          <p className="permission-note" id="description-permission">
            {canEdit
              ? 'Your role allows you to update both descriptions.'
              : 'Your role can view these descriptions but cannot edit them.'}
          </p>

          <div className="description-grid">
            <label className="description-field" htmlFor="profile-description">
              <span>Profile description</span>
              <textarea
                id="profile-description"
                value={profileDescription}
                onChange={(event) => setProfileDescription(event.target.value)}
                readOnly={!canEdit}
                aria-describedby="description-permission"
                rows={3}
                maxLength={180}
              />
            </label>

            <label className="description-field" htmlFor="access-description">
              <span>Access description</span>
              <textarea
                id="access-description"
                value={accessDescription}
                onChange={(event) => setAccessDescription(event.target.value)}
                readOnly={!canEdit}
                aria-describedby="description-permission"
                rows={3}
                maxLength={180}
              />
            </label>
          </div>
        </section>
      </section>
    </main>
  )
}
