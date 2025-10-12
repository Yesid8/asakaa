/**
 * Column Component
 * Vertical column containing cards
 * @module components/Column
 */

import { memo, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Column as ColumnType, Card as CardType } from '../../types'
import type { User } from '../Card/UserAssignmentSelector'
import { Card } from '../Card'
import { cn, shouldVirtualize } from '../../utils'

export interface ColumnProps {
  /** Column data */
  column: ColumnType
  /** Cards in this column */
  cards: CardType[]
  /** Custom column renderer */
  renderColumn?: (column: ColumnType, cards: CardType[]) => React.ReactNode
  /** Custom card renderer */
  renderCard?: (card: CardType) => React.ReactNode
  /** Custom header renderer */
  renderHeader?: (column: ColumnType, cardCount: number) => React.ReactNode
  /** Custom empty state */
  renderEmptyState?: (column: ColumnType) => React.ReactNode
  /** Card click handler */
  onCardClick?: (card: CardType) => void
  /** Card update handler */
  onCardUpdate?: (cardId: string, updates: Partial<CardType>) => void
  /** Available users for assignment */
  availableUsers?: User[]
  /** All cards (for dependencies) */
  allCards?: CardType[]
  /** Enable virtualization */
  enableVirtualization?: boolean
  /** Estimated card height for virtualization */
  cardHeight?: number
  /** Is column collapsed */
  isCollapsed?: boolean
  /** Toggle collapse */
  onToggleCollapse?: () => void
  /** Custom className */
  className?: string
}

/**
 * Column Component
 * Uses virtualization for large lists automatically
 */
export const Column = memo<ColumnProps>(
  ({
    column,
    cards,
    renderColumn,
    renderCard,
    renderHeader,
    renderEmptyState,
    onCardClick,
    onCardUpdate,
    availableUsers,
    allCards,
    enableVirtualization,
    cardHeight = 120,
    isCollapsed,
    onToggleCollapse,
    className,
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: column.id,
      data: {
        type: 'column',
        column,
      },
    })

    const parentRef = useRef<HTMLDivElement>(null)

    // Auto-enable virtualization for large lists
    const useVirtualization =
      enableVirtualization ?? shouldVirtualize(cards.length)

    // Setup virtualizer
    const virtualizer = useVirtualizer({
      count: cards.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => cardHeight,
      enabled: useVirtualization,
    })

    // Custom column renderer
    if (renderColumn) {
      return (
        <div ref={setNodeRef} className={className}>
          {renderColumn(column, cards)}
        </div>
      )
    }

    // Check WIP limit violation
    const isOverWipLimit = column.wipLimit
      ? cards.length > column.wipLimit
      : false

    return (
      <div
        ref={setNodeRef}
        className={cn(
          'asakaa-column',
          isOver && 'ring-2 ring-asakaa-accent-blue',
          isOverWipLimit && 'ring-2 ring-asakaa-accent-red',
          className
        )}
      >
        {/* Header */}
        {renderHeader ? (
          renderHeader(column, cards.length)
        ) : (
          <div className="asakaa-column-header">
            <h2 className="asakaa-column-title">{column.title}</h2>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'asakaa-column-count',
                  isOverWipLimit && 'bg-asakaa-accent-red/20 text-asakaa-accent-red'
                )}
              >
                {cards.length}
                {column.wipLimit && ` / ${column.wipLimit}`}
              </span>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="text-asakaa-text-tertiary hover:text-asakaa-text-primary"
                  aria-label={isCollapsed ? 'Expand column' : 'Collapse column'}
                >
                  {isCollapsed ? '▶' : '▼'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cards */}
        {!isCollapsed && (
          <div
            ref={parentRef}
            className="asakaa-column-cards"
            style={{
              maxHeight: useVirtualization ? '600px' : undefined,
            }}
          >
            <SortableContext
              items={cards.map((card) => card.id)}
              strategy={verticalListSortingStrategy}
            >
              {cards.length === 0 ? (
                // Empty state
                renderEmptyState ? (
                  renderEmptyState(column)
                ) : (
                  <div className="asakaa-drop-zone asakaa-empty">
                    <p>Drop cards here</p>
                  </div>
                )
              ) : useVirtualization ? (
                // Virtualized list
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    position: 'relative',
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const card = cards[virtualItem.index]
                    if (!card) return null

                    return (
                      <div
                        key={card.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <Card
                          card={card}
                          render={renderCard}
                          onClick={onCardClick}
                          onUpdate={onCardUpdate}
                          availableUsers={availableUsers}
                          allCards={allCards}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Regular list
                cards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    render={renderCard}
                    onClick={onCardClick}
                    onUpdate={onCardUpdate}
                    availableUsers={availableUsers}
                    allCards={allCards}
                  />
                ))
              )}
            </SortableContext>
          </div>
        )}
      </div>
    )
  },
  // Memoization comparison
  (prevProps, nextProps) => {
    return (
      prevProps.column.id === nextProps.column.id &&
      prevProps.column.title === nextProps.column.title &&
      prevProps.cards.length === nextProps.cards.length &&
      prevProps.isCollapsed === nextProps.isCollapsed &&
      // Check if card IDs changed (position changes)
      JSON.stringify(prevProps.cards.map((c) => c.id)) ===
        JSON.stringify(nextProps.cards.map((c) => c.id))
    )
  }
)

Column.displayName = 'Column'
