import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKanbanState } from '../useKanbanState'
import type { Board } from '../../types'

const initialBoard: Board = {
  id: 'board-1',
  columns: [
    { id: 'col-1', title: 'To Do', position: 1000, cardIds: ['card-1'] },
    { id: 'col-2', title: 'Done', position: 2000, cardIds: [] },
  ],
  cards: [
    {
      id: 'card-1',
      title: 'Task 1',
      position: 1000,
      columnId: 'col-1',
    },
  ],
}

describe('useKanbanState', () => {
  it('initializes with provided board', () => {
    const { result } = renderHook(() =>
      useKanbanState({ initialBoard })
    )

    expect(result.current.board).toEqual(initialBoard)
  })

  it('moves card between columns', () => {
    const { result } = renderHook(() =>
      useKanbanState({ initialBoard })
    )

    act(() => {
      result.current.callbacks.onCardMove?.('card-1', 'col-2', 1000)
    })

    const updatedCard = result.current.board.cards.find(
      (c) => c.id === 'card-1'
    )
    expect(updatedCard?.columnId).toBe('col-2')
  })

  it('updates card properties', () => {
    const { result } = renderHook(() =>
      useKanbanState({ initialBoard })
    )

    act(() => {
      result.current.callbacks.onCardUpdate?.('card-1', {
        title: 'Updated Task',
        priority: 'HIGH',
      })
    })

    const updatedCard = result.current.board.cards.find(
      (c) => c.id === 'card-1'
    )
    expect(updatedCard?.title).toBe('Updated Task')
    expect(updatedCard?.priority).toBe('HIGH')
  })

  it('deletes card', () => {
    const { result } = renderHook(() =>
      useKanbanState({ initialBoard })
    )

    act(() => {
      result.current.callbacks.onCardDelete?.('card-1')
    })

    expect(result.current.board.cards).toHaveLength(0)
    expect(result.current.board.columns[0]?.cardIds).toHaveLength(0)
  })

  it('calls onPersist when board changes', () => {
    const onPersist = vi.fn()

    const { result } = renderHook(() =>
      useKanbanState({ initialBoard, onPersist })
    )

    act(() => {
      result.current.callbacks.onCardUpdate?.('card-1', {
        title: 'New Title',
      })
    })

    expect(onPersist).toHaveBeenCalled()
  })

  it('creates new column', () => {
    const { result } = renderHook(() =>
      useKanbanState({ initialBoard })
    )

    act(() => {
      result.current.callbacks.onColumnCreate?.({
        title: 'In Progress',
        position: 1500,
      })
    })

    expect(result.current.board.columns).toHaveLength(3)
    expect(
      result.current.board.columns.find((c) => c.title === 'In Progress')
    ).toBeDefined()
  })

  it('deletes column and its cards', () => {
    const { result } = renderHook(() =>
      useKanbanState({ initialBoard })
    )

    act(() => {
      result.current.callbacks.onColumnDelete?.('col-1')
    })

    expect(result.current.board.columns).toHaveLength(1)
    expect(result.current.board.cards).toHaveLength(0)
  })
})
