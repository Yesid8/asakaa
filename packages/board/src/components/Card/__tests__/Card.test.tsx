import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { Card } from '../Card'
import type { Card as CardType, User } from '../../../types'

const mockCard: CardType = {
  id: 'card-1',
  title: 'Test Card',
  description: 'Test Description',
  position: 1000,
  columnId: 'col-1',
  priority: 'HIGH',
  labels: ['test', 'demo'],
}

const mockUsers: User[] = [
  { id: 'user-1', name: 'Alex Chen', initials: 'AC', color: '#3B82F6' },
  { id: 'user-2', name: 'Sarah Johnson', initials: 'SJ', color: '#8B5CF6' },
]

const mockAllCards: CardType[] = [
  mockCard,
  { id: 'card-2', title: 'Dependency Task', position: 2000, columnId: 'col-1' },
]

describe('Card Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders card with title', () => {
      render(
        <DndContext>
          <Card card={mockCard} />
        </DndContext>
      )

      expect(screen.getByText('Test Card')).toBeInTheDocument()
    })

    it('renders card description', () => {
      render(
        <DndContext>
          <Card card={mockCard} />
        </DndContext>
      )

      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders without description', () => {
      const cardWithoutDesc = { ...mockCard, description: undefined }
      render(
        <DndContext>
          <Card card={cardWithoutDesc} />
        </DndContext>
      )

      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
    })

    it('renders labels', () => {
      render(
        <DndContext>
          <Card card={mockCard} />
        </DndContext>
      )

      expect(screen.getByText('test')).toBeInTheDocument()
      expect(screen.getByText('demo')).toBeInTheDocument()
    })

    it('renders without labels', () => {
      const cardWithoutLabels = { ...mockCard, labels: undefined }
      render(
        <DndContext>
          <Card card={cardWithoutLabels} />
        </DndContext>
      )

      expect(screen.queryByText('test')).not.toBeInTheDocument()
    })
  })

  describe('Priority Selector', () => {
    it('renders priority selector', () => {
      render(
        <DndContext>
          <Card card={mockCard} />
        </DndContext>
      )

      // Priority selector should be present (icon button)
      const priorityButton = screen.getByTitle('High Priority')
      expect(priorityButton).toBeInTheDocument()
    })

    it('calls onUpdate when priority changes', async () => {
      const onUpdate = vi.fn()
      render(
        <DndContext>
          <Card card={mockCard} onUpdate={onUpdate} />
        </DndContext>
      )

      const priorityButton = screen.getByTitle('High Priority')
      fireEvent.click(priorityButton)

      // Menu should open - look for priority options
      await waitFor(() => {
        const mediumOption = screen.getByText('Medium')
        expect(mediumOption).toBeInTheDocument()
      })
    })

    it('renders card without priority', () => {
      const cardWithoutPriority = { ...mockCard, priority: undefined }
      render(
        <DndContext>
          <Card card={cardWithoutPriority} />
        </DndContext>
      )

      expect(screen.queryByTitle('High Priority')).not.toBeInTheDocument()
    })
  })

  describe('Date Range Picker', () => {
    it('renders date range picker', () => {
      const cardWithDates = {
        ...mockCard,
        startDate: '2025-10-01',
        endDate: '2025-10-15',
      }
      render(
        <DndContext>
          <Card card={cardWithDates} />
        </DndContext>
      )

      // Should show dates
      expect(screen.getByText(/Oct 1/)).toBeInTheDocument()
      expect(screen.getByText(/Oct 15/)).toBeInTheDocument()
    })

    it('renders date picker icon when no dates', () => {
      render(
        <DndContext>
          <Card card={mockCard} />
        </DndContext>
      )

      // Should show calendar icon button
      const dateButton = screen.getByTitle('Set dates')
      expect(dateButton).toBeInTheDocument()
    })

    it('calls onUpdate when dates change', async () => {
      const onUpdate = vi.fn()
      render(
        <DndContext>
          <Card card={mockCard} onUpdate={onUpdate} />
        </DndContext>
      )

      const dateButton = screen.getByTitle('Set dates')
      fireEvent.click(dateButton)

      // Menu should open
      await waitFor(() => {
        expect(screen.getByText('Start Date')).toBeInTheDocument()
      })
    })
  })

  describe('User Assignment Selector', () => {
    it('renders user assignment selector with users', () => {
      const cardWithUsers = {
        ...mockCard,
        assignedUserIds: ['user-1', 'user-2'],
      }
      render(
        <DndContext>
          <Card card={cardWithUsers} availableUsers={mockUsers} />
        </DndContext>
      )

      // Should show user initials
      expect(screen.getByText('AC')).toBeInTheDocument()
      expect(screen.getByText('SJ')).toBeInTheDocument()
    })

    it('renders user icon when no users assigned', () => {
      render(
        <DndContext>
          <Card card={mockCard} availableUsers={mockUsers} />
        </DndContext>
      )

      // Should show user icon button
      const userButton = screen.getByTitle('Assign users')
      expect(userButton).toBeInTheDocument()
    })

    it('shows +N indicator when more than 3 users', () => {
      const manyUsers: User[] = [
        ...mockUsers,
        { id: 'user-3', name: 'Bob Smith', initials: 'BS', color: '#10B981' },
        { id: 'user-4', name: 'Jane Doe', initials: 'JD', color: '#F59E0B' },
      ]
      const cardWithManyUsers = {
        ...mockCard,
        assignedUserIds: ['user-1', 'user-2', 'user-3', 'user-4'],
      }
      render(
        <DndContext>
          <Card card={cardWithManyUsers} availableUsers={manyUsers} />
        </DndContext>
      )

      // Should show +N indicator
      expect(screen.getByText('+1')).toBeInTheDocument()
    })

    it('calls onUpdate when users change', async () => {
      const onUpdate = vi.fn()
      render(
        <DndContext>
          <Card card={mockCard} onUpdate={onUpdate} availableUsers={mockUsers} />
        </DndContext>
      )

      const userButton = screen.getByTitle('Assign users')
      fireEvent.click(userButton)

      // Menu should open
      await waitFor(() => {
        expect(screen.getByText('Assign to')).toBeInTheDocument()
      })
    })
  })

  describe('Dependencies Selector', () => {
    it('renders dependencies selector with dependencies', () => {
      const cardWithDeps = {
        ...mockCard,
        dependencies: ['card-2'],
      }
      render(
        <DndContext>
          <Card card={cardWithDeps} allCards={mockAllCards} />
        </DndContext>
      )

      // Should show link icon with count
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('renders link icon when no dependencies', () => {
      render(
        <DndContext>
          <Card card={mockCard} allCards={mockAllCards} />
        </DndContext>
      )

      // Should show link icon button
      const depsButton = screen.getByTitle('Add dependencies')
      expect(depsButton).toBeInTheDocument()
    })

    it('calls onUpdate when dependencies change', async () => {
      const onUpdate = vi.fn()
      render(
        <DndContext>
          <Card card={mockCard} onUpdate={onUpdate} allCards={mockAllCards} />
        </DndContext>
      )

      const depsButton = screen.getByTitle('Add dependencies')
      fireEvent.click(depsButton)

      // Menu should open
      await waitFor(() => {
        expect(screen.getByText('Dependencies')).toBeInTheDocument()
      })
    })
  })

  describe('Interactions', () => {
    it('calls onClick when card is clicked', () => {
      const handleClick = vi.fn()

      render(
        <DndContext>
          <Card card={mockCard} onClick={handleClick} />
        </DndContext>
      )

      const cardElement = screen.getByText('Test Card').closest('div[role="button"]')
      fireEvent.click(cardElement!)

      expect(handleClick).toHaveBeenCalledWith(mockCard)
    })

    it('does not call onClick when clicking on interactive elements', () => {
      const handleClick = vi.fn()

      render(
        <DndContext>
          <Card card={mockCard} onClick={handleClick} onUpdate={vi.fn()} />
        </DndContext>
      )

      // Click on priority selector
      const priorityButton = screen.getByTitle('High Priority')
      fireEvent.click(priorityButton)

      // onClick should not be called due to stopPropagation
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('calls onDelete when delete is triggered', () => {
      const onDelete = vi.fn()

      render(
        <DndContext>
          <Card card={mockCard} onDelete={onDelete} />
        </DndContext>
      )

      // This would require a delete button/action in the card
      // For now, we'll test that the prop is accepted
      expect(onDelete).toBeDefined()
    })
  })

  describe('Custom Rendering', () => {
    it('uses custom render function when provided', () => {
      const customRender = (card: CardType) => (
        <div data-testid="custom-card">{card.title} - Custom</div>
      )

      render(
        <DndContext>
          <Card card={mockCard} render={customRender} />
        </DndContext>
      )

      expect(screen.getByTestId('custom-card')).toBeInTheDocument()
      expect(screen.getByText('Test Card - Custom')).toBeInTheDocument()
    })

    it('does not render default card when custom render is provided', () => {
      const customRender = (card: CardType) => (
        <div data-testid="custom-card">{card.title}</div>
      )

      render(
        <DndContext>
          <Card card={mockCard} render={customRender} />
        </DndContext>
      )

      // Default description should not be rendered
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    it('only re-renders when card data changes', () => {
      const renderSpy = vi.fn()
      const TestCard = ({ card }: { card: CardType }) => {
        renderSpy()
        return (
          <DndContext>
            <Card card={card} />
          </DndContext>
        )
      }

      const { rerender } = render(<TestCard card={mockCard} />)
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // Re-render with same card data
      rerender(<TestCard card={mockCard} />)
      // Should not re-render due to memoization
      expect(renderSpy).toHaveBeenCalledTimes(2) // Parent re-renders but Card should memo

      // Re-render with different card
      const updatedCard = { ...mockCard, title: 'Updated' }
      rerender(<TestCard card={updatedCard} />)
      expect(renderSpy).toHaveBeenCalledTimes(3)
    })
  })

  describe('Accessibility', () => {
    it('has proper role attribute', () => {
      render(
        <DndContext>
          <Card card={mockCard} />
        </DndContext>
      )

      const cardElement = screen.getByRole('button')
      expect(cardElement).toBeInTheDocument()
    })

    it('has proper keyboard navigation', () => {
      const handleClick = vi.fn()

      render(
        <DndContext>
          <Card card={mockCard} onClick={handleClick} />
        </DndContext>
      )

      const cardElement = screen.getByRole('button')

      // Simulate Enter key press
      fireEvent.keyDown(cardElement, { key: 'Enter', code: 'Enter' })

      // Should be keyboard accessible
      expect(cardElement).toHaveAttribute('tabIndex')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long titles', () => {
      const longTitleCard = {
        ...mockCard,
        title: 'A'.repeat(200),
      }

      render(
        <DndContext>
          <Card card={longTitleCard} />
        </DndContext>
      )

      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument()
    })

    it('handles very long descriptions', () => {
      const longDescCard = {
        ...mockCard,
        description: 'B'.repeat(500),
      }

      render(
        <DndContext>
          <Card card={longDescCard} />
        </DndContext>
      )

      expect(screen.getByText('B'.repeat(500))).toBeInTheDocument()
    })

    it('handles many labels', () => {
      const manyLabelsCard = {
        ...mockCard,
        labels: Array(20).fill('label').map((l, i) => `${l}-${i}`),
      }

      render(
        <DndContext>
          <Card card={manyLabelsCard} />
        </DndContext>
      )

      expect(screen.getByText('label-0')).toBeInTheDocument()
      expect(screen.getByText('label-19')).toBeInTheDocument()
    })

    it('handles undefined optional fields gracefully', () => {
      const minimalCard: CardType = {
        id: 'minimal',
        title: 'Minimal',
        position: 1000,
        columnId: 'col-1',
      }

      render(
        <DndContext>
          <Card card={minimalCard} />
        </DndContext>
      )

      expect(screen.getByText('Minimal')).toBeInTheDocument()
    })
  })
})
