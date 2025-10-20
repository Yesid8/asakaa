# Migration Guide: v0.6.0 → v0.7.0

## Table of Contents

1. [Overview](#overview)
2. [Breaking Changes](#breaking-changes)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [API Changes](#api-changes)
5. [Code Examples](#code-examples)
6. [Troubleshooting](#troubleshooting)
7. [Benefits](#benefits)

---

## Overview

ASAKAA v0.7.0 introduces significant architectural improvements while maintaining backward compatibility where possible. This guide will help you migrate from v0.6.0 to v0.7.0.

### What's New in v0.7.0

- **AsakaaRuntime** - Universal orchestrator for all components
- **ViewAdapter System** - Support for multiple views (Kanban, Gantt, Table, etc.)
- **Plugin Architecture** - Extensibility without forking
- **Zero-Dependency State** - Removed Jotai, -14.25KB bundle reduction
- **Serialization Layer** - JSON, Binary, MessagePack support
- **Improved Type Safety** - Better TypeScript coverage

### Migration Time Estimate

- **Simple apps** (Kanban only): 30-60 minutes
- **Complex apps** (custom features): 2-4 hours
- **Heavy customization**: 1 day

---

## Breaking Changes

### 1. State Management (Jotai Removal)

**v0.6.0:**
```typescript
import { useAtom } from 'jotai'
import { dragStateAtom, selectionStateAtom } from '@asakaa/board/atoms'

const [dragState, setDragState] = useAtom(dragStateAtom)
const [selectionState, setSelectionState] = useAtom(selectionStateAtom)
```

**v0.7.0:**
```typescript
import { useDragState, useSelectionState } from '@asakaa/board'

const [dragState, setDragState] = useDragState()
const [selectionState, setSelectionState] = useSelectionState()
```

**Impact:** If you used Jotai atoms directly, you must switch to new hooks.

**Migration:**
1. Replace `useAtom(dragStateAtom)` with `useDragState()`
2. Replace `useAtom(selectionStateAtom)` with `useSelectionState()`
3. Remove Jotai imports

---

### 2. Board Initialization

**v0.6.0:**
```typescript
import { KanbanBoard } from '@asakaa/board'

function App() {
  return (
    <KanbanBoard
      board={myBoard}
      onCardMove={handleCardMove}
    />
  )
}
```

**v0.7.0 (Option 1: Direct Component - Recommended for simple apps):**
```typescript
import { KanbanBoard } from '@asakaa/board'

function App() {
  return (
    <KanbanBoard
      board={myBoard}
      callbacks={{
        onCardMove: handleCardMove,
      }}
    />
  )
}
```

**v0.7.0 (Option 2: AsakaaRuntime - Recommended for advanced apps):**
```typescript
import { AsakaaRuntime } from '@asakaa/core'
import { KanbanViewAdapter } from '@asakaa/board/views'
import { useEffect, useRef } from 'react'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const runtimeRef = useRef<AsakaaRuntime>()

  useEffect(() => {
    const runtime = new AsakaaRuntime({
      initialBoard: myBoard,
    })

    const kanbanView = new KanbanViewAdapter({
      callbacks: {
        onCardMove: handleCardMove,
      },
    })

    runtime.registerView(kanbanView)
    runtime.activateView('kanban', containerRef.current!)

    runtimeRef.current = runtime

    return () => {
      runtime.destroy()
    }
  }, [])

  return <div ref={containerRef} />
}
```

**Impact:** Component props structure changed slightly.

**Migration:**
- Wrap callbacks in `callbacks` object (Option 1)
- OR use AsakaaRuntime for full power (Option 2)

---

### 3. Card Model API

**v0.6.0:**
```typescript
// Card had some methods but no getDaysUntilDue
const card = new Card(data)
```

**v0.7.0:**
```typescript
// Card now has additional helper methods
const card = new Card(data)
const daysUntilDue = card.getDaysUntilDue() // New method
const isOverdue = card.isOverdue() // New method
```

**Impact:** Minimal - these are additions, not breaking changes.

**Migration:** No changes required, but you can use new methods.

---

### 4. Export/Import API

**v0.6.0:**
```typescript
// Custom export logic in each app
const json = JSON.stringify({ board, columns, cards })
```

**v0.7.0:**
```typescript
import { serializerRegistry } from '@asakaa/core'

// JSON export
const json = await serializerRegistry.serialize('json', {
  version: '0.7.0',
  timestamp: Date.now(),
  board,
  columns,
  cards,
})

// Binary export
const binary = await serializerRegistry.serialize('binary', {
  version: '0.7.0',
  timestamp: Date.now(),
  board,
  columns,
  cards,
})
```

**Impact:** If you implemented custom export/import, consider using new serialization layer.

**Migration:** Optional, but recommended for consistency.

---

## Step-by-Step Migration

### Step 1: Update Dependencies

```bash
cd your-project
npm install @asakaa/core@^0.7.0 @asakaa/board@^0.7.0
npm uninstall jotai  # If you only used Jotai for ASAKAA
```

Or with yarn:

```bash
yarn add @asakaa/core@^0.7.0 @asakaa/board@^0.7.0
yarn remove jotai
```

### Step 2: Update Imports

**Before:**
```typescript
import { KanbanBoard } from '@asakaa/board'
import { useAtom } from 'jotai'
import { dragStateAtom } from '@asakaa/board/atoms'
```

**After:**
```typescript
import { KanbanBoard, useDragState, useSelectionState } from '@asakaa/board'
```

### Step 3: Replace State Hooks

Find and replace all Jotai atom usage:

**Search for:**
```typescript
useAtom(dragStateAtom)
```

**Replace with:**
```typescript
useDragState()
```

**Search for:**
```typescript
useAtom(selectionStateAtom)
```

**Replace with:**
```typescript
useSelectionState()
```

### Step 4: Update Component Props

**Before:**
```typescript
<KanbanBoard
  board={board}
  onCardMove={handleCardMove}
  onCardClick={handleCardClick}
  onColumnAdd={handleColumnAdd}
/>
```

**After:**
```typescript
<KanbanBoard
  board={board}
  callbacks={{
    onCardMove: handleCardMove,
    onCardClick: handleCardClick,
    onColumnAdd: handleColumnAdd,
  }}
/>
```

### Step 5: Test Your Application

```bash
npm run dev
npm run build
npm test
```

Check for:
- TypeScript errors
- Runtime errors in console
- Drag-and-drop functionality
- Multi-select functionality
- Any custom features

---

## API Changes

### New Exports from @asakaa/core

```typescript
// Runtime
export { AsakaaRuntime } from './runtime'
export { PluginRegistry } from './runtime'
export type { Plugin, PluginContext, RuntimeConfig } from './runtime'

// Serialization
export { serializerRegistry } from './serialization'
export { JSONSerializer, BinarySerializer } from './serialization'
export type { Serializer, SerializedData, SerializationOptions } from './serialization'

// State Stores (for advanced usage)
export { dragStore, selectionStore } from './store'

// Views
export type { ViewAdapter, ViewBoardData } from './views'
```

### New Exports from @asakaa/board

```typescript
// Views
export { KanbanViewAdapter, createKanbanView } from './views'
export type { KanbanViewConfig } from './views'

// Hooks (replacements for Jotai)
export { useDragState } from './hooks/useDragState'
export { useSelectionState } from './hooks/useSelectionState'
export { useMultiSelect } from './hooks/useMultiSelect'
```

### Deprecated (Removed)

```typescript
// ❌ Removed in v0.7.0
import { dragStateAtom, selectionStateAtom } from '@asakaa/board/atoms'
```

---

## Code Examples

### Example 1: Basic Kanban Board

**v0.6.0:**
```typescript
import React from 'react'
import { KanbanBoard } from '@asakaa/board'
import { Board, Column, Card } from '@asakaa/core'

function App() {
  const [board, setBoard] = React.useState(() =>
    new Board({
      id: 'board-1',
      title: 'My Board',
      columnIds: ['col-1'],
    })
  )

  const handleCardMove = (cardId: string, targetColumnId: string, position: number) => {
    // Custom logic
  }

  return (
    <KanbanBoard
      board={board}
      onCardMove={handleCardMove}
    />
  )
}
```

**v0.7.0:**
```typescript
import React from 'react'
import { KanbanBoard } from '@asakaa/board'
import { Board, Column, Card } from '@asakaa/core'

function App() {
  const [board, setBoard] = React.useState(() =>
    new Board({
      id: 'board-1',
      title: 'My Board',
      columnIds: ['col-1'],
    })
  )

  const handleCardMove = (cardId: string, targetColumnId: string, position: number) => {
    // Custom logic
  }

  return (
    <KanbanBoard
      board={board}
      callbacks={{
        onCardMove: handleCardMove,
      }}
    />
  )
}
```

**Changes:**
- Wrap callbacks in `callbacks` prop

---

### Example 2: Using AsakaaRuntime (New in v0.7.0)

```typescript
import React, { useEffect, useRef, useState } from 'react'
import { AsakaaRuntime } from '@asakaa/core'
import { KanbanViewAdapter } from '@asakaa/board/views'
import { Board } from '@asakaa/core'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [runtime, setRuntime] = useState<AsakaaRuntime | null>(null)

  useEffect(() => {
    // Create runtime
    const rt = new AsakaaRuntime({
      initialBoard: new Board({
        id: 'board-1',
        title: 'My Board',
        columnIds: [],
      }),
      autoSave: {
        enabled: true,
        interval: 30000,
        onSave: async (data) => {
          await fetch('/api/boards/save', {
            method: 'POST',
            body: JSON.stringify(data),
          })
        },
      },
    })

    // Register Kanban view
    const kanbanView = new KanbanViewAdapter({
      callbacks: {
        onCardMove: (cardId, targetColumnId, position) => {
          console.log('Card moved:', cardId, targetColumnId, position)
        },
      },
    })

    rt.registerView(kanbanView)
    rt.activateView('kanban', containerRef.current!)

    setRuntime(rt)

    // Cleanup
    return () => {
      rt.destroy()
    }
  }, [])

  return (
    <div>
      <h1>My Kanban Board</h1>
      <div ref={containerRef} style={{ flex: 1 }} />
    </div>
  )
}
```

---

### Example 3: Custom Plugin (New in v0.7.0)

```typescript
import { Plugin, PluginContext } from '@asakaa/core'

class MyCustomPlugin implements Plugin {
  readonly metadata = {
    id: 'my-plugin',
    name: 'My Custom Plugin',
    version: '1.0.0',
    description: 'Does something cool',
    author: 'Your Name',
  }

  private context: PluginContext | null = null

  install(context: PluginContext): void {
    this.context = context

    context.on('card:created', (data) => {
      console.log('New card created:', data)
    })
  }

  uninstall(): void {
    this.context = null
  }
}

// Use plugin
runtime.installPlugin(new MyCustomPlugin())
runtime.enablePlugin('my-plugin')
```

---

### Example 4: Multi-Select with New Hook

**v0.6.0:**
```typescript
import { useAtom } from 'jotai'
import { selectionStateAtom } from '@asakaa/board/atoms'

function MyComponent({ cards }) {
  const [selectionState, setSelectionState] = useAtom(selectionStateAtom)

  const handleSelect = (cardId: string) => {
    setSelectionState({
      ...selectionState,
      selectedCardIds: [...selectionState.selectedCardIds, cardId],
    })
  }

  return (
    <div>
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => handleSelect(card.id)}
          className={selectionState.selectedCardIds.includes(card.id) ? 'selected' : ''}
        >
          {card.title}
        </div>
      ))}
    </div>
  )
}
```

**v0.7.0:**
```typescript
import { useSelectionState } from '@asakaa/board'

function MyComponent({ cards }) {
  const [selectionState, setSelectionState] = useSelectionState()

  const handleSelect = (cardId: string) => {
    setSelectionState({
      ...selectionState,
      selectedCardIds: [...selectionState.selectedCardIds, cardId],
    })
  }

  return (
    <div>
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => handleSelect(card.id)}
          className={selectionState.selectedCardIds.includes(card.id) ? 'selected' : ''}
        >
          {card.title}
        </div>
      ))}
    </div>
  )
}
```

**Changes:**
- Import hook from `@asakaa/board` instead of using Jotai

---

### Example 5: Serialization (New in v0.7.0)

```typescript
import { serializerRegistry } from '@asakaa/core'

async function exportBoard() {
  const board = runtime.getBoard()
  const columns = boardStore.getColumns()
  const cards = boardStore.getCards()

  // Export as JSON
  const json = await serializerRegistry.serialize('json', {
    version: '0.7.0',
    timestamp: Date.now(),
    board,
    columns,
    cards,
  }, {
    prettyPrint: true,
  })

  // Download JSON
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'board.json'
  a.click()
}

async function importBoard(file: File) {
  const text = await file.text()
  const data = await serializerRegistry.deserialize('json', text)

  // Load into runtime
  runtime.loadBoard(new Board(data.board))
  data.columns.forEach((col) => boardStore.addColumn(new Column(col)))
  data.cards.forEach((card) => boardStore.addCard(new Card(card)))
}
```

---

## Troubleshooting

### Issue: TypeScript Errors After Upgrade

**Error:**
```
Cannot find module '@asakaa/board/atoms'
```

**Solution:**
Replace Jotai atom imports with new hooks:
```typescript
// Before
import { dragStateAtom } from '@asakaa/board/atoms'
const [dragState, setDragState] = useAtom(dragStateAtom)

// After
import { useDragState } from '@asakaa/board'
const [dragState, setDragState] = useDragState()
```

---

### Issue: Drag-and-Drop Not Working

**Symptoms:**
- Cards don't drag
- No visual feedback

**Solution:**
Ensure you're using `useDragState()` hook in your drag handlers:

```typescript
import { useDragState } from '@asakaa/board'

function Card({ card }) {
  const [dragState, setDragState] = useDragState()

  const handleDragStart = () => {
    setDragState({
      isDragging: true,
      draggedCardId: card.id,
      sourceColumnId: card.columnId,
      targetColumnId: card.columnId,
    })
  }

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedCardId: null,
      sourceColumnId: null,
      targetColumnId: null,
    })
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {card.title}
    </div>
  )
}
```

---

### Issue: Bundle Size Increased

**Expected:** Bundle should be **smaller** (-14.25KB from removing Jotai)

**If bundle increased:**
1. Make sure Jotai is removed from `package.json`
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Clear build cache: `rm -rf dist .next .cache`
4. Rebuild: `npm run build`

---

### Issue: Runtime Errors in Production

**Error:**
```
Cannot read properties of null (reading 'mount')
```

**Solution:**
Ensure container element exists before activating view:

```typescript
useEffect(() => {
  if (!containerRef.current) return

  const runtime = new AsakaaRuntime({ /* ... */ })
  runtime.activateView('kanban', containerRef.current)

  return () => {
    runtime.destroy()
  }
}, [])
```

---

### Issue: Custom Styles Not Applied

**Symptoms:**
- Board looks broken
- Missing styles

**Solution:**
Import CSS in your app:

```typescript
import '@asakaa/board/dist/style.css'
```

---

## Benefits

After migrating to v0.7.0, you gain:

### 1. Smaller Bundle Size
- **-14.25KB** from removing Jotai
- 217KB → 202.75KB (6.6% reduction)

### 2. Better Type Safety
- Full TypeScript coverage
- Better IDE autocomplete
- Fewer runtime errors

### 3. Extensibility
- Add plugins without forking
- Create custom views
- Register custom serializers

### 4. Multi-View Support
- Switch between Kanban, Gantt, Table, etc.
- Same data, different visualizations

### 5. Zero External State Dependencies
- No Jotai, Redux, or MobX required
- Simpler dependency tree
- Easier to maintain

### 6. World-Class Architecture
- Framework-agnostic core
- Observable pattern
- Immutable data models
- Clean separation of concerns

---

## Migration Checklist

Use this checklist to ensure complete migration:

- [ ] Updated `@asakaa/core` to v0.7.0
- [ ] Updated `@asakaa/board` to v0.7.0
- [ ] Removed `jotai` dependency (if only used for ASAKAA)
- [ ] Replaced `useAtom(dragStateAtom)` with `useDragState()`
- [ ] Replaced `useAtom(selectionStateAtom)` with `useSelectionState()`
- [ ] Updated `<KanbanBoard>` props to use `callbacks` object
- [ ] Removed `@asakaa/board/atoms` imports
- [ ] Tested drag-and-drop functionality
- [ ] Tested multi-select functionality
- [ ] Tested custom features (if any)
- [ ] Ran TypeScript compiler (`tsc --noEmit`)
- [ ] Ran tests (`npm test`)
- [ ] Ran production build (`npm run build`)
- [ ] Verified bundle size decreased
- [ ] Updated documentation (if maintaining docs)

---

## Need Help?

If you encounter issues during migration:

1. **Check the docs:**
   - [ARCHITECTURE_v0.7.0.md](./ARCHITECTURE_v0.7.0.md) - Detailed architecture guide
   - [CHANGELOG_v0.7.0.md](./CHANGELOG_v0.7.0.md) - All changes
   - [TECHNICAL_ANALYSIS_v0.7.0_WORLD_CLASS.md](./TECHNICAL_ANALYSIS_v0.7.0_WORLD_CLASS.md) - Roadmap

2. **Check examples:**
   - `packages/board/examples/demo` - Working demo app

3. **Open an issue:**
   - GitHub: [github.com/asakaa/asakaa/issues](https://github.com/asakaa/asakaa/issues)

4. **Community:**
   - Discord: [discord.gg/asakaa](https://discord.gg/asakaa)

---

## What's Next?

After migrating to v0.7.0, explore new features:

1. **Create a Plugin**
   - See [ARCHITECTURE_v0.7.0.md#plugin-system](./ARCHITECTURE_v0.7.0.md#plugin-system)

2. **Add a Custom View**
   - See [ARCHITECTURE_v0.7.0.md#view-system](./ARCHITECTURE_v0.7.0.md#view-system)

3. **Use AsakaaRuntime**
   - Full control over board lifecycle
   - Auto-save functionality
   - Performance monitoring

4. **Prepare for v0.8.0**
   - Gantt view
   - Table view
   - Virtual scrolling
   - Real-time collaboration

---

**Congratulations!** You've successfully migrated to ASAKAA v0.7.0. Enjoy the improved architecture, smaller bundle size, and new extensibility features!
