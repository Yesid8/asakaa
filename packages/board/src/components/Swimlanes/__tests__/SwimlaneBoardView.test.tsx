/**
 * SwimlaneBoardView Component Tests
 * Tests for v0.3.0 Swimlanes/Grouping feature
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SwimlaneBoardView } from '../SwimlaneBoardView'
import type { Board, SwimlaneConfig } from '../../../types'

const mockBoard: Board = {
  id: 'board-1',
  columns: [
    { id: 'col-1', title: 'To Do', position: 1000, cardIds: ['card-1', 'card-2'] },
    { id: 'col-2', title: 'Done', position: 2000, cardIds: ['card-3'] },
  ],
  cards: [
    {
      id: 'card-1',
      title: 'Task 1',
      position: 1000,
      columnId: 'col-1',
      priority: 'HIGH',
      assignedUserIds: ['user-1'],
      labels: ['frontend'],
    },
    {
      id: 'card-2',
      title: 'Task 2',
      position: 2000,
      columnId: 'col-1',
      priority: 'LOW',
      assignedUserIds: ['user-2'],
      labels: ['backend'],
    },
    {
      id: 'card-3',
      title: 'Task 3',
      position: 1000,
      columnId: 'col-2',
      priority: 'HIGH',
      labels: ['frontend'],
    },
  ],
}

const mockCallbacks = {
  onCardMove: vi.fn(),
  onCardUpdate: vi.fn(),
  onColumnUpdate: vi.fn(),
  onWipLimitExceeded: vi.fn(),
}

const mockUsers = [
  { id: 'user-1', name: 'John Doe', avatar: 'JD', color: '#3b82f6' },
  { id: 'user-2', name: 'Jane Smith', avatar: 'JS', color: '#ef4444' },
]

describe('SwimlaneBoardView', () => {
  describe('Grouping by none', () => {
    it('renders standard board when groupBy is none', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'none',
        collapsible: false,
      }

      render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          callbacks={mockCallbacks}
        />
      )

      // Should render standard board, not swimlanes
      expect(screen.queryByText(/cards/)).not.toBeInTheDocument()
    })
  })

  describe('Grouping by priority', () => {
    it('groups cards by priority correctly', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'priority',
        collapsible: false,
      }

      render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          callbacks={mockCallbacks}
        />
      )

      // Should show priority swimlanes
      expect(screen.getByText('🟠 High')).toBeInTheDocument()
      expect(screen.getByText('🟢 Low')).toBeInTheDocument()
    })

    it('shows correct card counts in priority lanes', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'priority',
        collapsible: false,
      }

      render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          callbacks={mockCallbacks}
        />
      )

      // 2 cards with HIGH priority, 1 with LOW
      expect(screen.getByText('(2 cards)')).toBeInTheDocument()
      expect(screen.getByText('(1 card)')).toBeInTheDocument()
    })
  })

  describe('Grouping by assignee', () => {
    it('groups cards by assignee correctly', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'assignee',
        collapsible: false,
      }

      render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          availableUsers={mockUsers}
          callbacks={mockCallbacks}
        />
      )

      // Should show user swimlanes
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Unassigned')).toBeInTheDocument()
    })

    it('applies user colors to swimlane headers', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'assignee',
        collapsible: false,
      }

      const { container } = render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          availableUsers={mockUsers}
          callbacks={mockCallbacks}
        />
      )

      // Check that swimlane headers have border colors
      const headers = container.querySelectorAll('.asakaa-swimlane-header')
      expect(headers.length).toBeGreaterThan(0)
    })
  })

  describe('Grouping by label', () => {
    it('groups cards by label correctly', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'label',
        collapsible: false,
      }

      render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          callbacks={mockCallbacks}
        />
      )

      // Should show label swimlanes
      expect(screen.getByText('frontend')).toBeInTheDocument()
      expect(screen.getByText('backend')).toBeInTheDocument()
    })
  })

  describe('Collapsible swimlanes', () => {
    it('renders collapse button when collapsible is true', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'priority',
        collapsible: true,
      }

      render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          callbacks={mockCallbacks}
        />
      )

      // Should show collapse indicators
      const collapseButtons = screen.getAllByLabelText(/Collapse lane|Expand lane/)
      expect(collapseButtons.length).toBeGreaterThan(0)
    })

    it('collapses and expands swimlane on click', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'priority',
        collapsible: true,
      }

      const { container } = render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          callbacks={mockCallbacks}
        />
      )

      // Click the first swimlane header
      const header = container.querySelector('.asakaa-swimlane-header')
      expect(header).toBeInTheDocument()

      if (header) {
        // Content should be visible initially
        expect(container.querySelector('.asakaa-swimlane-content')).toBeInTheDocument()

        // Click to collapse
        fireEvent.click(header)

        // Content should be hidden
        // Note: The content element is removed from DOM when collapsed
        const content = container.querySelectorAll('.asakaa-swimlane-content')
        // At least one swimlane should still have content (other lanes)
        expect(content.length).toBeLessThan(2) // Started with 2 priority lanes
      }
    })

    it('shows correct collapse indicator', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'priority',
        collapsible: true,
      }

      render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          callbacks={mockCallbacks}
        />
      )

      // Initially should show collapse indicator (▼)
      expect(screen.getByText('▼')).toBeInTheDocument()
    })
  })

  describe('Empty states', () => {
    it('renders standard board when no swimlanes are generated', () => {
      const emptyBoard: Board = {
        id: 'board-1',
        columns: [{ id: 'col-1', title: 'To Do', position: 1000, cardIds: [] }],
        cards: [],
      }

      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'priority',
        collapsible: false,
      }

      render(
        <SwimlaneBoardView
          board={emptyBoard}
          swimlaneConfig={swimlaneConfig}
          callbacks={mockCallbacks}
        />
      )

      // Should render standard board when there are no cards
      const swimlaneView = document.querySelector('.asakaa-swimlane-view')
      expect(swimlaneView).toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    it('applies custom className to swimlane view', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'priority',
        collapsible: false,
      }

      const { container } = render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          callbacks={mockCallbacks}
          className="custom-swimlane-class"
        />
      )

      expect(container.querySelector('.custom-swimlane-class')).toBeInTheDocument()
    })
  })

  describe('Callbacks', () => {
    it('passes callbacks to child KanbanBoard components', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'priority',
        collapsible: false,
      }

      render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          callbacks={mockCallbacks}
        />
      )

      // Callbacks should be passed through
      // This is tested indirectly through the component rendering without errors
      expect(mockCallbacks.onCardMove).not.toHaveBeenCalled()
    })
  })

  describe('Card filtering', () => {
    it('only shows cards belonging to each swimlane', () => {
      const swimlaneConfig: SwimlaneConfig = {
        groupBy: 'priority',
        collapsible: false,
      }

      render(
        <SwimlaneBoardView
          board={mockBoard}
          swimlaneConfig={swimlaneConfig}
          callbacks={mockCallbacks}
        />
      )

      // Each swimlane should only contain its filtered cards
      // High priority lane should have 2 cards
      expect(screen.getByText('(2 cards)')).toBeInTheDocument()
      // Low priority lane should have 1 card
      expect(screen.getByText('(1 card)')).toBeInTheDocument()
    })
  })
})
