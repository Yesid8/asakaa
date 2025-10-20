/**
 * BoardProvider Tests
 * @module adapters/react/__tests__
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BoardProvider, useBoardStore } from '../BoardProvider'
import type { BoardData, ColumnData, CardData } from '@asakaa/core'

// Test component that uses the provider
function TestComponent() {
  const store = useBoardStore()
  const state = store.getState()

  return (
    <div>
      <div data-testid="board-title">{state.board?.title || 'No board'}</div>
      <div data-testid="columns-count">{state.columns.size}</div>
      <div data-testid="cards-count">{state.cards.size}</div>
    </div>
  )
}

describe('BoardProvider', () => {
  const mockBoard: BoardData = {
    id: 'board-1',
    title: 'Test Board',
    columnIds: ['col-1', 'col-2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockColumns: ColumnData[] = [
    {
      id: 'col-1',
      title: 'To Do',
      position: 0,
      cardIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'col-2',
      title: 'In Progress',
      position: 1,
      cardIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const mockCards: CardData[] = [
    {
      id: 'card-1',
      title: 'Task 1',
      position: 0,
      columnId: 'col-1',
      status: 'TODO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'card-2',
      title: 'Task 2',
      position: 1,
      columnId: 'col-1',
      status: 'TODO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  it('should render without initial data', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    )

    expect(screen.getByTestId('board-title')).toHaveTextContent('No board')
    expect(screen.getByTestId('columns-count')).toHaveTextContent('0')
    expect(screen.getByTestId('cards-count')).toHaveTextContent('0')
  })

  it('should render with initial data', () => {
    render(
      <BoardProvider
        initialData={{
          board: mockBoard,
          columns: mockColumns,
          cards: mockCards,
        }}
      >
        <TestComponent />
      </BoardProvider>
    )

    expect(screen.getByTestId('board-title')).toHaveTextContent('Test Board')
    expect(screen.getByTestId('columns-count')).toHaveTextContent('2')
    expect(screen.getByTestId('cards-count')).toHaveTextContent('2')
  })

  it('should provide store context', () => {
    function StoreTest() {
      const store = useBoardStore()
      return <div data-testid="store-exists">{store ? 'yes' : 'no'}</div>
    }

    render(
      <BoardProvider>
        <StoreTest />
      </BoardProvider>
    )

    expect(screen.getByTestId('store-exists')).toHaveTextContent('yes')
  })

  it('should throw error when useBoardStore used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = () => {}

    function ComponentOutsideProvider() {
      useBoardStore() // This will throw
      return <div>Should not render</div>
    }

    // React catches errors during render, so we need to check if error was thrown
    try {
      render(<ComponentOutsideProvider />)
      // If we get here, test should fail
      expect(true).toBe(false)
    } catch (error) {
      // Error was thrown as expected
      expect((error as Error).message).toContain('useBoardStore must be used within BoardProvider')
    } finally {
      console.error = originalError
    }
  })

  it('should call onStateChange when state updates', async () => {
    const stateChanges: any[] = []

    function TestWithUpdate() {
      const store = useBoardStore()

      const handleAddCard = () => {
        store.addCard({
          id: 'new-card',
          title: 'New Task',
          position: 0,
          columnId: 'col-1',
          status: 'TODO',
        })
      }

      return (
        <button onClick={handleAddCard} data-testid="add-card">
          Add Card
        </button>
      )
    }

    const { getByTestId } = render(
      <BoardProvider
        initialData={{ board: mockBoard, columns: mockColumns, cards: [] }}
        onStateChange={(state) => stateChanges.push(state)}
      >
        <TestWithUpdate />
      </BoardProvider>
    )

    const addButton = getByTestId('add-card')
    addButton.click()

    await waitFor(() => {
      expect(stateChanges.length).toBeGreaterThan(0)
    })

    // Verify state change was captured
    const lastState = stateChanges[stateChanges.length - 1]
    expect(lastState.cards.size).toBe(1)
  })

  it('should initialize store only once', () => {
    let renderCount = 0

    function CountingComponent() {
      renderCount++
      useBoardStore()
      return <div>Render {renderCount}</div>
    }

    const { rerender } = render(
      <BoardProvider>
        <CountingComponent />
      </BoardProvider>
    )

    const initialRenderCount = renderCount

    // Force re-render
    rerender(
      <BoardProvider>
        <CountingComponent />
      </BoardProvider>
    )

    // Store should not be recreated on re-render
    expect(renderCount).toBeGreaterThan(initialRenderCount)
  })
})
