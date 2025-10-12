import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DependenciesSelector } from '../DependenciesSelector'
import type { Card } from '../../../types'

const mockTasks: Card[] = [
  { id: 'card-1', title: 'Task 1', position: 1000, columnId: 'col-1' },
  { id: 'card-2', title: 'Task 2', position: 2000, columnId: 'col-1' },
  { id: 'card-3', title: 'Task 3', position: 3000, columnId: 'col-2' },
  { id: 'card-4', title: 'Task 4', position: 4000, columnId: 'col-2' },
  { id: 'current-card', title: 'Current Task', position: 5000, columnId: 'col-3' },
]

describe('DependenciesSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders link icon when no dependencies', () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByTitle('Add dependencies')).toBeInTheDocument()
    })

    it('renders link icon with count when dependencies exist', () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          dependencies={['card-1', 'card-2']}
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('renders single dependency count', () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          dependencies={['card-1']}
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Menu Interaction', () => {
    it('opens menu when button is clicked', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Dependencies')).toBeInTheDocument()
      })
    })

    it('closes menu when clicking outside', async () => {
      render(
        <div>
          <DependenciesSelector
            currentCardId="current-card"
            availableTasks={mockTasks}
            onChange={vi.fn()}
          />
          <div data-testid="outside">Outside</div>
        </div>
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Dependencies')).toBeInTheDocument()
      })

      const outside = screen.getByTestId('outside')
      fireEvent.mouseDown(outside)

      await waitFor(() => {
        expect(screen.queryByText('Dependencies')).not.toBeInTheDocument()
      })
    })

    it('displays "Has dependencies" checkbox', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('This task has dependencies')).toBeInTheDocument()
      })
    })
  })

  describe('Has Dependencies Checkbox', () => {
    it('checkbox is checked when dependencies exist', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          dependencies={['card-1']}
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Link with 1 dependency')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
      })
    })

    it('checkbox is unchecked when no dependencies', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()
      })
    })

    it('shows task list when checkbox is checked', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument()
      })
    })

    it('hides task list when checkbox is unchecked', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          dependencies={['card-1']}
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Link with 1 dependency')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search tasks...')).not.toBeInTheDocument()
      })
    })

    it('clears dependencies when unchecking', async () => {
      const onChange = vi.fn()
      render(
        <DependenciesSelector
          currentCardId="current-card"
          dependencies={['card-1', 'card-2']}
          availableTasks={mockTasks}
          onChange={onChange}
        />
      )

      const button = screen.getByTitle('Link with 2 dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe('Task Selection', () => {
    it('displays available tasks excluding current card', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
        expect(screen.getByText('Task 2')).toBeInTheDocument()
        expect(screen.getByText('Task 3')).toBeInTheDocument()
        expect(screen.getByText('Task 4')).toBeInTheDocument()
        expect(screen.queryByText('Current Task')).not.toBeInTheDocument()
      })
    })

    it('calls onChange when task is selected', async () => {
      const onChange = vi.fn()
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={onChange}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(() => {
        const task1 = screen.getByText('Task 1')
        fireEvent.click(task1)
      })

      expect(onChange).toHaveBeenCalledWith(['card-1'])
    })

    it('calls onChange when task is deselected', async () => {
      const onChange = vi.fn()
      render(
        <DependenciesSelector
          currentCardId="current-card"
          dependencies={['card-1', 'card-2']}
          availableTasks={mockTasks}
          onChange={onChange}
        />
      )

      const button = screen.getByTitle('Link with 2 dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const task1 = screen.getByText('Task 1')
        fireEvent.click(task1)
      })

      expect(onChange).toHaveBeenCalledWith(['card-2'])
    })

    it('allows multiple task selection', async () => {
      const onChange = vi.fn()
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={onChange}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(async () => {
        const task1 = screen.getByText('Task 1')
        fireEvent.click(task1)

        await waitFor(() => {
          const task2 = screen.getByText('Task 2')
          fireEvent.click(task2)
        })
      })

      expect(onChange).toHaveBeenLastCalledWith(['card-1', 'card-2'])
    })

    it('shows checkmark for selected tasks', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          dependencies={['card-1']}
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Link with 1 dependency')
      fireEvent.click(button)

      await waitFor(() => {
        const task1Option = screen.getByText('Task 1')
        const checkbox = task1Option.closest('label')?.querySelector('input[type="checkbox"]')
        expect(checkbox).toBeChecked()
      })
    })
  })

  describe('Search Functionality', () => {
    it('filters tasks by title', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search tasks...')
        fireEvent.change(searchInput, { target: { value: 'Task 1' } })
      })

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
        expect(screen.queryByText('Task 2')).not.toBeInTheDocument()
        expect(screen.queryByText('Task 3')).not.toBeInTheDocument()
      })
    })

    it('filters tasks by ID', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search tasks...')
        fireEvent.change(searchInput, { target: { value: 'card-2' } })
      })

      await waitFor(() => {
        expect(screen.getByText('Task 2')).toBeInTheDocument()
        expect(screen.queryByText('Task 1')).not.toBeInTheDocument()
      })
    })

    it('filters tasks case-insensitively', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search tasks...')
        fireEvent.change(searchInput, { target: { value: 'TASK 3' } })
      })

      await waitFor(() => {
        expect(screen.getByText('Task 3')).toBeInTheDocument()
      })
    })

    it('shows "No tasks found" when search has no results', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search tasks...')
        fireEvent.change(searchInput, { target: { value: 'NonexistentTask' } })
      })

      await waitFor(() => {
        expect(screen.getByText('No tasks found')).toBeInTheDocument()
      })
    })
  })

  describe('Clear All Functionality', () => {
    it('shows clear all button when dependencies exist', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          dependencies={['card-1', 'card-2']}
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Link with 2 dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Clear all')).toBeInTheDocument()
      })
    })

    it('calls onChange with empty array when clear all is clicked', async () => {
      const onChange = vi.fn()
      render(
        <DependenciesSelector
          currentCardId="current-card"
          dependencies={['card-1', 'card-2']}
          availableTasks={mockTasks}
          onChange={onChange}
        />
      )

      const button = screen.getByTitle('Link with 2 dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const clearButton = screen.getByText('Clear all')
        fireEvent.click(clearButton)
      })

      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
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
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      expect(button.tagName).toBe('BUTTON')
    })

    it('has hover state on button', () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      expect(button).toHaveClass('hover:bg-white/10')
    })

    it('checkbox is keyboard accessible', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty availableTasks array', async () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={[]}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(() => {
        expect(screen.getByText('No tasks available')).toBeInTheDocument()
      })
    })

    it('handles dependencies with non-existent task IDs', () => {
      render(
        <DependenciesSelector
          currentCardId="current-card"
          dependencies={['nonexistent-1', 'nonexistent-2']}
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('handles very long task names', async () => {
      const longNameTask: Card = {
        id: 'long-task',
        title: 'A'.repeat(200),
        position: 6000,
        columnId: 'col-1',
      }

      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={[...mockTasks, longNameTask]}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(() => {
        expect(screen.getByText('A'.repeat(200))).toBeInTheDocument()
      })
    })

    it('handles currentCardId not in availableTasks', async () => {
      render(
        <DependenciesSelector
          currentCardId="not-in-list"
          availableTasks={mockTasks}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      // Should show all tasks since current card is not in list
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
        expect(screen.queryByText('Current Task')).toBeInTheDocument()
      })
    })

    it('handles selecting all available tasks', async () => {
      const onChange = vi.fn()
      render(
        <DependenciesSelector
          currentCardId="current-card"
          availableTasks={mockTasks}
          onChange={onChange}
        />
      )

      const button = screen.getByTitle('Add dependencies')
      fireEvent.click(button)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
      })

      await waitFor(() => {
        const task1 = screen.getByText('Task 1')
        const task2 = screen.getByText('Task 2')
        const task3 = screen.getByText('Task 3')
        const task4 = screen.getByText('Task 4')

        fireEvent.click(task1)
        fireEvent.click(task2)
        fireEvent.click(task3)
        fireEvent.click(task4)
      })

      expect(onChange).toHaveBeenLastCalledWith(['card-1', 'card-2', 'card-3', 'card-4'])
    })
  })
})
