# ASAKAA v0.7.0 Architecture Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Core Components](#core-components)
4. [Package Structure](#package-structure)
5. [Data Flow](#data-flow)
6. [Plugin System](#plugin-system)
7. [View System](#view-system)
8. [State Management](#state-management)
9. [Serialization](#serialization)
10. [Performance](#performance)
11. [Extension Points](#extension-points)
12. [Best Practices](#best-practices)

---

## Overview

ASAKAA v0.7.0 introduces a world-class, framework-agnostic architecture designed for maximum flexibility, extensibility, and performance. The system is built on three fundamental pillars:

1. **Universal Runtime** - AsakaaRuntime orchestrates all components
2. **View Adapters** - Multi-view support (Kanban, Gantt, Table, etc.)
3. **Plugin System** - Extensibility without core modifications

### Key Characteristics

- **Framework-agnostic core** - Zero UI dependencies in `@asakaa/core`
- **Immutable data models** - All models use `Object.freeze()`
- **Observable state** - Pub/sub pattern for reactivity
- **Plugin architecture** - Extend functionality without forking
- **Multi-format serialization** - JSON, Binary, MessagePack support
- **Type-safe** - Full TypeScript coverage
- **Zero external state libraries** - No Jotai, Redux, or MobX

---

## Architecture Principles

### 1. Separation of Concerns

```
┌─────────────────────────────────────────────────────────────┐
│                      @asakaa/board                          │
│                 (UI Components + Views)                     │
│  - React components                                         │
│  - ViewAdapters (Kanban, Gantt, Table)                      │
│  - Hooks (useDragState, useSelectionState)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ depends on
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       @asakaa/core                          │
│                (Framework-agnostic logic)                   │
│  - Data models (Board, Column, Card)                        │
│  - AsakaaRuntime                                            │
│  - Plugin system                                            │
│  - Serialization                                            │
│  - State stores (DragStore, SelectionStore)                 │
└─────────────────────────────────────────────────────────────┘
```

### 2. Immutability

All data models are immutable using `Object.freeze()`:

```typescript
// models/Card.ts
export class Card {
  constructor(data: CardData) {
    Object.assign(this, data)
    Object.freeze(this)
  }

  // Updates return new instances
  update(changes: Partial<CardData>): Card {
    return new Card({ ...this.toJSON(), ...changes })
  }
}
```

**Benefits:**
- Predictable state changes
- Time-travel debugging support
- Easy undo/redo implementation
- Thread-safe (for Web Workers)

### 3. Observable Pattern

State changes use the Observer pattern instead of external libraries:

```typescript
// store/DragStore.ts
export class DragStore {
  private state: DragState = { /* ... */ }
  private listeners = new Set<(state: DragState) => void>()

  subscribe(callback: (state: DragState) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state))
  }
}
```

**Benefits:**
- Zero dependencies (removed Jotai = -14.25KB)
- Full control over notification timing
- Easy to debug and trace
- Works in any framework (React, Vue, Svelte)

---

## Core Components

### 1. AsakaaRuntime

**Universal orchestrator** that integrates all components.

**Responsibilities:**
- Manage board state
- Coordinate views
- Manage plugins
- Handle events
- Track performance
- Auto-save functionality

**Usage:**

```typescript
import { AsakaaRuntime } from '@asakaa/core'

const runtime = new AsakaaRuntime({
  initialBoard: myBoard,
  autoSave: {
    enabled: true,
    interval: 30000, // 30 seconds
    onSave: async (data) => {
      await saveToBackend(data)
    },
  },
})

// Load a board
runtime.loadBoard(board)

// Listen to events
runtime.on('board:updated', (data) => {
  console.log('Board updated:', data.board)
})

// Register and activate a view
runtime.registerView(kanbanView)
runtime.activateView('kanban', containerElement)

// Install plugins
runtime.installPlugin(autoSavePlugin)
runtime.enablePlugin('autosave')
```

**API Reference:**

```typescript
class AsakaaRuntime {
  // Board operations
  loadBoard(board: Board | null): void
  getBoard(): Board | null
  updateBoard(changes: Partial<BoardData>): void

  // View management
  registerView(view: ViewAdapter): void
  unregisterView(viewId: string): void
  activateView(viewId: string, container: HTMLElement): void
  deactivateView(): void
  getActiveView(): ViewAdapter | null

  // Plugin management
  installPlugin(plugin: Plugin): void
  uninstallPlugin(pluginId: string): void
  enablePlugin(pluginId: string): void
  disablePlugin(pluginId: string): void
  getInstalledPlugins(): Plugin[]

  // Serialization
  serialize(format?: SerializationFormat): Promise<string | Uint8Array>
  deserialize(data: string | Uint8Array, format?: SerializationFormat): Promise<void>

  // Events
  on<K extends RuntimeEvent>(event: K, callback: RuntimeEventCallback<K>): void
  off<K extends RuntimeEvent>(event: K, callback: RuntimeEventCallback<K>): void
  emit<K extends RuntimeEvent>(event: K, data: RuntimeEventData[K]): void

  // Lifecycle
  destroy(): void
}
```

### 2. Data Models

#### Board

Represents a project/workspace.

```typescript
interface BoardData {
  id: string
  title: string
  description?: string
  columnIds: string[]
  settings?: Record<string, any>
  createdAt?: Date | string
  updatedAt?: Date | string
}

class Board {
  readonly id: string
  readonly title: string
  // ... other fields

  update(changes: Partial<BoardData>): Board
  toJSON(): BoardData
}
```

#### Column

Represents a workflow stage (e.g., "To Do", "In Progress").

```typescript
interface ColumnData {
  id: string
  title: string
  boardId: string
  cardIds: string[]
  position: number
  color?: string
  wip?: number // Work-in-progress limit
}

class Column {
  readonly id: string
  readonly title: string
  // ... other fields

  addCard(cardId: string): Column
  removeCard(cardId: string): Column
  reorderCards(cardIds: string[]): Column
  update(changes: Partial<ColumnData>): Column
  toJSON(): ColumnData
}
```

#### Card

Represents a task/item.

```typescript
interface CardData {
  id: string
  title: string
  columnId: string
  position: number
  description?: string
  labels?: string[]
  assigneeId?: string
  assignedUserIds?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  startDate?: Date | string
  endDate?: Date | string
  estimatedHours?: number
  actualHours?: number
  status?: string
  attachments?: Array<{ id: string; name: string; url: string }>
  comments?: Array<{ id: string; text: string; userId: string; createdAt: Date | string }>
}

class Card {
  readonly id: string
  readonly title: string
  // ... other fields

  update(changes: Partial<CardData>): Card
  getDaysUntilDue(): number | undefined
  isOverdue(): boolean
  toJSON(): CardData
}
```

### 3. BoardStore

Manages board, columns, and cards with referential integrity.

```typescript
class BoardStore {
  // Board operations
  loadBoard(board: Board): void
  getBoard(): Board | null
  updateBoard(changes: Partial<BoardData>): void

  // Column operations
  addColumn(column: Column): void
  updateColumn(columnId: string, changes: Partial<ColumnData>): void
  deleteColumn(columnId: string): void
  reorderColumns(columnIds: string[]): void
  getColumn(columnId: string): Column | undefined
  getColumns(): Column[]

  // Card operations
  addCard(card: Card): void
  updateCard(cardId: string, changes: Partial<CardData>): void
  deleteCard(cardId: string): void
  moveCard(cardId: string, targetColumnId: string, position: number): void
  getCard(cardId: string): Card | undefined
  getCards(columnId?: string): Card[]
  getCardsInColumn(columnId: string): Card[]

  // Search and filter
  searchCards(query: string): Card[]
  filterCards(predicate: (card: Card) => boolean): Card[]

  // Batch operations
  batchUpdate(operations: BatchOperation[]): void

  // Events
  subscribe(listener: (event: StoreEvent) => void): () => void

  // Serialization
  serialize(): SerializedData
  deserialize(data: SerializedData): void
}
```

---

## Package Structure

```
asakaa/
├── packages/
│   ├── core/                    # @asakaa/core - Framework-agnostic
│   │   ├── src/
│   │   │   ├── models/          # Data models (Board, Column, Card)
│   │   │   │   ├── Board.ts
│   │   │   │   ├── Column.ts
│   │   │   │   ├── Card.ts
│   │   │   │   └── __tests__/
│   │   │   ├── store/           # State management
│   │   │   │   ├── BoardStore.ts
│   │   │   │   ├── DragStore.ts
│   │   │   │   ├── SelectionStore.ts
│   │   │   │   └── __tests__/
│   │   │   ├── runtime/         # AsakaaRuntime & Plugin system
│   │   │   │   ├── AsakaaRuntime.ts
│   │   │   │   ├── Plugin.ts
│   │   │   │   ├── ViewRegistry.ts
│   │   │   │   ├── PluginRegistry.ts
│   │   │   │   └── __tests__/
│   │   │   ├── serialization/   # Serialization layer
│   │   │   │   ├── Serializer.ts
│   │   │   │   ├── JSONSerializer.ts
│   │   │   │   ├── BinarySerializer.ts
│   │   │   │   ├── SerializerRegistry.ts
│   │   │   │   └── __tests__/
│   │   │   ├── views/           # ViewAdapter interface
│   │   │   │   ├── ViewAdapter.ts
│   │   │   │   └── BaseViewAdapter.ts
│   │   │   ├── types/           # TypeScript types
│   │   │   │   └── index.ts
│   │   │   └── index.ts         # Public API
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── board/                   # @asakaa/board - React UI
│       ├── src/
│       │   ├── components/      # React components
│       │   │   ├── Board/
│       │   │   ├── Column/
│       │   │   ├── Card/
│       │   │   ├── CardDetailModal/
│       │   │   ├── FilterBar/
│       │   │   ├── ConfigMenu/
│       │   │   ├── Theme/
│       │   │   └── __tests__/
│       │   ├── views/           # ViewAdapter implementations
│       │   │   ├── KanbanViewAdapter.tsx
│       │   │   └── index.ts
│       │   ├── hooks/           # React hooks
│       │   │   ├── useDragState.ts
│       │   │   ├── useSelectionState.ts
│       │   │   ├── useMultiSelect.ts
│       │   │   ├── useAI.ts
│       │   │   └── __tests__/
│       │   ├── lib/             # Utilities
│       │   │   ├── ai/
│       │   │   ├── export/
│       │   │   └── utils/
│       │   ├── styles/          # Global styles
│       │   └── index.ts         # Public API
│       ├── examples/
│       │   └── demo/            # Demo application
│       ├── package.json
│       └── tsconfig.json
│
├── LICENSE                      # BSL 1.1
├── CHANGELOG_v0.7.0.md
├── ARCHITECTURE_v0.7.0.md       # This file
├── MIGRATION_v0.7.0.md          # Migration guide
└── TECHNICAL_ANALYSIS_v0.7.0_WORLD_CLASS.md
```

---

## Data Flow

### 1. User Interaction Flow

```
User Action (e.g., drag card)
    ↓
React Component Handler (onDragStart)
    ↓
DragStore.startDrag(cardId, sourceColumnId)
    ↓
DragStore notifies subscribers
    ↓
useDragState() hook receives update
    ↓
React re-renders with new state
    ↓
BoardStore.moveCard(cardId, targetColumnId, position)
    ↓
BoardStore emits 'card:moved' event
    ↓
AsakaaRuntime propagates to plugins
    ↓
Plugins react (e.g., auto-save, analytics)
    ↓
Active ViewAdapter updates display
```

### 2. Plugin Event Flow

```
BoardStore operation (e.g., updateCard)
    ↓
BoardStore emits event ('card:updated')
    ↓
AsakaaRuntime receives event
    ↓
AsakaaRuntime.emit('card:updated', data)
    ↓
PluginRegistry forwards to enabled plugins
    ↓
Each plugin's PluginContext triggers callbacks
    ↓
Plugin performs action (e.g., sync to backend)
```

### 3. View Switching Flow

```
runtime.activateView('gantt', container)
    ↓
ViewRegistry.deactivate() current view
    ↓
Current view's unmount() called
    ↓
View cleanup (React unmount, remove listeners)
    ↓
ViewRegistry.activate('gantt', container)
    ↓
GanttViewAdapter.mount(container, boardData)
    ↓
View renders (ReactDOM.createRoot + render)
    ↓
View subscribes to BoardStore changes
```

---

## Plugin System

### Plugin Interface

```typescript
interface PluginMetadata {
  id: string
  name: string
  version: string
  description: string
  author: string
  dependencies?: string[]
}

interface Plugin {
  metadata: PluginMetadata
  install(context: PluginContext): void
  uninstall(): void
  onEnable?(): void
  onDisable?(): void
}
```

### PluginContext

Plugins receive an isolated context with controlled access:

```typescript
interface PluginContext {
  // Read access
  getBoard(): Board | null
  getColumns(): Column[]
  getCards(): Card[]
  getCard(cardId: string): Card | undefined

  // No direct write access - plugins must emit events
  // This maintains single source of truth in BoardStore

  // Event subscription
  on<K extends string>(event: K, callback: (data: any) => void): void
  off<K extends string>(event: K, callback: (data: any) => void): void

  // Emit custom events
  emit(event: string, data: any): void

  // Get runtime instance (limited API)
  getRuntime(): AsakaaRuntimePublicAPI
}
```

### Creating a Plugin

**Example: Auto-Save Plugin**

```typescript
import { Plugin, PluginContext } from '@asakaa/core'

export class AutoSavePlugin implements Plugin {
  readonly metadata = {
    id: 'autosave',
    name: 'Auto Save',
    version: '1.0.0',
    description: 'Automatically saves board changes',
    author: 'Asakaa Team',
  }

  private context: PluginContext | null = null
  private intervalId: NodeJS.Timeout | null = null
  private isDirty = false

  install(context: PluginContext): void {
    this.context = context

    // Listen for any changes
    context.on('board:updated', () => {
      this.isDirty = true
    })
    context.on('card:created', () => {
      this.isDirty = true
    })
    context.on('card:updated', () => {
      this.isDirty = true
    })
    context.on('card:deleted', () => {
      this.isDirty = true
    })
  }

  onEnable(): void {
    // Start auto-save interval
    this.intervalId = setInterval(() => {
      if (this.isDirty) {
        this.save()
      }
    }, 30000) // Every 30 seconds
  }

  onDisable(): void {
    // Stop auto-save interval
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  uninstall(): void {
    this.onDisable()
    this.context = null
    this.isDirty = false
  }

  private async save(): Promise<void> {
    if (!this.context) return

    const board = this.context.getBoard()
    const columns = this.context.getColumns()
    const cards = this.context.getCards()

    try {
      await fetch('/api/boards/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board, columns, cards }),
      })

      this.isDirty = false
      this.context.emit('autosave:success', { timestamp: Date.now() })
    } catch (error) {
      this.context.emit('autosave:error', { error })
    }
  }
}
```

**Example: Analytics Plugin**

```typescript
export class AnalyticsPlugin implements Plugin {
  readonly metadata = {
    id: 'analytics',
    name: 'Analytics',
    version: '1.0.0',
    description: 'Track user interactions and board metrics',
    author: 'Asakaa Team',
  }

  private context: PluginContext | null = null
  private events: Array<{ type: string; timestamp: number; data: any }> = []

  install(context: PluginContext): void {
    this.context = context

    // Track all card operations
    context.on('card:created', (data) => {
      this.track('card:created', data)
    })
    context.on('card:updated', (data) => {
      this.track('card:updated', data)
    })
    context.on('card:moved', (data) => {
      this.track('card:moved', data)
    })
    context.on('card:deleted', (data) => {
      this.track('card:deleted', data)
    })
  }

  uninstall(): void {
    this.context = null
    this.events = []
  }

  private track(type: string, data: any): void {
    this.events.push({
      type,
      timestamp: Date.now(),
      data,
    })

    // Send to analytics backend
    this.sendToBackend({ type, data })
  }

  private async sendToBackend(event: { type: string; data: any }): Promise<void> {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }
  }

  // Public API for querying analytics
  getEvents(): Array<{ type: string; timestamp: number; data: any }> {
    return [...this.events]
  }

  getEventsByType(type: string): Array<{ timestamp: number; data: any }> {
    return this.events
      .filter((event) => event.type === type)
      .map(({ timestamp, data }) => ({ timestamp, data }))
  }
}
```

---

## View System

### ViewAdapter Interface

```typescript
interface ViewAdapter<TData = ViewBoardData> {
  // Metadata
  readonly id: string
  readonly name: string
  readonly version: string
  readonly description: string
  readonly icon: string
  readonly supportedExports: readonly ExportFormat[]

  // Lifecycle
  mount(container: HTMLElement, data: TData): void
  unmount(): void
  update(data: Partial<TData>): void
  destroy(): void

  // Export
  exportData(format: ExportFormat): Promise<string | Blob>

  // Events
  on(event: string, callback: (data: any) => void): void
  off(event: string, callback: (data: any) => void): void
}
```

### Creating a ViewAdapter

**Example: Kanban View**

```typescript
import { ViewAdapter, ViewBoardData } from '@asakaa/core'
import { createRoot, Root } from 'react-dom/client'
import { KanbanBoard } from '../components/Board/KanbanBoard'

export class KanbanViewAdapter implements ViewAdapter<ViewBoardData> {
  readonly id = 'kanban'
  readonly name = 'Kanban Board'
  readonly version = '1.0.0'
  readonly description = 'Interactive Kanban board view'
  readonly icon = '📋'
  readonly supportedExports = ['json', 'csv', 'pdf', 'png'] as const

  private root: Root | null = null
  private container: HTMLElement | null = null
  private data: ViewBoardData | null = null

  mount(container: HTMLElement, data: ViewBoardData): void {
    this.container = container
    this.data = data
    this.root = createRoot(container)
    this.render()
  }

  unmount(): void {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
    this.container = null
    this.data = null
  }

  update(newData: Partial<ViewBoardData>): void {
    if (this.data) {
      this.data = { ...this.data, ...newData }
      this.render()
    }
  }

  destroy(): void {
    this.unmount()
  }

  private render(): void {
    if (!this.root || !this.data) return

    this.root.render(
      <KanbanBoard
        board={this.data.board}
        columns={this.data.columns}
        cards={this.data.cards}
        onCardMove={(cardId, targetColumnId, position) => {
          // Emit event back to runtime
          this.emit('card:moved', { cardId, targetColumnId, position })
        }}
      />
    )
  }

  async exportData(format: ExportFormat): Promise<string | Blob> {
    switch (format) {
      case 'json':
        return JSON.stringify(this.data, null, 2)
      case 'csv':
        return this.exportToCSV()
      case 'pdf':
        return await this.exportToPDF()
      case 'png':
        return await this.exportToPNG()
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  private exportToCSV(): string {
    // CSV export implementation
    // ...
  }

  private async exportToPDF(): Promise<Blob> {
    // PDF export implementation using jsPDF or similar
    // ...
  }

  private async exportToPNG(): Promise<Blob> {
    // PNG export using html2canvas or similar
    // ...
  }

  on(event: string, callback: (data: any) => void): void {
    // Event implementation
  }

  off(event: string, callback: (data: any) => void): void {
    // Event implementation
  }

  private emit(event: string, data: any): void {
    // Emit to listeners
  }
}
```

---

## State Management

### DragStore

Manages drag-and-drop state without external dependencies.

```typescript
interface DragState {
  isDragging: boolean
  draggedCardId: string | null
  sourceColumnId: string | null
  targetColumnId: string | null
}

class DragStore {
  private state: DragState
  private listeners: Set<(state: DragState) => void>

  startDrag(cardId: string, sourceColumnId: string): void
  updateTarget(targetColumnId: string): void
  endDrag(): void
  cancelDrag(): void

  getState(): DragState
  setState(newState: DragState): void
  subscribe(callback: (state: DragState) => void): () => void
}
```

**React Hook:**

```typescript
export function useDragState(): [DragState, (state: DragState) => void] {
  const [state, setState] = useState<DragState>(() => dragStore.getState())

  useEffect(() => {
    const unsubscribe = dragStore.subscribe((newState) => {
      setState(newState)
    })
    return unsubscribe
  }, [])

  const setDragState = useCallback((newState: DragState) => {
    dragStore.setState(newState)
  }, [])

  return [state, setDragState]
}
```

### SelectionStore

Manages card selection state for multi-select operations.

```typescript
interface SelectionState {
  selectedCardIds: string[]
  lastSelectedCardId: string | null
}

class SelectionStore {
  select(cardId: string): void
  add(cardId: string): void
  remove(cardId: string): void
  toggle(cardId: string): void
  selectMultiple(cardIds: string[]): void
  clear(): void
  isSelected(cardId: string): boolean
  getSelectedCards(): string[]
  subscribe(callback: (state: SelectionState) => void): () => void
}
```

---

## Serialization

### Serialization Architecture

```
┌─────────────────────────────────────┐
│      SerializerRegistry             │
│  (Unified API for all formats)      │
└──────────────┬──────────────────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
     ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│  JSON   │ │ Binary  │ │MsgPack  │
│Serializ.│ │Serializ.│ │Serializ.│
└─────────┘ └─────────┘ └─────────┘
```

### Usage

```typescript
import { serializerRegistry } from '@asakaa/core'

// Serialize to JSON
const json = await serializerRegistry.serialize('json', {
  version: '0.7.0',
  timestamp: Date.now(),
  board,
  columns,
  cards,
})

// Deserialize from JSON
const data = await serializerRegistry.deserialize('json', json)

// Serialize to binary
const binary = await serializerRegistry.serialize('binary', {
  version: '0.7.0',
  timestamp: Date.now(),
  board,
  columns,
  cards,
})

// Custom serializer
serializerRegistry.register('xml', new XMLSerializer())
```

### Custom Serializer

```typescript
import { BaseSerializer, SerializedData } from '@asakaa/core'

class XMLSerializer extends BaseSerializer<string> {
  async serialize(data: SerializedData): Promise<string> {
    // Convert to XML
    return `<?xml version="1.0"?>
      <board>
        <version>${data.version}</version>
        <!-- ... -->
      </board>`
  }

  async deserialize(input: string): Promise<SerializedData> {
    // Parse XML
    const parser = new DOMParser()
    const doc = parser.parseFromString(input, 'text/xml')
    // Extract data...
    return data
  }

  getMimeType(): string {
    return 'application/xml'
  }

  getFileExtension(): string {
    return '.xml'
  }
}
```

---

## Performance

### Key Optimizations

1. **Immutable Data + React.memo**
   ```typescript
   export const Card = React.memo(({ card, onUpdate }) => {
     // Only re-renders if card reference changes
   }, arePropsEqual)
   ```

2. **Virtual Scrolling** (Planned for v0.8.0)
   - Will support 10,000+ cards
   - Using `@tanstack/react-virtual`

3. **Bundle Size**
   - v0.6.0: 217 KB
   - v0.7.0: 202.75 KB (-14.25 KB from removing Jotai)

4. **Lazy Loading**
   ```typescript
   const GanttView = lazy(() => import('./views/GanttViewAdapter'))
   ```

5. **Web Workers** (Planned)
   - Serialization in background thread
   - Heavy computations offloaded

### Performance Monitoring

```typescript
runtime.on('performance:mark', ({ operation, duration }) => {
  console.log(`${operation} took ${duration}ms`)
})
```

---

## Extension Points

### 1. Custom Data Models

Extend Card with custom fields:

```typescript
interface CustomCardData extends CardData {
  epicId?: string
  storyPoints?: number
  sprint?: string
}

class CustomCard extends Card {
  readonly epicId?: string
  readonly storyPoints?: number
  readonly sprint?: string

  constructor(data: CustomCardData) {
    super(data)
    this.epicId = data.epicId
    this.storyPoints = data.storyPoints
    this.sprint = data.sprint
    Object.freeze(this)
  }
}
```

### 2. Custom Views

Create a Timeline view:

```typescript
class TimelineViewAdapter implements ViewAdapter<ViewBoardData> {
  readonly id = 'timeline'
  readonly name = 'Timeline'
  // ... implement interface
}

runtime.registerView(new TimelineViewAdapter())
```

### 3. Custom Serializers

Add YAML support:

```typescript
class YAMLSerializer extends BaseSerializer<string> {
  async serialize(data: SerializedData): Promise<string> {
    return yaml.dump(data)
  }
  // ...
}

serializerRegistry.register('yaml', new YAMLSerializer())
```

### 4. Middleware

Intercept operations:

```typescript
const loggingMiddleware = {
  beforeCardUpdate: (cardId, changes) => {
    console.log('Updating card:', cardId, changes)
  },
  afterCardUpdate: (card) => {
    console.log('Card updated:', card)
  },
}

// Apply middleware (custom implementation)
boardStore.use(loggingMiddleware)
```

---

## Best Practices

### 1. State Updates

**✅ DO:**
```typescript
const updatedCard = card.update({ title: 'New title' })
boardStore.updateCard(updatedCard.id, { title: 'New title' })
```

**❌ DON'T:**
```typescript
card.title = 'New title' // Error: card is frozen
```

### 2. Event Handling

**✅ DO:**
```typescript
runtime.on('card:updated', (data) => {
  // React to changes
})
```

**❌ DON'T:**
```typescript
// Poll for changes
setInterval(() => {
  const card = boardStore.getCard(cardId)
  // Check if changed...
}, 1000)
```

### 3. Plugin Design

**✅ DO:**
- Keep plugins focused on one responsibility
- Use PluginContext for all data access
- Emit custom events for plugin-specific data
- Clean up resources in `uninstall()`

**❌ DON'T:**
- Access BoardStore directly
- Mutate data received from context
- Leave intervals/listeners active after uninstall

### 4. View Adapters

**✅ DO:**
- Clean up in `unmount()` (remove listeners, clear DOM)
- Use `update()` for incremental changes
- Emit events back to runtime
- Support all declared export formats

**❌ DON'T:**
- Keep references after unmount
- Directly modify BoardStore
- Assume container will always exist

### 5. Type Safety

**✅ DO:**
```typescript
const card: Card = boardStore.getCard(cardId)!
if (card.isOverdue()) {
  // TypeScript knows card exists
}
```

**❌ DON'T:**
```typescript
const card: any = boardStore.getCard(cardId)
card.someRandomProperty // No type checking
```

---

## Summary

ASAKAA v0.7.0 provides a world-class, extensible architecture:

- **Universal Runtime** - Single orchestrator for all components
- **Framework-Agnostic Core** - Use with React, Vue, Svelte, or vanilla JS
- **Plugin System** - Extend without forking
- **View Adapters** - Support Kanban, Gantt, Table, and custom views
- **Zero-Dependency State** - Observable pattern, no external libraries
- **Type-Safe** - Full TypeScript coverage
- **Immutable Models** - Predictable state changes
- **Multi-Format Serialization** - JSON, Binary, MessagePack

This architecture enables:
- Easy integration into any application
- Custom views and plugins
- Enterprise-grade extensibility
- World-class developer experience

---

**Next Steps:**
- Read [MIGRATION_v0.7.0.md](./MIGRATION_v0.7.0.md) to upgrade
- See [CHANGELOG_v0.7.0.md](./CHANGELOG_v0.7.0.md) for all changes
- Review [TECHNICAL_ANALYSIS_v0.7.0_WORLD_CLASS.md](./TECHNICAL_ANALYSIS_v0.7.0_WORLD_CLASS.md) for roadmap
