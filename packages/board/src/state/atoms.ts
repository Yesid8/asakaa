/**
 * Jotai atoms for ASAKAA Kanban state management
 * Uses atomic pattern for optimal performance
 * @module state/atoms
 */

import { atom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'
import type { Board, Card, Column, DragState, SelectionState } from '../types'

// ============================================================================
// CORE DATA ATOMS
// ============================================================================

/**
 * Main board atom (controlled by consumer)
 * This is typically set by the parent component
 */
export const boardAtom = atom<Board>({
  id: '',
  columns: [],
  cards: [],
})

/**
 * Atom family for individual cards
 * Each card gets its own atom for granular updates
 * This prevents unnecessary re-renders
 */
export const cardAtomFamily = atomFamily((cardId: string) =>
  atom(
    (get) => {
      const board = get(boardAtom)
      return board.cards.find((card) => card.id === cardId)
    },
    (get, set, newCard: Card) => {
      const board = get(boardAtom)
      set(boardAtom, {
        ...board,
        cards: board.cards.map((card) =>
          card.id === cardId ? newCard : card
        ),
      })
    }
  )
)

/**
 * Atom family for individual columns
 * Each column gets its own atom
 */
export const columnAtomFamily = atomFamily((columnId: string) =>
  atom(
    (get) => {
      const board = get(boardAtom)
      return board.columns.find((col) => col.id === columnId)
    },
    (get, set, newColumn: Column) => {
      const board = get(boardAtom)
      set(boardAtom, {
        ...board,
        columns: board.columns.map((col) =>
          col.id === columnId ? newColumn : col
        ),
      })
    }
  )
)

// ============================================================================
// DERIVED ATOMS (Selectors)
// ============================================================================

/**
 * Get all column IDs (for iteration)
 */
export const columnIdsAtom = atom((get) => {
  const board = get(boardAtom)
  return board.columns.map((col) => col.id)
})

/**
 * Get cards for a specific column
 * Returns atom for optimal performance
 */
export const cardsInColumnAtomFamily = atomFamily((columnId: string) =>
  atom((get) => {
    const board = get(boardAtom)
    const column = board.columns.find((col) => col.id === columnId)
    if (!column) return []

    return column.cardIds
      .map((cardId) => board.cards.find((card) => card.id === cardId))
      .filter((card): card is Card => card !== undefined)
      .sort((a, b) => a.position - b.position)
  })
)

/**
 * Get total card count
 */
export const totalCardCountAtom = atom((get) => {
  const board = get(boardAtom)
  return board.cards.length
})

/**
 * Get card count per column
 */
export const columnCardCountAtomFamily = atomFamily((columnId: string) =>
  atom((get) => {
    const cards = get(cardsInColumnAtomFamily(columnId))
    return cards.length
  })
)

// ============================================================================
// DRAG & DROP STATE
// ============================================================================

/**
 * Current drag state
 */
export const dragStateAtom = atom<DragState>({
  isDragging: false,
  draggedCardId: null,
  sourceColumnId: null,
  targetColumnId: null,
})

/**
 * Active dragged card (computed)
 */
export const draggedCardAtom = atom((get) => {
  const dragState = get(dragStateAtom)
  if (!dragState.draggedCardId) return null

  const board = get(boardAtom)
  return board.cards.find((card) => card.id === dragState.draggedCardId) || null
})

// ============================================================================
// SELECTION STATE
// ============================================================================

/**
 * Multi-select state
 */
export const selectionStateAtom = atom<SelectionState>({
  selectedCardIds: [],
  lastSelectedCardId: null,
})

/**
 * Check if a card is selected
 */
export const isCardSelectedAtomFamily = atomFamily((cardId: string) =>
  atom((get) => {
    const selection = get(selectionStateAtom)
    return selection.selectedCardIds.includes(cardId)
  })
)

/**
 * Selected cards count
 */
export const selectedCountAtom = atom((get) => {
  const selection = get(selectionStateAtom)
  return selection.selectedCardIds.length
})

// ============================================================================
// UI STATE
// ============================================================================

/**
 * Loading state
 */
export const isLoadingAtom = atom(false)

/**
 * Error state
 */
export const errorAtom = atom<Error | string | null>(null)

/**
 * Collapsed columns (stored in localStorage)
 */
export const collapsedColumnsAtom = atomWithStorage<string[]>(
  'asakaa-collapsed-columns',
  []
)

/**
 * Check if column is collapsed
 */
export const isColumnCollapsedAtomFamily = atomFamily((columnId: string) =>
  atom(
    (get) => {
      const collapsed = get(collapsedColumnsAtom)
      return collapsed.includes(columnId)
    },
    (get, set, isCollapsed: boolean) => {
      const collapsed = get(collapsedColumnsAtom)
      if (isCollapsed) {
        set(collapsedColumnsAtom, [...collapsed, columnId])
      } else {
        set(collapsedColumnsAtom, collapsed.filter((id) => id !== columnId))
      }
    }
  )
)

// ============================================================================
// FILTER & SORT STATE
// ============================================================================

/**
 * Active search query
 */
export const searchQueryAtom = atom('')

/**
 * Filtered card IDs based on search
 */
export const filteredCardIdsAtom = atom((get) => {
  const board = get(boardAtom)
  const query = get(searchQueryAtom).toLowerCase().trim()

  if (!query) {
    return board.cards.map((card) => card.id)
  }

  return board.cards
    .filter(
      (card) =>
        card.title.toLowerCase().includes(query) ||
        card.description?.toLowerCase().includes(query) ||
        card.labels?.some((label) => label.toLowerCase().includes(query))
    )
    .map((card) => card.id)
})

// ============================================================================
// AI STATE (Optional)
// ============================================================================

/**
 * AI insights
 */
export const aiInsightsAtom = atom<any[]>([])

/**
 * AI loading state
 */
export const isAILoadingAtom = atom(false)

/**
 * AI availability
 */
export const isAIAvailableAtom = atom(false)
