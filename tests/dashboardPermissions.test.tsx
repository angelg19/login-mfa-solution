import { beforeEach, describe, expect, it } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../src/pages/Dashboard'
import { useAuthStore, type User } from '../src/stores/auth'

function renderDashboard(user: User) {
  useAuthStore.setState({
    user,
    pendingChallenge: null,
    status: 'authenticated',
  })

  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  )
}

describe('Dashboard permissions', () => {
  beforeEach(() => {
    useAuthStore.getState().signOut()
  })

  it('prevents a read-only user from editing either description', async () => {
    const user = userEvent.setup()
    renderDashboard({
      id: 'user-read-only',
      email: 'viewer@example.com',
      name: 'Read Only User',
      role: 'read-only',
    })

    const profileDescription = screen.getByLabelText('Profile description')
    const originalValue = (profileDescription as HTMLTextAreaElement).value

    expect(screen.getAllByText('Read only')).toHaveLength(2)
    expect(profileDescription).toHaveAttribute('readonly')
    expect(screen.getByLabelText('Access description')).toHaveAttribute('readonly')

    await user.type(profileDescription, 'Changed')
    expect(profileDescription).toHaveValue(originalValue)
  })

  it('allows a read/write user to edit both descriptions', async () => {
    const user = userEvent.setup()
    renderDashboard({
      id: 'user-read-write',
      email: 'editor@example.com',
      name: 'Read Write User',
      role: 'read-write',
    })

    const profileDescription = screen.getByLabelText('Profile description')
    const accessDescription = screen.getByLabelText('Access description')

    expect(screen.getByText('Editable')).toBeInTheDocument()
    expect(profileDescription).not.toHaveAttribute('readonly')
    expect(accessDescription).not.toHaveAttribute('readonly')

    await user.clear(profileDescription)
    await user.type(profileDescription, 'Updated profile description')
    await user.clear(accessDescription)
    await user.type(accessDescription, 'Updated access description')

    expect(profileDescription).toHaveValue('Updated profile description')
    expect(accessDescription).toHaveValue('Updated access description')
  })
})
