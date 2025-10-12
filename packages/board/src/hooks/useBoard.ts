/**
 * useBoard Hook - Simplified API for board state management
 * This is the recommended hook for most use cases
 * @module hooks/useBoard
 */

import { useMemo } from 'react'
import { useKanbanState } from './useKanbanState'
import type { Board, BoardCallbacks, User, KanbanBoardProps } from '../types'

export interface UseBoardOptions {
  /** Initial board data */
  initialData: Board

  /** Available users for assignments */
  availableUsers?: User[]

  /** Auto-save callback (localStorage, API, etc.) */
  onSave?: (board: Board) => void | Promise<void>

  /** Debounce delay for auto-save (ms). Default: 1000 */
  saveDelay?: number
}

export interface UseBoardReturn {
  /** Props to spread directly on KanbanBoard component */
  props: Pick<KanbanBoardProps, 'board' | 'callbacks' | 'availableUsers'>

  /** Direct state access (for advanced usage) */
  board: Board

  /** Direct callbacks access (for advanced usage) */
  callbacks: BoardCallbacks

  /** Utility methods */
  utils: {
    /** Add a new card to a column */
    addCard: (columnId: string, title: string, data?: Partial<any>) => void
    /** Add a new column */
    addColumn: (title: string, position?: number) => void
    /** Clear all cards and columns */
    reset: () => void
  }
}

/**
 * Simplified hook for Kanban board state management
 *
 * @example
 * ```tsx
 * import { KanbanBoard, useBoard } from '@asakaa/board'
 *
 * function App() {
 *   const board = useBoard({
 *     initialData: myData,
 *     onSave: (board) => localStorage.setItem('board', JSON.stringify(board))
 *   })
 *
 *   return <KanbanBoard {...board.props} />
 * }
 * ```
 */
export function useBoard({
  initialData,
  availableUsers = [],
  onSave,
}: UseBoardOptions): UseBoardReturn {
  const { board, callbacks, helpers } = useKanbanState({
    initialBoard: initialData,
    onPersist: onSave,
  })

  const utils = useMemo(
    () => ({
      addCard: (columnId: string, title: string, data: Partial<any> = {}) => {
        helpers.addCard({
          title,
          columnId,
          position: board.cards.filter((c) => c.columnId === columnId).length,
          ...data,
        })
      },
      addColumn: (title: string, position?: number) => {
        helpers.addColumn({
          title,
          position: position ?? board.columns.length,
        })
      },
      reset: helpers.clearBoard,
    }),
    [board.cards, board.columns.length, helpers]
  )

  const props = useMemo(
    () => ({
      board,
      callbacks,
      availableUsers,
    }),
    [board, callbacks, availableUsers]
  )

  return {
    props,
    board,
    callbacks,
    utils,
  }
}
