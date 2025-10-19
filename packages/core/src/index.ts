/**
 * @asakaa/core - Framework-agnostic core logic
 *
 * Pure TypeScript business logic with 0 UI dependencies.
 * Use with React, Vue, Svelte, or Vanilla JS.
 *
 * @packageDocumentation
 */

// Models
export { Card, Column, Board } from './models'

// Store
export { Store, BoardStore } from './store'
export type { BoardState } from './store'

// Types
export type {
  // Base types
  Priority,
  CardStatus,
  BaseEntity,
  CardData,
  ColumnData,
  BoardData,
  BoardSettings,
  UserData,
  // Event types
  EventListener,
  StoreEvent,
  CardEvent,
  ColumnEvent,
  BoardEvent,
  AnyEvent,
  EventType,
} from './types'

// Adapters
export { BoardController } from './adapters/vanilla'
export type { BoardControllerOptions, EventHandler } from './adapters/vanilla'
