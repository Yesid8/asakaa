/**
 * FilterBar Component
 * Advanced filtering and sorting UI
 */

import { useCallback } from 'react'
import type { Priority, User } from '../../types'
import type { FilterState, SortState, SortBy } from '../../hooks/useFilters'
import './filter-bar.css'

export interface FilterBarProps {
  /** Current filter state */
  filters: FilterState
  /** Current sort state */
  sort: SortState
  /** Update filters callback */
  onFiltersChange: (filters: Partial<FilterState>) => void
  /** Update sort callback */
  onSortChange: (sort: Partial<SortState>) => void
  /** Reset all filters callback */
  onReset: () => void
  /** Quick filter: My tasks */
  onFilterMyTasks?: () => void
  /** Quick filter: Overdue */
  onFilterOverdue?: () => void
  /** Quick filter: High priority */
  onFilterHighPriority?: () => void
  /** Available users for assignee filter */
  availableUsers?: User[]
  /** Available labels for label filter */
  availableLabels?: string[]
  /** Available columns for column filter */
  availableColumns?: Array<{ id: string; title: string }>
  /** Show quick filters */
  showQuickFilters?: boolean
  /** Compact mode */
  compact?: boolean
}

const PRIORITY_OPTIONS: Priority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']

const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'created', label: 'Date Created' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'title', label: 'Title' },
  { value: 'estimate', label: 'Estimate' },
]

export function FilterBar({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onReset,
  onFilterMyTasks,
  onFilterOverdue,
  onFilterHighPriority,
  availableUsers = [],
  availableLabels = [],
  availableColumns: _availableColumns = [],
  showQuickFilters = true,
  compact = false,
}: FilterBarProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ search: e.target.value })
    },
    [onFiltersChange]
  )

  const handleDateFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({ dateFilter: e.target.value as any })
    },
    [onFiltersChange]
  )


  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSortChange({ by: e.target.value as SortBy })
    },
    [onSortChange]
  )

  const handleSortOrderToggle = useCallback(() => {
    onSortChange({ order: sort.order === 'asc' ? 'desc' : 'asc' })
  }, [sort.order, onSortChange])

  const hasActiveFilters =
    filters.search ||
    filters.dateFilter !== 'all' ||
    filters.priorities.length > 0 ||
    filters.assignees.length > 0 ||
    filters.labels.length > 0 ||
    sort.by !== 'none'

  return (
    <div className={`filter-bar ${compact ? 'filter-bar--compact' : ''}`}>
      {/* Quick Filters */}
      {showQuickFilters && (
        <div className="filter-bar__quick">
          <span className="filter-bar__label">Quick:</span>
          {onFilterMyTasks && (
            <button
              onClick={onFilterMyTasks}
              className="filter-bar__quick-btn"
              title="Show only my tasks"
            >
              My Tasks
            </button>
          )}
          {onFilterOverdue && (
            <button
              onClick={onFilterOverdue}
              className="filter-bar__quick-btn"
              title="Show overdue tasks"
            >
              Overdue
            </button>
          )}
          {onFilterHighPriority && (
            <button
              onClick={onFilterHighPriority}
              className="filter-bar__quick-btn"
              title="Show high priority tasks"
            >
              High Priority
            </button>
          )}
        </div>
      )}

      {/* Main Filters */}
      <div className="filter-bar__main">
        {/* Search */}
        <div className="filter-bar__field">
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleSearchChange}
            className="filter-bar__search"
          />
        </div>

        {/* Date Filter */}
        <div className="filter-bar__field">
          <select
            value={filters.dateFilter}
            onChange={handleDateFilterChange}
            className="filter-bar__select"
          >
            <option value="all">All Dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
          </select>
        </div>

        {/* Priority Filter - Dropdown */}
        <div className="filter-bar__field">
          <select
            value={filters.priorities[0] || 'all'}
            onChange={(e) => {
              const value = e.target.value
              onFiltersChange({
                priorities: value === 'all' ? [] : [value as Priority]
              })
            }}
            className="filter-bar__select"
          >
            <option value="all">All Priorities</option>
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee Filter - Dropdown */}
        {availableUsers.length > 0 && (
          <div className="filter-bar__field">
            <select
              value={filters.assignees[0] || 'all'}
              onChange={(e) => {
                const value = e.target.value
                onFiltersChange({
                  assignees: value === 'all' ? [] : [value]
                })
              }}
              className="filter-bar__select"
            >
              <option value="all">All Assignees</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Label Filter - Dropdown */}
        {availableLabels.length > 0 && (
          <div className="filter-bar__field">
            <select
              value={filters.labels[0] || 'all'}
              onChange={(e) => {
                const value = e.target.value
                onFiltersChange({
                  labels: value === 'all' ? [] : [value]
                })
              }}
              className="filter-bar__select"
            >
              <option value="all">All Labels</option>
              {availableLabels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort */}
        <div className="filter-bar__field filter-bar__sort">
          <span className="filter-bar__label">Sort:</span>
          <select
            value={sort.by}
            onChange={handleSortChange}
            className="filter-bar__select filter-bar__select--sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {sort.by !== 'none' && (
            <button
              onClick={handleSortOrderToggle}
              className="filter-bar__sort-toggle"
              title={`Sort ${sort.order === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sort.order === 'asc' ? '↑' : '↓'}
            </button>
          )}
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="filter-bar__reset"
            title="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
