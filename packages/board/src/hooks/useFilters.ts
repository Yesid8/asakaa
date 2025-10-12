/**
 * useFilters Hook - Advanced filtering and sorting for cards
 * @module hooks/useFilters
 */

import { useState, useMemo, useCallback } from 'react'
import type { Card, Priority } from '../types'

export type DateFilter = 'all' | 'overdue' | 'today' | 'this-week' | 'custom'
export type SortBy = 'created' | 'priority' | 'dueDate' | 'title' | 'estimate' | 'none'
export type SortOrder = 'asc' | 'desc'

export interface FilterState {
  /** Date filter type */
  dateFilter: DateFilter
  /** Custom date range (when dateFilter === 'custom') */
  dateRange?: { start: Date; end: Date }
  /** Filter by priorities */
  priorities: Priority[]
  /** Filter by assigned user IDs */
  assignees: string[]
  /** Filter by labels */
  labels: string[]
  /** Filter by column IDs */
  columns: string[]
  /** Search query */
  search: string
}

export interface SortState {
  /** Sort field */
  by: SortBy
  /** Sort order */
  order: SortOrder
}

export interface UseFiltersOptions {
  /** Initial filter state */
  initialFilters?: Partial<FilterState>
  /** Initial sort state */
  initialSort?: Partial<SortState>
  /** Current user ID (for "My tasks" quick filter) */
  currentUserId?: string
}

export interface UseFiltersReturn {
  /** Current filter state */
  filters: FilterState
  /** Current sort state */
  sort: SortState
  /** Update filters */
  setFilters: (filters: Partial<FilterState>) => void
  /** Update sort */
  setSort: (sort: Partial<SortState>) => void
  /** Reset all filters */
  resetFilters: () => void
  /** Quick filter: My tasks */
  filterMyTasks: () => void
  /** Quick filter: Overdue tasks */
  filterOverdue: () => void
  /** Quick filter: High priority */
  filterHighPriority: () => void
  /** Apply filters and sorting to cards */
  applyFilters: (cards: Card[]) => Card[]
  /** Check if any filters are active */
  hasActiveFilters: boolean
}

const DEFAULT_FILTERS: FilterState = {
  dateFilter: 'all',
  priorities: [],
  assignees: [],
  labels: [],
  columns: [],
  search: '',
}

const DEFAULT_SORT: SortState = {
  by: 'none',
  order: 'asc',
}

/**
 * Hook for filtering and sorting board cards
 *
 * @example
 * ```tsx
 * const { filters, setFilters, applyFilters, filterMyTasks } = useFilters({
 *   currentUserId: 'user-1'
 * })
 *
 * const filteredCards = applyFilters(board.cards)
 * ```
 */
export function useFilters({
  initialFilters = {},
  initialSort = {},
  currentUserId,
}: UseFiltersOptions = {}): UseFiltersReturn {
  const [filters, setFiltersState] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  })

  const [sort, setSortState] = useState<SortState>({
    ...DEFAULT_SORT,
    ...initialSort,
  })

  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const setSort = useCallback((newSort: Partial<SortState>) => {
    setSortState((prev) => ({ ...prev, ...newSort }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS)
    setSortState(DEFAULT_SORT)
  }, [])

  const filterMyTasks = useCallback(() => {
    if (!currentUserId) return
    setFilters({ assignees: [currentUserId] })
  }, [currentUserId, setFilters])

  const filterOverdue = useCallback(() => {
    setFilters({ dateFilter: 'overdue' })
  }, [setFilters])

  const filterHighPriority = useCallback(() => {
    setFilters({ priorities: ['HIGH', 'URGENT'] })
  }, [setFilters])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateFilter !== 'all' ||
      filters.priorities.length > 0 ||
      filters.assignees.length > 0 ||
      filters.labels.length > 0 ||
      filters.columns.length > 0 ||
      filters.search !== '' ||
      sort.by !== 'none'
    )
  }, [filters, sort])

  const applyFilters = useCallback(
    (cards: Card[]): Card[] => {
      let filtered = [...cards]

      // Apply search filter
      if (filters.search) {
        const query = filters.search.toLowerCase()
        filtered = filtered.filter(
          (card) =>
            card.title.toLowerCase().includes(query) ||
            card.description?.toLowerCase().includes(query)
        )
      }

      // Apply date filter
      if (filters.dateFilter !== 'all') {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        filtered = filtered.filter((card) => {
          if (!card.endDate && !card.dueDate) return false

          const dueDate = card.endDate || card.dueDate
          if (!dueDate) return false

          const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate

          switch (filters.dateFilter) {
            case 'overdue':
              return due < today
            case 'today':
              return (
                due.getFullYear() === today.getFullYear() &&
                due.getMonth() === today.getMonth() &&
                due.getDate() === today.getDate()
              )
            case 'this-week':
              const weekFromNow = new Date(today)
              weekFromNow.setDate(weekFromNow.getDate() + 7)
              return due >= today && due <= weekFromNow
            case 'custom':
              if (filters.dateRange) {
                return (
                  due >= filters.dateRange.start && due <= filters.dateRange.end
                )
              }
              return true
            default:
              return true
          }
        })
      }

      // Apply priority filter
      if (filters.priorities.length > 0) {
        filtered = filtered.filter(
          (card) => card.priority && filters.priorities.includes(card.priority)
        )
      }

      // Apply assignee filter
      if (filters.assignees.length > 0) {
        filtered = filtered.filter((card) => {
          const cardAssignees = card.assignedUserIds || (card.assigneeId ? [card.assigneeId] : [])
          return cardAssignees.some((id) => filters.assignees.includes(id))
        })
      }

      // Apply label filter
      if (filters.labels.length > 0) {
        filtered = filtered.filter((card) => {
          return (
            card.labels &&
            card.labels.some((label) => filters.labels.includes(label))
          )
        })
      }

      // Apply column filter
      if (filters.columns.length > 0) {
        filtered = filtered.filter((card) =>
          filters.columns.includes(card.columnId)
        )
      }

      // Apply sorting
      if (sort.by !== 'none') {
        filtered.sort((a, b) => {
          let comparison = 0

          switch (sort.by) {
            case 'created':
              const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0
              const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0
              comparison = aCreated - bCreated
              break

            case 'priority':
              const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
              const aPriority = priorityOrder[a.priority || 'LOW']
              const bPriority = priorityOrder[b.priority || 'LOW']
              comparison = aPriority - bPriority
              break

            case 'dueDate':
              const aDue = a.endDate || a.dueDate
              const bDue = b.endDate || b.dueDate
              if (!aDue) return 1
              if (!bDue) return -1
              const aTime = typeof aDue === 'string' ? new Date(aDue).getTime() : aDue.getTime()
              const bTime = typeof bDue === 'string' ? new Date(bDue).getTime() : bDue.getTime()
              comparison = aTime - bTime
              break

            case 'title':
              comparison = a.title.localeCompare(b.title)
              break

            case 'estimate':
              const aEst = a.estimatedTime || 0
              const bEst = b.estimatedTime || 0
              comparison = aEst - bEst
              break

            default:
              comparison = 0
          }

          return sort.order === 'asc' ? comparison : -comparison
        })
      }

      return filtered
    },
    [filters, sort]
  )

  return {
    filters,
    sort,
    setFilters,
    setSort,
    resetFilters,
    filterMyTasks,
    filterOverdue,
    filterHighPriority,
    applyFilters,
    hasActiveFilters,
  }
}
