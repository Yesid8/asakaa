# Pre-Gantt Improvements Plan
## "Lo Mejor de lo Mejor del Mundo" - v0.7.x

**Fecha**: 2025-10-19
**Objetivo**: Establecer la mejor arquitectura posible ANTES de implementar Gantt
**Versión**: Mantener 0.7.x (no subir a 0.8.0 todavía)

---

## 🎯 Mejoras Críticas Identificadas

### 1. ⭐⭐⭐⭐⭐ ViewAdapter Interface (CRÍTICO)
**Por qué**: Foundation para todas las vistas futuras (Gantt, Todo, Table)
**Impacto**: Game changer - permite switch entre vistas sin re-renders
**Esfuerzo**: 3-4 días
**Prioridad**: 🔥 MÁXIMA

### 2. ⭐⭐⭐⭐⭐ Core Runtime Refactor (CRÍTICO)
**Por qué**: Core debe ser el motor universal, no solo state management
**Impacto**: Permite plugins, lazy loading centralizado, serialization unificada
**Esfuerzo**: 2-3 días
**Prioridad**: 🔥 MÁXIMA

### 3. ⭐⭐⭐⭐ Remove Jotai Dependency (IMPORTANTE)
**Por qué**: Actualmente coexisten Jotai y BoardStore - confusión
**Impacto**: -15KB bundle, arquitectura más clara
**Esfuerzo**: 2-3 días
**Prioridad**: 🔥 ALTA

### 4. ⭐⭐⭐⭐ Plugin System (IMPORTANTE)
**Por qué**: Permite extensibilidad sin modificar core
**Impacto**: Ecosystem growth, community contributions
**Esfuerzo**: 2-3 días
**Prioridad**: 🔥 ALTA

### 5. ⭐⭐⭐⭐ Serialization Layer (IMPORTANTE)
**Por qué**: Export/Import está fragmentado en múltiples archivos
**Impacto**: Unified API, más formatos (MessagePack, Protocol Buffers)
**Esfuerzo**: 1-2 días
**Prioridad**: 🟡 MEDIA

### 6. ⭐⭐⭐ Enhanced Type Safety (BUENO)
**Por qué**: Algunas áreas usan `any`, otros tienen tipos loose
**Impacto**: Mejor DX, menos bugs en runtime
**Esfuerzo**: 1-2 días
**Prioridad**: 🟡 MEDIA

### 7. ⭐⭐⭐ Performance Monitoring (BUENO)
**Por qué**: No hay monitoring en producción
**Impacto**: Detectar performance regressions automáticamente
**Esfuerzo**: 1 día
**Prioridad**: 🟢 BAJA

### 8. ⭐⭐⭐ Error Boundary & Recovery (BUENO)
**Por qué**: Errores pueden romper toda la app
**Impacto**: Better UX, fault tolerance
**Esfuerzo**: 1 día
**Prioridad**: 🟢 BAJA

---

## 📋 Plan de Implementación

### Fase 1: Foundation (Semana 1)
**Días 1-4**: ViewAdapter Interface + Core Runtime

```
Día 1-2: ViewAdapter Interface
├── Crear @asakaa/core/src/views/
├── Definir ViewAdapter interface
├── Implementar ViewRegistry
├── Tests unitarios
└── Documentación

Día 3-4: Core Runtime Refactor
├── Crear AsakaaRuntime class
├── Integrar ViewRegistry
├── Plugin system básico
├── Lazy loading abstraction
└── Tests + Docs
```

### Fase 2: Migration (Semana 2)
**Días 5-7**: Remove Jotai + Refactor Board as View

```
Día 5-6: Remove Jotai
├── Migrar dragStateAtom → BoardStore
├── Migrar filterStateAtom → BoardStore
├── Migrar todos los atoms restantes
├── Remover dependency de jotai
└── Tests

Día 7: Refactor Board → KanbanView
├── Board component → KanbanView
├── Implementa ViewAdapter interface
├── Register en ViewRegistry
└── Tests
```

### Fase 3: Enhancement (Semana 3)
**Días 8-10**: Plugin System + Serialization

```
Día 8-9: Plugin System
├── Plugin interface
├── PluginRegistry
├── Lifecycle hooks
├── Example plugins
└── Tests + Docs

Día 10: Serialization Layer
├── Serializer interface
├── JSON, Binary, MessagePack serializers
├── Unified import/export API
└── Tests
```

### Fase 4: Polish (Días 11-12)
**Días 11-12**: Type Safety + Error Handling

```
Día 11: Enhanced Type Safety
├── Fix all `any` types
├── Strict null checks
├── Branded types para IDs
└── Type guards

Día 12: Error Handling
├── ErrorBoundary component
├── Error recovery strategies
├── User-friendly error messages
└── Tests
```

---

## 🏗️ Arquitectura Propuesta

### Before (Current)
```
@asakaa/board
├── components/Board (tightly coupled to React + Jotai)
├── state/atoms (Jotai atoms)
└── uses @asakaa/core (only for models)

@asakaa/core
├── models/
├── store/BoardStore
└── adapters/vanilla
```

### After (Improved)
```
@asakaa/core (Universal Runtime)
├── runtime/
│   ├── AsakaaRuntime.ts         # Main runtime
│   ├── ViewRegistry.ts          # View management
│   ├── PluginRegistry.ts        # Plugin system
│   └── SerializationManager.ts  # Import/Export
│
├── views/
│   ├── ViewAdapter.ts           # Interface
│   └── ViewLifecycle.ts         # Lifecycle hooks
│
├── models/                      # Unchanged
├── store/                       # Enhanced
└── plugins/
    ├── Plugin.ts                # Interface
    └── PluginContext.ts         # Plugin API

@asakaa/board (React Adapters + Views)
├── views/
│   └── KanbanView/              # Implements ViewAdapter
│       ├── KanbanView.tsx
│       ├── KanbanViewAdapter.ts
│       └── index.ts
│
├── adapters/react/              # React-specific
│   ├── BoardProvider.tsx
│   ├── useRuntime.ts           # Access to AsakaaRuntime
│   └── hooks/
│
└── components/                  # Pure React components
    └── (unchanged)
```

---

## 🎨 API Examples

### 1. ViewAdapter Usage

```typescript
// Define a view
import { ViewAdapter } from '@asakaa/core'

export class KanbanView implements ViewAdapter<BoardData> {
  readonly id = 'kanban'
  readonly name = 'Kanban Board'

  private container: HTMLElement | null = null
  private data: BoardData | null = null

  mount(container: HTMLElement, data: BoardData): void {
    this.container = container
    this.data = data
    this.render()
  }

  unmount(): void {
    if (this.container) {
      this.container.innerHTML = ''
    }
  }

  update(data: BoardData): void {
    this.data = data
    this.render()
  }

  private render(): void {
    // Render logic
  }
}

// Register and use
const runtime = new AsakaaRuntime()
runtime.registerView(new KanbanView())
runtime.registerView(new GanttView())

runtime.setView('kanban')
runtime.switchView('gantt') // Instant switch!
```

### 2. Plugin System

```typescript
// Define a plugin
export const autoSavePlugin: Plugin = {
  id: 'auto-save',
  name: 'Auto Save',
  version: '1.0.0',

  install(context: PluginContext) {
    context.onStateChange((state) => {
      localStorage.setItem('board', JSON.stringify(state))
    })
  },

  uninstall(context: PluginContext) {
    context.removeAllListeners()
  }
}

// Use plugin
runtime.installPlugin(autoSavePlugin)
```

### 3. Unified Serialization

```typescript
// Before (fragmented)
import { exportToJSON, exportToCSV, exportToPDF } from './utils/export'

const json = exportToJSON(board)
const csv = exportToCSV(board)
const pdf = await exportToPDF(board)

// After (unified)
import { runtime } from '@asakaa/core'

const json = await runtime.serialize('json')
const csv = await runtime.serialize('csv')
const pdf = await runtime.serialize('pdf')
const binary = await runtime.serialize('binary')
const msgpack = await runtime.serialize('msgpack')

// Import
await runtime.deserialize(data, 'json')
```

### 4. No More Jotai

```typescript
// Before (Jotai)
import { useAtom } from 'jotai'
import { dragStateAtom, filterStateAtom } from './state/atoms'

function MyComponent() {
  const [dragState, setDragState] = useAtom(dragStateAtom)
  const [filterState, setFilterState] = useAtom(filterStateAtom)
  // ...
}

// After (BoardStore)
import { useBoardCore } from '@asakaa/board'

function MyComponent() {
  const { dragState, setDragState, filterState, setFilterState } = useBoardCore()
  // Más simple, sin atoms externos
}
```

---

## 📊 Expected Benefits

### Bundle Size
```
Before:
├── Initial: 80KB
├── Jotai: 15KB
└── Total: 95KB

After:
├── Initial: 65KB (-15KB, no Jotai)
├── ViewAdapter overhead: +5KB
└── Total: 70KB (-26% improvement)
```

### Performance
```
View Switching:
├── Before: N/A (no support)
└── After: <50ms (instant)

Plugin Load:
├── Before: N/A
└── After: <10ms per plugin

Serialization:
├── Before: Multiple APIs, inconsistent
└── After: Unified, <100ms for 1000 cards
```

### Developer Experience
```
Before:
├── Learning curve: Medium (Jotai + BoardStore)
├── APIs: 3 different patterns
└── Extensibility: Limited

After:
├── Learning curve: Low (single Runtime API)
├── APIs: 1 unified pattern
└── Extensibility: High (plugins + views)
```

---

## ✅ Acceptance Criteria

### ViewAdapter
- [ ] Interface definida con TypeScript
- [ ] ViewRegistry implementado
- [ ] Mínimo 2 views (Kanban + Mock)
- [ ] View switching funcional
- [ ] Tests 100% passing
- [ ] Documentación completa

### Core Runtime
- [ ] AsakaaRuntime class implementada
- [ ] Integra ViewRegistry
- [ ] Integra PluginRegistry
- [ ] Serialization unificada
- [ ] Lazy loading abstraction
- [ ] Tests 100% passing

### Remove Jotai
- [ ] Todos los atoms migrados a BoardStore
- [ ] Dependency removida de package.json
- [ ] Tests actualizados
- [ ] Bundle size verificado (-15KB)
- [ ] No breaking changes (100% backward compatible)

### Plugin System
- [ ] Plugin interface definida
- [ ] PluginRegistry implementado
- [ ] Lifecycle hooks (install, uninstall, onStateChange)
- [ ] Mínimo 2 example plugins
- [ ] Tests + Docs

### Serialization
- [ ] Serializer interface
- [ ] JSON, Binary, MessagePack support
- [ ] Unified import/export API
- [ ] Performance benchmarks
- [ ] Tests + Docs

---

## 🚀 Post-Implementation

### What We'll Have
✅ **Best-in-class architecture** - ViewAdapter pattern like VSCode
✅ **Universal runtime** - Framework-agnostic core
✅ **Plugin ecosystem ready** - Extensible without core changes
✅ **Cleaner codebase** - No Jotai, single state management
✅ **Better DX** - Unified APIs, clear patterns
✅ **Smaller bundle** - -26% size reduction
✅ **Ready for Gantt** - Can implement as just another View

### Then We Can Start Gantt
```typescript
// Gantt será súper simple de agregar:
export class GanttView implements ViewAdapter<BoardData> {
  readonly id = 'gantt'
  readonly name = 'Gantt Chart'

  mount(container, data) {
    // Render gantt timeline
  }

  update(data) {
    // Update gantt
  }

  unmount() {
    // Cleanup
  }
}

// Y listo!
runtime.registerView(new GanttView())
runtime.switchView('gantt')
```

---

## 📅 Timeline

```
Semana 1: Foundation
  ├── Días 1-2: ViewAdapter Interface
  ├── Días 3-4: Core Runtime Refactor
  └── Review & Ajustes

Semana 2: Migration
  ├── Días 5-6: Remove Jotai
  ├── Día 7: Refactor Board → KanbanView
  └── Review & Tests

Semana 3: Enhancement
  ├── Días 8-9: Plugin System
  ├── Día 10: Serialization Layer
  ├── Días 11-12: Polish (Types + Errors)
  └── Final Review

Total: 12 días laborables (~2.5 semanas)
```

---

## 🎯 Success Metrics

- [ ] Bundle size: ≤70KB (from 95KB)
- [ ] View switching: <50ms
- [ ] Tests: 100% passing (350+ tests)
- [ ] Type coverage: 100% (no `any`)
- [ ] Benchmarks: All passing
- [ ] Docs: 100% coverage
- [ ] Breaking changes: 0 (backward compatible)

---

**Status**: ✅ READY TO START
**Next Step**: Implementar ViewAdapter Interface (Día 1-2)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
