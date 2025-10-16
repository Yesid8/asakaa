import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CardDetailModalV2 } from '../CardDetailModalV2'
import type { Card, User, Column, Activity, Comment } from '../../../types'

const mockCard: Card = {
  id: 'card-1',
  title: 'Test Card Title',
  description: 'This is a **bold** test description with *italic* and `code`',
  position: 1000,
  columnId: 'col-1',
  priority: 'HIGH',
  labels: ['bug', 'urgent'],
  assignedUserIds: ['user-1', 'user-2'],
  startDate: '2025-10-01',
  endDate: '2025-10-15',
  estimatedTime: 8,
}

const mockUsers: User[] = [
  { id: 'user-1', name: 'Alex Chen', initials: 'AC', color: '#3B82F6' },
  { id: 'user-2', name: 'Sarah Johnson', initials: 'SJ', color: '#8B5CF6' },
  { id: 'user-3', name: 'Bob Smith', initials: 'BS', color: '#10B981' },
]

const mockColumns: Column[] = [
  { id: 'col-1', title: 'To Do', position: 0, cards: [] },
  { id: 'col-2', title: 'In Progress', position: 1, cards: [] },
  { id: 'col-3', title: 'Done', position: 2, cards: [] },
]

const mockComments: Comment[] = [
  {
    id: 'comment-1',
    cardId: 'card-1',
    userId: 'user-1',
    content: 'This is a test comment',
    timestamp: new Date('2025-10-10T10:00:00'),
  },
]

const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    cardId: 'card-1',
    userId: 'current-user',
    type: 'CARD_UPDATED',
    timestamp: new Date('2025-10-10T09:00:00'),
    newValue: 'Updated card status',
  },
]

const mockCurrentUser: User = {
  id: 'current-user',
  name: 'Current User',
  initials: 'CU',
  color: '#F59E0B',
}

describe('CardDetailModalV2', () => {
  const defaultProps = {
    card: mockCard,
    isOpen: true,
    onClose: vi.fn(),
    onUpdate: vi.fn(),
    availableUsers: mockUsers,
    comments: mockComments,
    activities: mockActivities,
    onAddComment: vi.fn(),
    currentUser: mockCurrentUser,
    availableColumns: mockColumns,
    availableLabels: ['bug', 'feature', 'urgent', 'enhancement'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders modal when open', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('Test Card Title')).toBeInTheDocument()
    })

    it('does not render modal when closed', () => {
      render(<CardDetailModalV2 {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Test Card Title')).not.toBeInTheDocument()
    })

    it('renders card title', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('Test Card Title')).toBeInTheDocument()
    })

    it('renders without description', () => {
      const cardWithoutDesc = { ...mockCard, description: undefined }
      render(<CardDetailModalV2 {...defaultProps} card={cardWithoutDesc} />)
      expect(screen.getByText('Test Card Title')).toBeInTheDocument()
      expect(screen.getByText('Add description...')).toBeInTheDocument()
    })

    it('renders assigned users', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('AC')).toBeInTheDocument()
      expect(screen.getByText('SJ')).toBeInTheDocument()
    })

    it('renders labels as comma-separated text', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('bug, urgent')).toBeInTheDocument()
    })

    it('renders priority', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('HIGH')).toBeInTheDocument()
    })

    it('renders date field', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      // Date is rendered, check for input
      const dateInput = screen.getByDisplayValue('2025-10-15')
      expect(dateInput).toBeInTheDocument()
    })
  })

  describe('Modal Close Functionality', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn()
      render(<CardDetailModalV2 {...defaultProps} onClose={onClose} />)

      const closeButton = screen.getByLabelText('Close')
      fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when clicking backdrop', () => {
      const onClose = vi.fn()
      render(<CardDetailModalV2 {...defaultProps} onClose={onClose} />)

      const backdrop = screen.getByRole('dialog').parentElement
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(onClose).toHaveBeenCalled()
      }
    })
  })

  describe('Title Editing', () => {
    it('title is editable via contentEditable', () => {
      render(<CardDetailModalV2 {...defaultProps} />)

      const titleElement = screen.getByText('Test Card Title')
      expect(titleElement).toHaveAttribute('contenteditable', 'true')
    })

    it('calls onUpdate when title is changed', async () => {
      const onUpdate = vi.fn()
      render(<CardDetailModalV2 {...defaultProps} onUpdate={onUpdate} />)

      const titleElement = screen.getByText('Test Card Title')

      // Simulate contenteditable change
      titleElement.textContent = 'Updated Title'
      fireEvent.blur(titleElement)

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith('card-1', { title: 'Updated Title' })
      })
    })
  })

  describe('Status Selector (Phase 2)', () => {
    it('renders status selector button', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('shows column ID when no columns available', () => {
      render(<CardDetailModalV2 {...defaultProps} availableColumns={[]} />)
      expect(screen.getByText('col-1')).toBeInTheDocument()
    })

    it('opens status menu when clicked', async () => {
      render(<CardDetailModalV2 {...defaultProps} />)

      // Component shows columnId, not column title
      const statusField = screen.getByText('col-1')
      fireEvent.click(statusField.closest('button')!)

      await waitFor(() => {
        // Menu shows column titles
        expect(screen.getByText('To Do')).toBeInTheDocument()
        expect(screen.getByText('In Progress')).toBeInTheDocument()
        expect(screen.getByText('Done')).toBeInTheDocument()
      })
    })

    it('calls onUpdate when status is changed', async () => {
      const onUpdate = vi.fn()
      render(<CardDetailModalV2 {...defaultProps} onUpdate={onUpdate} />)

      // Component shows columnId, not column title
      const statusField = screen.getByText('col-1')
      fireEvent.click(statusField.closest('button')!)

      await waitFor(() => {
        const inProgressOption = screen.getByText('In Progress')
        fireEvent.click(inProgressOption)
      })

      expect(onUpdate).toHaveBeenCalledWith('card-1', { columnId: 'col-2' })
    })
  })

  describe('Priority Selector (Phase 2)', () => {
    it('renders priority selector with current priority', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('HIGH')).toBeInTheDocument()
    })

    it('opens priority menu when clicked', async () => {
      render(<CardDetailModalV2 {...defaultProps} />)

      const priorityButton = screen.getByText('HIGH').closest('button')
      fireEvent.click(priorityButton!)

      await waitFor(() => {
        expect(screen.getByText('LOW')).toBeInTheDocument()
        expect(screen.getByText('MEDIUM')).toBeInTheDocument()
        expect(screen.getByText('URGENT')).toBeInTheDocument()
      })
    })

    it('calls onUpdate when priority is changed', async () => {
      const onUpdate = vi.fn()
      render(<CardDetailModalV2 {...defaultProps} onUpdate={onUpdate} />)

      const priorityButton = screen.getByText('HIGH').closest('button')
      fireEvent.click(priorityButton!)

      await waitFor(() => {
        const urgentOption = screen.getByText('URGENT')
        fireEvent.click(urgentOption)
      })

      expect(onUpdate).toHaveBeenCalledWith('card-1', expect.objectContaining({ priority: 'URGENT' }))
    })
  })

  describe('Assignee Selector (Phase 3)', () => {
    it('renders assigned users avatars', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('AC')).toBeInTheDocument()
      expect(screen.getByText('SJ')).toBeInTheDocument()
    })

    it('shows Empty when no assignees', () => {
      const cardWithoutAssignees = { ...mockCard, assignedUserIds: [] }
      render(<CardDetailModalV2 {...defaultProps} card={cardWithoutAssignees} />)
      expect(screen.getByText('Empty')).toBeInTheDocument()
    })

    it('opens assignee menu when clicked', async () => {
      render(<CardDetailModalV2 {...defaultProps} />)

      const assigneeButton = screen.getByText('AC').closest('button')
      fireEvent.click(assigneeButton!)

      await waitFor(() => {
        expect(screen.getByText('Alex Chen')).toBeInTheDocument()
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
        expect(screen.getByText('Bob Smith')).toBeInTheDocument()
      })
    })

    it('allows toggling user assignment', async () => {
      const onUpdate = vi.fn()
      render(<CardDetailModalV2 {...defaultProps} onUpdate={onUpdate} />)

      const assigneeButton = screen.getByText('AC').closest('button')
      fireEvent.click(assigneeButton!)

      await waitFor(async () => {
        const bobOption = screen.getByText('Bob Smith')
        fireEvent.click(bobOption)
      })

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(
          'card-1',
          expect.objectContaining({
            assignedUserIds: expect.arrayContaining(['user-1', 'user-2', 'user-3']),
          })
        )
      })
    })
  })

  describe('Label Selector (Phase 3)', () => {
    it('renders assigned labels', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('bug, urgent')).toBeInTheDocument()
    })

    it('shows Empty when no labels', () => {
      const cardWithoutLabels = { ...mockCard, labels: [] }
      render(<CardDetailModalV2 {...defaultProps} card={cardWithoutLabels} />)
      // Empty appears twice - once for assignees, once for labels
      const emptyElements = screen.getAllByText('Empty')
      expect(emptyElements.length).toBeGreaterThanOrEqual(1)
    })

    it('opens label menu when clicked', async () => {
      render(<CardDetailModalV2 {...defaultProps} />)

      const labelsButton = screen.getByText('bug, urgent').closest('button')
      fireEvent.click(labelsButton!)

      await waitFor(() => {
        expect(screen.getByText('feature')).toBeInTheDocument()
        expect(screen.getByText('enhancement')).toBeInTheDocument()
      })
    })

    it('allows toggling labels', async () => {
      const onUpdate = vi.fn()
      render(<CardDetailModalV2 {...defaultProps} onUpdate={onUpdate} />)

      const labelsButton = screen.getByText('bug, urgent').closest('button')
      fireEvent.click(labelsButton!)

      await waitFor(async () => {
        const featureOption = screen.getByText('feature')
        fireEvent.click(featureOption)
      })

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(
          'card-1',
          expect.objectContaining({
            labels: expect.arrayContaining(['bug', 'urgent', 'feature']),
          })
        )
      })
    })
  })

  describe('Date Picker (Phase 4)', () => {
    it('renders date input', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      const dateInput = screen.getByDisplayValue('2025-10-15')
      expect(dateInput).toBeInTheDocument()
      expect(dateInput).toHaveAttribute('type', 'date')
    })

    it('allows changing end date', async () => {
      const onUpdate = vi.fn()
      render(<CardDetailModalV2 {...defaultProps} onUpdate={onUpdate} />)

      const dateInput = screen.getByDisplayValue('2025-10-15')
      fireEvent.change(dateInput, { target: { value: '2025-10-20' } })

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith('card-1', { endDate: '2025-10-20' })
      })
    })
  })

  describe('Time Input (Phase 4)', () => {
    it('shows estimated time label', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('Estimated Time')).toBeInTheDocument()
    })

    it('displays estimated time value', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('8h')).toBeInTheDocument()
    })

    it('opens time picker when clicked', async () => {
      render(<CardDetailModalV2 {...defaultProps} />)

      const timeButton = screen.getByText('8h').closest('button')
      fireEvent.click(timeButton!)

      await waitFor(() => {
        const timeInput = screen.getByPlaceholderText('Hours')
        expect(timeInput).toBeInTheDocument()
        expect(timeInput).toHaveAttribute('type', 'number')
      })
    })
  })

  describe('Markdown Rendering (Phase 5)', () => {
    it('renders description as markdown when not editing', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      // Check that markdown is rendered (look for HTML tags)
      const descriptionContainer = screen.getByText(/bold/i).closest('.modal-v2-markdown')
      expect(descriptionContainer).toBeInTheDocument()
    })

    it('shows edit mode when description is clicked', async () => {
      render(<CardDetailModalV2 {...defaultProps} />)

      const descriptionContent = screen.getByText(/bold/i).closest('.modal-v2-content')
      fireEvent.click(descriptionContent!)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Add description...')).toBeInTheDocument()
      })
    })
  })

  describe('Comments Section', () => {
    it('renders comment input', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument()
    })

    it('allows typing in comment field', () => {
      render(<CardDetailModalV2 {...defaultProps} />)

      const commentInput = screen.getByPlaceholderText('Write a comment...')
      fireEvent.change(commentInput, { target: { value: 'New comment' } })

      expect(commentInput).toHaveValue('New comment')
    })

    it('shows Send button', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('Send')).toBeInTheDocument()
    })

    it('calls onAddComment when Send is clicked', async () => {
      const onAddComment = vi.fn()
      render(<CardDetailModalV2 {...defaultProps} onAddComment={onAddComment} />)

      const commentInput = screen.getByPlaceholderText('Write a comment...')
      fireEvent.change(commentInput, { target: { value: 'New comment' } })

      const sendButton = screen.getByText('Send')
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(onAddComment).toHaveBeenCalledWith('card-1', 'New comment')
      })
    })
  })

  describe('Activity Timeline', () => {
    it('renders activity section', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('Activity')).toBeInTheDocument()
    })

    it('shows activity filters', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getByText('Comments')).toBeInTheDocument()
      expect(screen.getByText('History')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA role for modal', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has aria-modal attribute', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-labelledby attribute', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('close button has aria-label', () => {
      render(<CardDetailModalV2 {...defaultProps} />)
      const closeButton = screen.getByLabelText('Close')
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles card without priority', () => {
      const cardNoPriority = { ...mockCard, priority: undefined }
      render(<CardDetailModalV2 {...defaultProps} card={cardNoPriority} />)
      expect(screen.getByText('None')).toBeInTheDocument()
    })

    it('handles card without end date', () => {
      const cardNoDate = { ...mockCard, endDate: undefined }
      render(<CardDetailModalV2 {...defaultProps} card={cardNoDate} />)
      expect(screen.getByText('Not set')).toBeInTheDocument()
    })

    it('handles empty available users list', () => {
      render(<CardDetailModalV2 {...defaultProps} availableUsers={[]} />)
      expect(screen.getByText('Test Card Title')).toBeInTheDocument()
    })

    it('handles empty available columns list', () => {
      render(<CardDetailModalV2 {...defaultProps} availableColumns={[]} />)
      expect(screen.getByText('Test Card Title')).toBeInTheDocument()
      // Should show columnId instead
      expect(screen.getByText('col-1')).toBeInTheDocument()
    })
  })
})
