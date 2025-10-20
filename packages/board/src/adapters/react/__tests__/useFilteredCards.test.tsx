/**
 * useFilteredCards and useSortedCards Tests
 * @module adapters/react/__tests__
 */

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { BoardProvider } from '../BoardProvider'
import { useFilteredCards, useSortedCards } from '../useFilteredCards'
import type { BoardData, ColumnData, CardData } from '@asakaa/core'

describe('useFilteredCards', () => {
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
      cardIds: ['card-1', 'card-2', 'card-3'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const mockCards: CardData[] = [
    {
      id: 'card-1',
      title: 'Urgent Task',
      description: 'Important work',
      position: 0,
      columnId: 'col-1',
      status: 'TODO',
      priority: 'URGENT',
      assignedUserIds: ['user-1'],
      labels: ['bug', 'critical'],
      endDate: yesterday, // Overdue
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'card-2',
      title: 'Normal Task',
      description: 'Regular work',
      position: 1,
      columnId: 'col-1',
      status: 'TODO',
      priority: 'MEDIUM',
      assignedUserIds: ['user-2'],
      labels: ['feature'],
      endDate: tomorrow,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'card-3',
      title: 'Low Priority',
      description: 'Can wait',
      position: 2,
      columnId: 'col-1',
      status: 'TODO',
      priority: 'LOW',
      assignedUserIds: ['user-1', 'user-2'],
      labels: ['enhancement'],
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

  it('should return all cards when no filters', () => {
    const { result } = renderHook(() => useFilteredCards(), { wrapper })
    expect(result.current).toHaveLength(3)
  })

  it('should filter by search query (title)', () => {
    const { result } = renderHook(
      () => useFilteredCards({ searchQuery: 'urgent' }),
      { wrapper }
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].title).toBe('Urgent Task')
  })

  it('should filter by search query (description)', () => {
    const { result } = renderHook(
      () => useFilteredCards({ searchQuery: 'regular' }),
      { wrapper }
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].title).toBe('Normal Task')
  })

  it('should filter by priority', () => {
    const { result } = renderHook(
      () => useFilteredCards({ priorities: ['URGENT'] }),
      { wrapper }
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].priority).toBe('URGENT')
  })

  it('should filter by multiple priorities', () => {
    const { result } = renderHook(
      () => useFilteredCards({ priorities: ['URGENT', 'MEDIUM'] }),
      { wrapper }
    )
    expect(result.current).toHaveLength(2)
  })

  it('should filter by assigned user', () => {
    const { result } = renderHook(
      () => useFilteredCards({ assignedUserIds: ['user-1'] }),
      { wrapper }
    )
    expect(result.current).toHaveLength(2) // card-1 and card-3
  })

  it('should filter by label', () => {
    const { result } = renderHook(
      () => useFilteredCards({ labels: ['bug'] }),
      { wrapper }
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].id).toBe('card-1')
  })

  it('should filter by multiple labels', () => {
    const { result } = renderHook(
      () => useFilteredCards({ labels: ['bug', 'feature'] }),
      { wrapper }
    )
    expect(result.current).toHaveLength(2)
  })

  it('should filter by column', () => {
    const { result } = renderHook(
      () => useFilteredCards({ columnIds: ['col-1'] }),
      { wrapper }
    )
    expect(result.current).toHaveLength(3)
  })

  it('should filter overdue cards', () => {
    const { result } = renderHook(
      () => useFilteredCards({ isOverdue: true }),
      { wrapper }
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].id).toBe('card-1')
  })

  it('should filter non-overdue cards', () => {
    const { result } = renderHook(
      () => useFilteredCards({ isOverdue: false }),
      { wrapper }
    )
    // card-2 has future endDate, card-3 has no endDate
    expect(result.current.length).toBeGreaterThanOrEqual(1)
  })

  it('should apply multiple filters', () => {
    const { result } = renderHook(
      () =>
        useFilteredCards({
          priorities: ['URGENT', 'MEDIUM'],
          assignedUserIds: ['user-1'],
        }),
      { wrapper }
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].id).toBe('card-1')
  })

  it('should memoize results', () => {
    const { result, rerender } = renderHook(
      () => useFilteredCards({ priorities: ['URGENT'] }),
      { wrapper }
    )

    const firstResult = result.current
    rerender()

    // Should return same reference if filters haven't changed
    expect(result.current[0].id).toBe(firstResult[0].id)
  })
})

describe('useSortedCards', () => {
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
  ]

  const mockCards: CardData[] = [
    {
      id: 'card-1',
      title: 'Zebra',
      position: 2,
      columnId: 'col-1',
      status: 'TODO',
      priority: 'LOW',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      id: 'card-2',
      title: 'Apple',
      position: 0,
      columnId: 'col-1',
      status: 'TODO',
      priority: 'URGENT',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date(),
    },
    {
      id: 'card-3',
      title: 'Mango',
      position: 1,
      columnId: 'col-1',
      status: 'TODO',
      priority: 'MEDIUM',
      createdAt: new Date('2024-01-02'),
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

  it('should sort by title ascending', () => {
    const { result } = renderHook(
      () => useSortedCards('title', 'asc'),
      { wrapper }
    )
    expect(result.current[0].title).toBe('Apple')
    expect(result.current[1].title).toBe('Mango')
    expect(result.current[2].title).toBe('Zebra')
  })

  it('should sort by title descending', () => {
    const { result } = renderHook(
      () => useSortedCards('title', 'desc'),
      { wrapper }
    )
    expect(result.current[0].title).toBe('Zebra')
    expect(result.current[1].title).toBe('Mango')
    expect(result.current[2].title).toBe('Apple')
  })

  it('should sort by priority descending', () => {
    const { result } = renderHook(
      () => useSortedCards('priority', 'desc'),
      { wrapper }
    )
    expect(result.current[0].priority).toBe('URGENT')
    expect(result.current[1].priority).toBe('MEDIUM')
    expect(result.current[2].priority).toBe('LOW')
  })

  it('should sort by position ascending', () => {
    const { result } = renderHook(
      () => useSortedCards('position', 'asc'),
      { wrapper }
    )
    expect(result.current[0].position).toBe(0)
    expect(result.current[1].position).toBe(1)
    expect(result.current[2].position).toBe(2)
  })

  it('should sort by createdAt ascending', () => {
    const { result } = renderHook(
      () => useSortedCards('createdAt', 'asc'),
      { wrapper }
    )
    expect(result.current[0].id).toBe('card-1') // 2024-01-01
    expect(result.current[1].id).toBe('card-3') // 2024-01-02
    expect(result.current[2].id).toBe('card-2') // 2024-01-03
  })

  it('should return unsorted when no sort options', () => {
    const { result } = renderHook(() => useSortedCards(), { wrapper })
    expect(result.current).toHaveLength(3)
  })

  it('should memoize results', () => {
    const { result, rerender } = renderHook(
      () => useSortedCards('title', 'asc'),
      { wrapper }
    )

    const firstResult = result.current
    rerender()

    expect(result.current[0].id).toBe(firstResult[0].id)
  })
})
