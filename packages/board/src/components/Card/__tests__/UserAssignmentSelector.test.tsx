import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserAssignmentSelector } from '../UserAssignmentSelector'
import type { User } from '../../../types'

const mockUsers: User[] = [
  { id: 'user-1', name: 'Alex Chen', initials: 'AC', color: '#3B82F6' },
  { id: 'user-2', name: 'Sarah Johnson', initials: 'SJ', color: '#8B5CF6' },
  { id: 'user-3', name: 'Bob Smith', initials: 'BS', color: '#10B981' },
  { id: 'user-4', name: 'Jane Doe', initials: 'JD', color: '#F59E0B' },
  { id: 'user-5', name: 'Mike Wilson', initials: 'MW', color: '#EF4444' },
]

describe('UserAssignmentSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders user icon when no users are assigned', () => {
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByTitle('Assign users')).toBeInTheDocument()
    })

    it('renders assigned user avatars', () => {
      const assignedUsers = [mockUsers[0]!, mockUsers[1]!]
      render(
        <UserAssignmentSelector
          assignedUsers={assignedUsers}
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText('AC')).toBeInTheDocument()
      expect(screen.getByText('SJ')).toBeInTheDocument()
    })

    it('shows +N indicator when more than maxVisibleAvatars', () => {
      const assignedUsers = [mockUsers[0]!, mockUsers[1]!, mockUsers[2]!, mockUsers[3]!]
      render(
        <UserAssignmentSelector
          assignedUsers={assignedUsers}
          availableUsers={mockUsers}
          onChange={vi.fn()}
          maxVisibleAvatars={3}
        />
      )

      expect(screen.getByText('AC')).toBeInTheDocument()
      expect(screen.getByText('SJ')).toBeInTheDocument()
      expect(screen.getByText('BS')).toBeInTheDocument()
      expect(screen.getByText('+1')).toBeInTheDocument()
    })

    it('respects custom maxVisibleAvatars', () => {
      const assignedUsers = [mockUsers[0]!, mockUsers[1]!, mockUsers[2]!]
      render(
        <UserAssignmentSelector
          assignedUsers={assignedUsers}
          availableUsers={mockUsers}
          onChange={vi.fn()}
          maxVisibleAvatars={2}
        />
      )

      expect(screen.getByText('AC')).toBeInTheDocument()
      expect(screen.getByText('SJ')).toBeInTheDocument()
      expect(screen.getByText('+1')).toBeInTheDocument()
      expect(screen.queryByText('BS')).not.toBeInTheDocument()
    })

    it('renders user avatars with correct colors', () => {
      const assignedUsers = [mockUsers[0]!]
      const { container } = render(
        <UserAssignmentSelector
          assignedUsers={assignedUsers}
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      const avatar = container.querySelector('[style*="backgroundColor"]')
      expect(avatar).toHaveStyle({ backgroundColor: '#3B82F6' })
    })
  })

  describe('Menu Interaction', () => {
    it('opens menu when button is clicked', async () => {
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Assign users')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Assign Users')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument()
      })
    })

    it('closes menu when clicking outside', async () => {
      render(
        <div>
          <UserAssignmentSelector availableUsers={mockUsers} onChange={vi.fn()} />
          <div data-testid="outside">Outside</div>
        </div>
      )

      const button = screen.getByTitle('Assign users')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Assign Users')).toBeInTheDocument()
      })

      const outside = screen.getByTestId('outside')
      fireEvent.mouseDown(outside)

      await waitFor(() => {
        expect(screen.queryByText('Assign Users')).not.toBeInTheDocument()
      })
    })

    it('displays all available users in menu', async () => {
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Assign users')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Alex Chen')).toBeInTheDocument()
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
        expect(screen.getByText('Bob Smith')).toBeInTheDocument()
        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
        expect(screen.getByText('Mike Wilson')).toBeInTheDocument()
      })
    })
  })

  describe('User Selection', () => {
    it('calls onChange when user is selected', async () => {
      const onChange = vi.fn()
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={onChange}
        />
      )

      const button = screen.getByTitle('Assign users')
      fireEvent.click(button)

      await waitFor(() => {
        const userOption = screen.getByText('Alex Chen')
        fireEvent.click(userOption)
      })

      expect(onChange).toHaveBeenCalledWith([mockUsers[0]])
    })

    it('calls onChange when user is deselected', async () => {
      const onChange = vi.fn()
      const assignedUsers = [mockUsers[0]!]
      render(
        <UserAssignmentSelector
          assignedUsers={assignedUsers}
          availableUsers={mockUsers}
          onChange={onChange}
        />
      )

      const avatar = screen.getByText('AC')
      fireEvent.click(avatar)

      await waitFor(() => {
        const userOption = screen.getByText('Alex Chen')
        fireEvent.click(userOption)
      })

      expect(onChange).toHaveBeenCalledWith([])
    })

    it('allows multiple user selection', async () => {
      const onChange = vi.fn()
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={onChange}
        />
      )

      const button = screen.getByTitle('Assign users')
      fireEvent.click(button)

      await waitFor(async () => {
        const user1 = screen.getByText('Alex Chen')
        fireEvent.click(user1)

        await waitFor(() => {
          expect(onChange).toHaveBeenCalledWith([mockUsers[0]])
        })

        const user2 = screen.getByText('Sarah Johnson')
        fireEvent.click(user2)
      })

      expect(onChange).toHaveBeenCalledWith([mockUsers[0], mockUsers[1]])
    })

    it('shows checkmark for selected users', async () => {
      const assignedUsers = [mockUsers[0]!]
      render(
        <UserAssignmentSelector
          assignedUsers={assignedUsers}
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      const avatar = screen.getByText('AC')
      fireEvent.click(avatar)

      await waitFor(() => {
        const userOption = screen.getByText('Alex Chen')
        const checkmark = userOption.parentElement?.querySelector('.text-blue-400')
        expect(checkmark).toBeInTheDocument()
        expect(checkmark?.textContent).toBe('✓')
      })
    })
  })

  describe('Search Functionality', () => {
    it('filters users by name', async () => {
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Assign users')
      fireEvent.click(button)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search users...')
        fireEvent.change(searchInput, { target: { value: 'Alex' } })
      })

      await waitFor(() => {
        expect(screen.getByText('Alex Chen')).toBeInTheDocument()
        expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument()
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument()
      })
    })

    it('filters users case-insensitively', async () => {
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Assign users')
      fireEvent.click(button)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search users...')
        fireEvent.change(searchInput, { target: { value: 'SARAH' } })
      })

      await waitFor(() => {
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
        expect(screen.queryByText('Alex Chen')).not.toBeInTheDocument()
      })
    })

    it('shows "No users found" when search has no results', async () => {
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Assign users')
      fireEvent.click(button)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search users...')
        fireEvent.change(searchInput, { target: { value: 'NonexistentUser' } })
      })

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument()
      })
    })

    it('clears search when typing new query', async () => {
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Assign users')
      fireEvent.click(button)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search users...')
        fireEvent.change(searchInput, { target: { value: 'Alex' } })
        fireEvent.change(searchInput, { target: { value: '' } })
      })

      await waitFor(() => {
        expect(screen.getByText('Alex Chen')).toBeInTheDocument()
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      })
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={vi.fn()}
          className="custom-class"
        />
      )
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper button type', () => {
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Assign users')
      expect(button.tagName).toBe('BUTTON')
    })

    it('has hover state on button', () => {
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Assign users')
      expect(button).toHaveClass('hover:bg-white/10')
    })

    it('search input is keyboard accessible', async () => {
      render(
        <UserAssignmentSelector
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Assign users')
      fireEvent.click(button)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search users...')
        expect(searchInput.tagName).toBe('INPUT')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty availableUsers array', () => {
      render(
        <UserAssignmentSelector
          availableUsers={[]}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByTitle('Assign users')).toBeInTheDocument()
    })

    it('handles assignedUsers not in availableUsers', () => {
      const ghostUser: User = {
        id: 'ghost',
        name: 'Ghost User',
        initials: 'GU',
        color: '#999999',
      }

      render(
        <UserAssignmentSelector
          assignedUsers={[ghostUser]}
          availableUsers={mockUsers}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText('GU')).toBeInTheDocument()
    })

    it('handles user with very long name', async () => {
      const longNameUser: User = {
        id: 'long',
        name: 'A'.repeat(100),
        initials: 'AA',
        color: '#3B82F6',
      }

      render(
        <UserAssignmentSelector
          availableUsers={[longNameUser]}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Assign users')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
      })
    })

    it('handles user without avatar', () => {
      const userWithoutAvatar: User = {
        id: 'no-avatar',
        name: 'No Avatar',
        initials: 'NA',
        color: '#3B82F6',
      }

      render(
        <UserAssignmentSelector
          assignedUsers={[userWithoutAvatar]}
          availableUsers={[userWithoutAvatar]}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText('NA')).toBeInTheDocument()
    })

    it('handles maxVisibleAvatars of 0', () => {
      const assignedUsers = [mockUsers[0]!, mockUsers[1]!]
      render(
        <UserAssignmentSelector
          assignedUsers={assignedUsers}
          availableUsers={mockUsers}
          onChange={vi.fn()}
          maxVisibleAvatars={0}
        />
      )

      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('handles maxVisibleAvatars greater than assigned users', () => {
      const assignedUsers = [mockUsers[0]!, mockUsers[1]!]
      render(
        <UserAssignmentSelector
          assignedUsers={assignedUsers}
          availableUsers={mockUsers}
          onChange={vi.fn()}
          maxVisibleAvatars={10}
        />
      )

      expect(screen.getByText('AC')).toBeInTheDocument()
      expect(screen.getByText('SJ')).toBeInTheDocument()
      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument()
    })
  })
})
