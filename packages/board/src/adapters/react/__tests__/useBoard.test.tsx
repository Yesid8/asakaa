/**
 * useBoard Hook Tests
 * @module adapters/react/__tests__
 */

import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { BoardProvider } from '../BoardProvider'
import { useBoard } from '../useBoard'
import type { BoardData, ColumnData, CardData } from '@asakaa/core'

describe('useBoard', () => {
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
      cardIds: ['card-1'], // card-1 is in this column
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
  ]

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BoardProvider
      initialData={{
        board: mockBoard,
        columns: mockColumns,
        cards: mockCards,
      }}
    >
      {children}
    </BoardProvider>
  )

  it('should return board state', () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    expect(result.current.board?.id).toBe('board-1')
    expect(result.current.columns).toHaveLength(2)
    expect(result.current.cards).toHaveLength(1)
  })

  it('should add a card', async () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    act(() => {
      result.current.addCard({
        id: 'card-2',
        title: 'New Task',
        position: 1,
        columnId: 'col-1',
        status: 'TODO',
      })
    })

    await waitFor(() => {
      expect(result.current.cards).toHaveLength(2)
    })

    const newCard = result.current.cards.find((c) => c.id === 'card-2')
    expect(newCard?.title).toBe('New Task')
  })

  it('should update a card', async () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    act(() => {
      result.current.updateCard('card-1', { title: 'Updated Task' })
    })

    await waitFor(() => {
      const updatedCard = result.current.cards.find((c) => c.id === 'card-1')
      expect(updatedCard?.title).toBe('Updated Task')
    })
  })

  it('should delete a card', async () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    act(() => {
      result.current.deleteCard('card-1')
    })

    await waitFor(() => {
      expect(result.current.cards).toHaveLength(0)
    })
  })

  it('should move a card between columns', async () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    act(() => {
      result.current.moveCard('card-1', 'col-2', 0)
    })

    await waitFor(() => {
      const movedCard = result.current.cards.find((c) => c.id === 'card-1')
      expect(movedCard?.columnId).toBe('col-2')
    })
  })

  it('should get card by id', () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    const card = result.current.getCard('card-1')
    expect(card?.title).toBe('Task 1')

    const nonExistent = result.current.getCard('non-existent')
    expect(nonExistent).toBeUndefined()
  })

  it('should get cards by column', () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    const cardsInCol1 = result.current.getCardsByColumn('col-1')
    expect(cardsInCol1).toHaveLength(1)
    expect(cardsInCol1[0].id).toBe('card-1')

    const cardsInCol2 = result.current.getCardsByColumn('col-2')
    expect(cardsInCol2).toHaveLength(0)
  })

  it('should add a column', async () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    act(() => {
      result.current.addColumn({
        id: 'col-3',
        title: 'Done',
        position: 2,
        cardIds: [],
      })
    })

    await waitFor(() => {
      expect(result.current.columns).toHaveLength(3)
    })

    const newColumn = result.current.columns.find((c) => c.id === 'col-3')
    expect(newColumn?.title).toBe('Done')
  })

  it('should update a column', async () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    act(() => {
      result.current.updateColumn('col-1', { title: 'Backlog' })
    })

    await waitFor(() => {
      const updatedColumn = result.current.columns.find((c) => c.id === 'col-1')
      expect(updatedColumn?.title).toBe('Backlog')
    })
  })

  it('should delete a column', async () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    act(() => {
      result.current.deleteColumn('col-2')
    })

    await waitFor(() => {
      expect(result.current.columns).toHaveLength(1)
    })
  })

  it('should get column by id', () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    const column = result.current.getColumn('col-1')
    expect(column?.title).toBe('To Do')

    const nonExistent = result.current.getColumn('non-existent')
    expect(nonExistent).toBeUndefined()
  })

  it('should update board', async () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    act(() => {
      result.current.updateBoard({ title: 'Updated Board' })
    })

    await waitFor(() => {
      expect(result.current.board?.title).toBe('Updated Board')
    })
  })

  it('should provide stable callback references', () => {
    const { result, rerender } = renderHook(() => useBoard(), { wrapper })

    const initialAddCard = result.current.addCard
    const initialUpdateCard = result.current.updateCard

    rerender()

    // Callbacks should be the same reference (memoized with useCallback)
    expect(result.current.addCard).toBe(initialAddCard)
    expect(result.current.updateCard).toBe(initialUpdateCard)
  })

  it('should handle concurrent updates', async () => {
    const { result } = renderHook(() => useBoard(), { wrapper })

    act(() => {
      // Add multiple cards at once
      result.current.addCard({
        id: 'card-2',
        title: 'Task 2',
        position: 1,
        columnId: 'col-1',
        status: 'TODO',
      })
      result.current.addCard({
        id: 'card-3',
        title: 'Task 3',
        position: 2,
        columnId: 'col-1',
        status: 'TODO',
      })
    })

    await waitFor(() => {
      expect(result.current.cards).toHaveLength(3)
    })
  })
})
