import { useState, useMemo, useCallback } from 'react'
import type { Card, Priority } from '../types'

export type DateFilter = 'all' | 'overdue' | 'today' | 'this-week' | 'custom'
export type SortBy = 'created' | 'priority' | 'dueDate' | 'title' | 'estimate' | 'none'
export type SortOrder = 'asc' | 'desc'

export interface FilterState {
  dateFilter: DateFilter
  dateRange?: { start: Date; end: Date }
  priorities: Priority[]
  assignees: string[]
  labels: string[]
  columns: string[]
  search: string
}

export interface SortState {
  by: SortBy
  order: SortOrder
}

export interface UseFiltersOptions {
  initialFilters?: Partial<FilterState>
  initialSort?: Partial<SortState>
  currentUserId?: string
}

export interface UseFiltersReturn {
  filters: FilterState
  sort: SortState
  setFilters: (filters: Partial<FilterState>) => void
  setSort: (sort: Partial<SortState>) => void
  resetFilters: () => void
  filterMyTasks: () => void
  filterOverdue: () => void
  filterHighPriority: () => void
  applyFilters: (cards: Card[]) => Card[]
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
    // Reset all filters before applying "My Tasks"
    setFiltersState({
      ...DEFAULT_FILTERS,
      assignees: [currentUserId]
    })
  }, [currentUserId])

  const filterOverdue = useCallback(() => {
    // Reset all filters before applying "Overdue"
    setFiltersState({
      ...DEFAULT_FILTERS,
      dateFilter: 'overdue'
    })
  }, [])

  const filterHighPriority = useCallback(() => {
    // Reset all filters before applying "High Priority"
    setFiltersState({
      ...DEFAULT_FILTERS,
      priorities: ['HIGH', 'URGENT']
    })
  }, [])

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

      if (filters.search) {
        const query = filters.search.toLowerCase()
        filtered = filtered.filter(
          (card) =>
            card.title.toLowerCase().includes(query) ||
            card.description?.toLowerCase().includes(query)
        )
      }

      if (filters.dateFilter !== 'all') {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        filtered = filtered.filter((card) => {
          if (!card.endDate && !card.dueDate) return false

          const dueDate = card.endDate || card.dueDate
          if (!dueDate) return false

          const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate

          // Normalize both dates to UTC date parts for comparison
          // This fixes timezone issues when comparing date strings like '2025-10-20'
          const normalizeToDateParts = (date: Date) => ({
            year: date.getUTCFullYear(),
            month: date.getUTCMonth(),
            date: date.getUTCDate(),
          })

          const todayParts = {
            year: today.getFullYear(),
            month: today.getMonth(),
            date: today.getDate(),
          }
          const dueParts = normalizeToDateParts(due)

          switch (filters.dateFilter) {
            case 'overdue':
              // Compare as UTC dates - overdue means due date is before today
              const todayUTC = new Date(Date.UTC(todayParts.year, todayParts.month, todayParts.date))
              const dueUTC = new Date(Date.UTC(dueParts.year, dueParts.month, dueParts.date))
              return dueUTC < todayUTC
            case 'today':
              return (
                dueParts.year === todayParts.year &&
                dueParts.month === todayParts.month &&
                dueParts.date === todayParts.date
              )
            case 'this-week':
              // This week means from today until 7 days from now
              const todayTime = new Date(Date.UTC(todayParts.year, todayParts.month, todayParts.date)).getTime()
              const dueTime = new Date(Date.UTC(dueParts.year, dueParts.month, dueParts.date)).getTime()
              const weekFromNow = todayTime + (7 * 24 * 60 * 60 * 1000)
              return dueTime >= todayTime && dueTime <= weekFromNow
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

      if (filters.priorities.length > 0) {
        filtered = filtered.filter(
          (card) => card.priority && filters.priorities.includes(card.priority)
        )
      }

      if (filters.assignees.length > 0) {
        filtered = filtered.filter((card) => {
          const cardAssignees = card.assignedUserIds || (card.assigneeId ? [card.assigneeId] : [])
          return cardAssignees.some((id) => filters.assignees.includes(id))
        })
      }

      if (filters.labels.length > 0) {
        filtered = filtered.filter((card) => {
          return (
            card.labels &&
            card.labels.some((label) => filters.labels.includes(label))
          )
        })
      }

      if (filters.columns.length > 0) {
        filtered = filtered.filter((card) =>
          filters.columns.includes(card.columnId)
        )
      }

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
