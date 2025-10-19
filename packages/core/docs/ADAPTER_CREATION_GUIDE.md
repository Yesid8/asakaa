# Adapter Creation Guide

## Overview

This guide shows how to create framework adapters for @asakaa/core. The core package is framework-agnostic, so you can create adapters for any UI framework.

**Available Adapters**:
- ✅ **React** - `@asakaa/board/adapters/react`
- ✅ **Vanilla JS** - `@asakaa/core` (BoardController)
- 📝 **Vue** - Guide below
- 📝 **Svelte** - Guide below

---

## Architecture

All adapters follow the same pattern:

```
@asakaa/core (Framework-agnostic)
├── Models (Card, Column, Board) - Immutable entities
├── Store (BoardStore) - State management with events
└── Types - TypeScript interfaces

Framework Adapter (Vue/React/Svelte)
├── Provider/Plugin - Initialize store
├── Hooks/Composables - Reactive state
└── Components (optional) - UI components
```

---

## Vue 3 Adapter (Composition API)

### 1. Create Vue Plugin

**File**: `packages/vue/src/plugin.ts`

```typescript
import { App, Plugin } from 'vue'
import { BoardStore } from '@asakaa/core'
import type { BoardData, ColumnData, CardData } from '@asakaa/core'

export interface AsakaaBoardOptions {
  initialData?: {
    board?: BoardData
    columns?: ColumnData[]
    cards?: CardData[]
  }
}

const AsakaaBoardSymbol = Symbol('asakaa-board')

export const AsakaaBoard: Plugin = {
  install(app: App, options?: AsakaaBoardOptions) {
    // Initialize store
    const store = new BoardStore({
      board: options?.initialData?.board ? new Board(options.initialData.board) : null,
      columns: new Map(options?.initialData?.columns?.map(c => [c.id, new Column(c)]) || []),
      cards: new Map(options?.initialData?.cards?.map(c => [c.id, new Card(c)]) || []),
    })

    // Provide store globally
    app.provide(AsakaaBoardSymbol, store)
  }
}

export { AsakaaBoardSymbol }
```

### 2. Create Composables

**File**: `packages/vue/src/composables/useBoard.ts`

```typescript
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { AsakaaBoardSymbol } from '../plugin'
import type { BoardStore, Board, Column, Card, CardData, ColumnData } from '@asakaa/core'

export function useBoard() {
  const store = inject<BoardStore>(AsakaaBoardSymbol)

  if (!store) {
    throw new Error('AsakaaBoard plugin not installed. Use app.use(AsakaaBoard)')
  }

  // Reactive state
  const board = ref<Board | null>(store.getBoard())
  const columns = ref<Column[]>(store.getAllColumns())
  const cards = ref<Card[]>(store.getAllCards())

  // Subscribe to changes
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = store.subscribeAll(() => {
      board.value = store.getBoard()
      columns.value = store.getAllColumns()
      cards.value = store.getAllCards()
    })
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  // CRUD operations
  const addCard = (cardData: Omit<CardData, 'createdAt' | 'updatedAt'>) => {
    store.addCard(cardData)
  }

  const updateCard = (cardId: string, changes: Partial<Omit<CardData, 'id' | 'createdAt'>>) => {
    store.updateCard(cardId, changes)
  }

  const deleteCard = (cardId: string) => {
    store.deleteCard(cardId)
  }

  const moveCard = (cardId: string, toColumnId: string, newPosition: number) => {
    store.moveCard(cardId, toColumnId, newPosition)
  }

  const addColumn = (columnData: Omit<ColumnData, 'createdAt' | 'updatedAt'>) => {
    store.addColumn(columnData)
  }

  const updateColumn = (columnId: string, changes: Partial<Omit<ColumnData, 'id' | 'createdAt'>>) => {
    store.updateColumn(columnId, changes)
  }

  const deleteColumn = (columnId: string) => {
    store.deleteColumn(columnId)
  }

  const getCardsByColumn = (columnId: string) => {
    return store.getCardsByColumn(columnId)
  }

  return {
    // State
    board,
    columns,
    cards,

    // Card operations
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    getCardsByColumn,

    // Column operations
    addColumn,
    updateColumn,
    deleteColumn,
  }
}
```

### 3. Create Filtered Cards Composable

**File**: `packages/vue/src/composables/useFilteredCards.ts`

```typescript
import { computed } from 'vue'
import { useBoard } from './useBoard'
import type { Priority } from '@asakaa/core'

export interface CardFilters {
  searchQuery?: string
  priorities?: Priority[]
  assignedUserIds?: string[]
  labels?: string[]
  columnIds?: string[]
  isOverdue?: boolean
}

export function useFilteredCards(filters?: CardFilters) {
  const { cards } = useBoard()

  return computed(() => {
    if (!filters) return cards.value

    return cards.value.filter(card => {
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesTitle = card.title.toLowerCase().includes(query)
        const matchesDesc = card.description?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDesc) return false
      }

      // Priorities
      if (filters.priorities && filters.priorities.length > 0) {
        if (!card.priority || !filters.priorities.includes(card.priority)) {
          return false
        }
      }

      // Assigned users
      if (filters.assignedUserIds && filters.assignedUserIds.length > 0) {
        const hasAssignee = filters.assignedUserIds.some(userId =>
          card.assignedUserIds?.includes(userId)
        )
        if (!hasAssignee) return false
      }

      // Labels
      if (filters.labels && filters.labels.length > 0) {
        const hasLabel = filters.labels.some(label =>
          card.labels?.includes(label)
        )
        if (!hasLabel) return false
      }

      // Columns
      if (filters.columnIds && filters.columnIds.length > 0) {
        if (!filters.columnIds.includes(card.columnId)) return false
      }

      // Overdue
      if (filters.isOverdue !== undefined) {
        if (filters.isOverdue !== card.isOverdue()) return false
      }

      return true
    })
  })
}
```

### 4. Usage in Vue App

```vue
<!-- App.vue -->
<script setup lang="ts">
import { useBoard, useFilteredCards } from '@asakaa/vue'
import { ref } from 'vue'

const { board, columns, cards, addCard, moveCard } = useBoard()

const filters = ref({
  searchQuery: '',
  priorities: []
})

const filteredCards = useFilteredCards(filters)

const handleAddCard = () => {
  addCard({
    id: `card-${Date.now()}`,
    title: 'New Task',
    position: 0,
    columnId: columns.value[0].id,
    status: 'TODO'
  })
}
</script>

<template>
  <div class="board">
    <h1>{{ board?.title }}</h1>

    <div class="columns">
      <div v-for="column in columns" :key="column.id" class="column">
        <h2>{{ column.title }}</h2>

        <div
          v-for="card in filteredCards.filter(c => c.columnId === column.id)"
          :key="card.id"
          class="card"
        >
          <h3>{{ card.title }}</h3>
          <p>{{ card.description }}</p>
        </div>
      </div>
    </div>

    <button @click="handleAddCard">Add Card</button>
  </div>
</template>
```

### 5. Install in main.ts

```typescript
import { createApp } from 'vue'
import { AsakaaBoard } from '@asakaa/vue'
import App from './App.vue'

const app = createApp(App)

app.use(AsakaaBoard, {
  initialData: {
    board: { id: 'board-1', title: 'My Board', columnIds: [] },
    columns: [
      { id: 'col-1', title: 'To Do', position: 0, cardIds: [] },
      { id: 'col-2', title: 'Done', position: 1, cardIds: [] }
    ],
    cards: []
  }
})

app.mount('#app')
```

---

## Svelte Adapter (Stores)

### 1. Create Svelte Store

**File**: `packages/svelte/src/stores/boardStore.ts`

```typescript
import { writable, derived, readable } from 'svelte/store'
import { BoardStore, Board, Column, Card } from '@asakaa/core'
import type { BoardData, ColumnData, CardData } from '@asakaa/core'

// Create singleton board store
let boardStoreInstance: BoardStore | null = null

export function initializeBoardStore(initialData?: {
  board?: BoardData
  columns?: ColumnData[]
  cards?: CardData[]
}) {
  if (boardStoreInstance) {
    return boardStoreInstance
  }

  boardStoreInstance = new BoardStore({
    board: initialData?.board ? new Board(initialData.board) : null,
    columns: new Map(initialData?.columns?.map(c => [c.id, new Column(c)]) || []),
    cards: new Map(initialData?.cards?.map(c => [c.id, new Card(c)]) || []),
  })

  return boardStoreInstance
}

export function getBoardStore() {
  if (!boardStoreInstance) {
    throw new Error('Board store not initialized. Call initializeBoardStore() first.')
  }
  return boardStoreInstance
}

// Reactive stores
export const board = readable<Board | null>(null, (set) => {
  const store = getBoardStore()

  const unsubscribe = store.subscribeAll(() => {
    set(store.getBoard())
  })

  set(store.getBoard())

  return unsubscribe
})

export const columns = readable<Column[]>([], (set) => {
  const store = getBoardStore()

  const unsubscribe = store.subscribeAll(() => {
    set(store.getAllColumns())
  })

  set(store.getAllColumns())

  return unsubscribe
})

export const cards = readable<Card[]>([], (set) => {
  const store = getBoardStore()

  const unsubscribe = store.subscribeAll(() => {
    set(store.getAllCards())
  })

  set(store.getAllCards())

  return unsubscribe
})

// Actions
export const boardActions = {
  addCard: (cardData: Omit<CardData, 'createdAt' | 'updatedAt'>) => {
    getBoardStore().addCard(cardData)
  },

  updateCard: (cardId: string, changes: Partial<Omit<CardData, 'id' | 'createdAt'>>) => {
    getBoardStore().updateCard(cardId, changes)
  },

  deleteCard: (cardId: string) => {
    getBoardStore().deleteCard(cardId)
  },

  moveCard: (cardId: string, toColumnId: string, newPosition: number) => {
    getBoardStore().moveCard(cardId, toColumnId, newPosition)
  },

  addColumn: (columnData: Omit<ColumnData, 'createdAt' | 'updatedAt'>) => {
    getBoardStore().addColumn(columnData)
  },

  updateColumn: (columnId: string, changes: Partial<Omit<ColumnData, 'id' | 'createdAt'>>) => {
    getBoardStore().updateColumn(columnId, changes)
  },

  deleteColumn: (columnId: string) => {
    getBoardStore().deleteColumn(columnId)
  },

  getCardsByColumn: (columnId: string) => {
    return getBoardStore().getCardsByColumn(columnId)
  }
}
```

### 2. Create Filtered Cards Store

**File**: `packages/svelte/src/stores/filteredCards.ts`

```typescript
import { derived, writable } from 'svelte/store'
import { cards } from './boardStore'
import type { Card, Priority } from '@asakaa/core'

export interface CardFilters {
  searchQuery?: string
  priorities?: Priority[]
  assignedUserIds?: string[]
  labels?: string[]
  columnIds?: string[]
  isOverdue?: boolean
}

export const cardFilters = writable<CardFilters>({})

export const filteredCards = derived(
  [cards, cardFilters],
  ([$cards, $filters]) => {
    if (!$filters || Object.keys($filters).length === 0) {
      return $cards
    }

    return $cards.filter(card => {
      // Search query
      if ($filters.searchQuery) {
        const query = $filters.searchQuery.toLowerCase()
        const matchesTitle = card.title.toLowerCase().includes(query)
        const matchesDesc = card.description?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDesc) return false
      }

      // Priorities
      if ($filters.priorities && $filters.priorities.length > 0) {
        if (!card.priority || !$filters.priorities.includes(card.priority)) {
          return false
        }
      }

      // Other filters...

      return true
    })
  }
)
```

### 3. Usage in Svelte Component

```svelte
<!-- Board.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { initializeBoardStore, board, columns, cards, boardActions } from '@asakaa/svelte'
  import { filteredCards, cardFilters } from '@asakaa/svelte/stores/filteredCards'

  onMount(() => {
    initializeBoardStore({
      board: { id: 'board-1', title: 'My Board', columnIds: [] },
      columns: [
        { id: 'col-1', title: 'To Do', position: 0, cardIds: [] },
        { id: 'col-2', title: 'Done', position: 1, cardIds: [] }
      ],
      cards: []
    })
  })

  function handleAddCard() {
    boardActions.addCard({
      id: `card-${Date.now()}`,
      title: 'New Task',
      position: 0,
      columnId: $columns[0].id,
      status: 'TODO'
    })
  }

  function handleMoveCard(cardId: string, toColumnId: string) {
    const targetColumn = $columns.find(c => c.id === toColumnId)
    if (targetColumn) {
      boardActions.moveCard(cardId, toColumnId, targetColumn.cardIds.length)
    }
  }
</script>

<div class="board">
  <h1>{$board?.title || 'Untitled Board'}</h1>

  <div class="columns">
    {#each $columns as column (column.id)}
      <div class="column">
        <h2>{column.title}</h2>

        {#each $filteredCards.filter(c => c.columnId === column.id) as card (card.id)}
          <div class="card">
            <h3>{card.title}</h3>
            <p>{card.description || ''}</p>
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <button on:click={handleAddCard}>Add Card</button>
</div>

<style>
  .board {
    padding: 20px;
  }

  .columns {
    display: flex;
    gap: 20px;
  }

  .column {
    min-width: 300px;
    background: #f5f5f5;
    padding: 16px;
    border-radius: 8px;
  }

  .card {
    background: white;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 6px;
  }
</style>
```

---

## Adapter Best Practices

### 1. State Management

- **React**: Use Context + hooks with useState/useEffect
- **Vue**: Use provide/inject or composables with ref/reactive
- **Svelte**: Use readable/writable stores
- **Vanilla**: Use event listeners (on/off)

### 2. Reactivity

All adapters should subscribe to `store.subscribeAll()` to get updates:

```typescript
// React
useEffect(() => {
  const unsubscribe = store.subscribeAll(() => {
    // Update state
  })
  return unsubscribe
}, [store])

// Vue
onMounted(() => {
  unsubscribe = store.subscribeAll(() => {
    // Update refs
  })
})

// Svelte
readable(initialValue, (set) => {
  const unsubscribe = store.subscribeAll(() => {
    set(store.getState())
  })
  return unsubscribe
})
```

### 3. Performance

- Use memoization (React.memo, computed, derived)
- Implement virtual scrolling for large lists
- Debounce search/filter operations
- Use selective subscriptions when possible

### 4. TypeScript

- Export all types from @asakaa/core
- Provide typed hooks/composables
- Use strict mode

### 5. Testing

- Test store integration
- Test reactivity updates
- Test CRUD operations
- Mock @asakaa/core for unit tests

---

## Package Structure

```
packages/
├── core/                  # Framework-agnostic
│   ├── src/
│   │   ├── models/       # Card, Column, Board
│   │   ├── store/        # BoardStore
│   │   ├── types/        # TypeScript types
│   │   └── adapters/
│   │       └── vanilla/  # Vanilla JS adapter
│   └── package.json
│
├── board/                 # React UI + adapters
│   ├── src/
│   │   ├── components/   # React components
│   │   └── adapters/
│   │       └── react/    # React hooks
│   └── package.json
│
├── vue/                   # Vue adapter (future)
│   ├── src/
│   │   ├── composables/  # Vue composables
│   │   └── plugin.ts
│   └── package.json
│
└── svelte/                # Svelte adapter (future)
    ├── src/
    │   └── stores/       # Svelte stores
    └── package.json
```

---

## Publishing Adapters

### NPM Packages

- `@asakaa/core` - Framework-agnostic core
- `@asakaa/board` - React components + adapters
- `@asakaa/vue` - Vue adapter
- `@asakaa/svelte` - Svelte adapter

### Exports

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./composables": "./dist/composables/index.js",
    "./stores": "./dist/stores/index.js"
  }
}
```

---

## Resources

- [Vue Composition API](https://vuejs.org/guide/reusability/composables.html)
- [Svelte Stores](https://svelte.dev/docs/svelte-store)
- [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- [@asakaa/core Documentation](../README.md)

---

**Generated**: 2025-10-19
**Version**: v0.7.0
