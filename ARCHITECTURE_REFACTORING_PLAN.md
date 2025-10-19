# ASAKAA - Plan de Refactorización Arquitectónica

**Versión**: 0.7.0 (Post-refactoring)
**Fecha**: 2025-10-19
**Objetivo**: Arquitectura modular, escalable y multi-framework

---

## 📊 Análisis de Arquitectura Actual

### Estructura Actual (`v0.6.0`)
```
packages/board/src/
├── components/        # 30+ componentes React (UI acoplado)
├── state/            # Jotai atoms (estado acoplado a React)
├── types/            # TypeScript types (bien organizado)
├── hooks/            # React hooks personalizados
├── theme/            # Sistema de temas
├── utils/            # Utilidades generales
├── lib/ai/           # Integración AI
├── plugins/          # Plugins (sin estructura clara)
├── styles/           # Estilos globales
└── index.ts          # Export principal
```

### Problemas Identificados

1. **Acoplamiento fuerte con React**
   - Componentes mezclados con lógica de negocio
   - No hay separación entre core logic y UI
   - Imposible usar en Vue, Svelte, o Vanilla JS

2. **Estado global con Jotai**
   - Acoplado a React
   - No hay capa de abstracción
   - Difícil de testear

3. **Falta de modularización clara**
   - Componentes grandes (>500 líneas)
   - Responsabilidades mezcladas
   - Difícil de mantener

4. **Sin arquitectura multi-view**
   - Solo existe Kanban Board
   - No está preparado para Gantt, List, Calendar, etc.

5. **Dependencias pesadas innecesarias**
   - framer-motion (11.11.0) - 🔴 +100KB
   - recharts (3.2.1) - 🔴 +400KB
   - jotai (2.10.0) - podría ser opcional

---

## 🎯 Nueva Arquitectura Propuesta (v0.7.0)

### Principios SOLID

- **S**ingle Responsibility: Cada módulo/clase una responsabilidad
- **O**pen/Closed: Abierto a extensión, cerrado a modificación
- **L**iskov Substitution: Interfaces bien definidas
- **I**nterface Segregation: APIs específicas y pequeñas
- **D**ependency Inversion: Depender de abstracciones

### Estructura Modular

```
packages/
├── core/                      # ⭐ NUEVO - Lógica de negocio pura (0 deps UI)
│   ├── src/
│   │   ├── models/           # Modelos de dominio (Card, Column, Board)
│   │   ├── services/         # Servicios de negocio (BoardService, CardService)
│   │   ├── store/            # Store agnóstico (EventEmitter pattern)
│   │   ├── algorithms/       # Algoritmos optimizados (drag-drop, search, filter)
│   │   ├── utils/            # Utilidades puras
│   │   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── package.json          # @asakaa/core - 0 dependencies
│   └── README.md
│
├── board/                     # Board implementation (Kanban)
│   ├── src/
│   │   ├── adapters/         # ⭐ NUEVO - Framework adapters
│   │   │   ├── react/        # React adapter
│   │   │   ├── vue/          # Vue adapter (futuro)
│   │   │   └── vanilla/      # Vanilla JS adapter
│   │   ├── components/       # UI Components (React)
│   │   ├── hooks/            # React hooks (wrapper de core)
│   │   ├── theme/            # Theming system
│   │   └── index.ts
│   ├── package.json          # @asakaa/board
│   └── README.md
│
├── gantt/                     # ⭐ FUTURO - Gantt view
│   └── (Reutiliza @asakaa/core)
│
├── list/                      # ⭐ FUTURO - List view
│   └── (Reutiliza @asakaa/core)
│
└── calendar/                  # ⭐ FUTURO - Calendar view
    └── (Reutiliza @asakaa/core)
```

---

## 📦 @asakaa/core - Especificación

### Arquitectura Core

```
@asakaa/core/src/
├── models/
│   ├── Card.ts               # Modelo de Card (immutable)
│   ├── Column.ts             # Modelo de Column
│   ├── Board.ts              # Modelo de Board
│   ├── User.ts               # Modelo de User
│   └── index.ts
│
├── services/
│   ├── BoardService.ts       # CRUD de boards
│   ├── CardService.ts        # CRUD de cards
│   ├── FilterService.ts      # Filtrado avanzado
│   ├── SearchService.ts      # Búsqueda optimizada
│   ├── SortService.ts        # Ordenamiento
│   └── index.ts
│
├── store/
│   ├── Store.ts              # Event-based store (pub/sub)
│   ├── BoardStore.ts         # Store específico para boards
│   ├── Middleware.ts         # Middleware pattern
│   └── index.ts
│
├── algorithms/
│   ├── dragDrop.ts           # Algoritmos de drag & drop
│   ├── search.ts             # Algoritmos de búsqueda (Trie, Binary Search)
│   ├── filter.ts             # Filtros eficientes (O(n) max)
│   ├── criticalPath.ts       # Critical path algorithm
│   └── index.ts
│
├── utils/
│   ├── validation.ts         # Zod schemas
│   ├── serialization.ts      # JSON serialization
│   ├── performance.ts        # Performance utilities
│   └── index.ts
│
├── types/
│   ├── board.types.ts
│   ├── card.types.ts
│   ├── events.types.ts
│   └── index.ts
│
└── index.ts
```

### API Pública de @asakaa/core

```typescript
// Usage Example
import { Board, CardService, BoardStore } from '@asakaa/core'

// Create a board
const board = new Board({
  id: 'board-1',
  name: 'My Project',
  columns: []
})

// Initialize store
const store = new BoardStore(board)

// Subscribe to changes
store.subscribe('card:created', (event) => {
  console.log('Card created:', event.data)
})

// Add a card
const cardService = new CardService(store)
cardService.createCard({
  title: 'New Task',
  columnId: 'col-1'
})
```

---

## 🎨 @asakaa/board - Especificación

### Arquitectura Board (UI Layer)

```
@asakaa/board/src/
├── adapters/
│   ├── react/
│   │   ├── BoardProvider.tsx    # React Context Provider
│   │   ├── useBoard.ts          # Hook principal
│   │   ├── useCards.ts          # Hook de cards
│   │   ├── useFilters.ts        # Hook de filtros
│   │   └── index.ts
│   │
│   ├── vue/                      # FUTURO
│   │   └── (Vue composables)
│   │
│   └── vanilla/
│       ├── VanillaBoard.ts       # Clase Vanilla JS
│       └── index.ts
│
├── components/                   # React UI Components
│   ├── Board/
│   │   ├── Board.tsx
│   │   ├── BoardHeader.tsx
│   │   └── index.ts
│   │
│   ├── Column/
│   │   ├── Column.tsx
│   │   ├── ColumnHeader.tsx
│   │   └── index.ts
│   │
│   ├── Card/
│   │   ├── Card.tsx
│   │   ├── CardModal.tsx
│   │   └── index.ts
│   │
│   └── index.ts
│
├── theme/
│   ├── ThemeProvider.tsx
│   ├── themes.ts
│   └── index.ts
│
└── index.ts
```

### API Pública de @asakaa/board (React)

```typescript
// React Usage
import { BoardProvider, Board, useBoard } from '@asakaa/board'
import '@asakaa/board/styles.css'

function App() {
  return (
    <BoardProvider
      initialData={{
        columns: [],
        cards: []
      }}
    >
      <Board />
    </BoardProvider>
  )
}

// Custom component using the hook
function MyCustomCard() {
  const { cards, updateCard } = useBoard()

  return (
    <div>
      {cards.map(card => (
        <div key={card.id} onClick={() => updateCard(card.id, { ... })}>
          {card.title}
        </div>
      ))}
    </div>
  )
}
```

---

## 🚀 Plan de Implementación por Fases

### **Fase 1: Crear @asakaa/core** (Semana 1-2)

**Objetivos**:
- Extraer toda la lógica de negocio a un paquete independiente
- 0 dependencias de React
- 100% test coverage
- Performance optimizado

**Tareas**:
1. ✅ Crear estructura de carpetas `packages/core/`
2. ✅ Migrar modelos (Card, Column, Board) como clases inmutables
3. ✅ Implementar Store event-based (sin Jotai)
4. ✅ Implementar Services (BoardService, CardService, etc.)
5. ✅ Migrar algoritmos optimizados
6. ✅ Escribir tests unitarios (Vitest)
7. ✅ Setup build con tsup (ESM + CJS + tipos)
8. ✅ Documentación TSDoc

**Entregables**:
- `@asakaa/core` publicable en npm
- Docs API completa
- Test coverage >95%

---

### **Fase 2: Refactorizar @asakaa/board** (Semana 3-4)

**Objetivos**:
- Separar UI de lógica
- Crear adaptadores React
- Mantener compatibilidad hacia atrás

**Tareas**:
1. ✅ Crear `adapters/react/` con hooks
2. ✅ Refactorizar componentes para usar hooks de core
3. ✅ Eliminar Jotai (usar core store)
4. ✅ Optimizar re-renders con React.memo
5. ✅ Migrar tests a nueva arquitectura
6. ✅ Actualizar documentación

**Entregables**:
- `@asakaa/board` refactorizado
- Breaking changes documentados
- Migration guide

---

### **Fase 3: Optimización y Performance** (Semana 5)

**Objetivos**:
- Reducir bundle size
- Optimizar algoritmos
- Mejorar performance

**Tareas**:
1. ✅ Tree-shaking audit
2. ✅ Lazy loading de componentes pesados
3. ✅ Virtual scrolling para listas grandes
4. ✅ Memoization strategies
5. ✅ Benchmark tests (comparar con v0.6.0)

**Métricas objetivo**:
- Bundle size: <100KB (gzipped)
- Time to Interactive: <2s
- 60fps en drag & drop
- Soportar 10,000+ cards

---

### **Fase 4: Adapters Multi-Framework** (Semana 6-7)

**Objetivos**:
- Crear adapter Vanilla JS
- Preparar base para Vue/Svelte

**Tareas**:
1. ✅ Implementar `adapters/vanilla/`
2. ✅ Crear ejemplos de uso
3. ✅ Documentar API vanilla
4. ⏳ (Futuro) Adapter Vue
5. ⏳ (Futuro) Adapter Svelte

---

### **Fase 5: CI/CD y Calidad** (Semana 8)

**Objetivos**:
- Pipeline automático
- Quality gates
- Publicación automática

**Tareas**:
1. ✅ GitHub Actions para:
   - Lint (ESLint + Prettier)
   - Tests (Vitest)
   - Type checking (tsc)
   - Build
   - Coverage upload (Codecov)
2. ✅ Semantic versioning automático
3. ✅ Publish to npm (CI)
4. ✅ Docs auto-generation (TypeDoc)

---

## 📐 Decisiones de Diseño

### Store Pattern: Event-Based vs State Management

**Elegido**: Event-based Store (pub/sub)

**Razones**:
- Framework-agnostic
- Fácil de testear
- Bajo overhead
- Permite middleware (logging, persistence, undo/redo)

```typescript
// Core Store API
class Store<T> {
  private state: T
  private subscribers: Map<string, Set<Listener>>

  subscribe(event: string, listener: Listener): () => void
  emit(event: string, data: any): void
  getState(): Readonly<T>
  setState(updater: (state: T) => T): void
}
```

### Modelos Inmutables

**Razones**:
- Previene mutaciones accidentales
- Facilita time-travel debugging
- Compatible con React (shallow comparison)

```typescript
class Card {
  readonly id: string
  readonly title: string
  readonly description: string

  constructor(data: CardData) {
    Object.freeze(this)
  }

  update(partial: Partial<CardData>): Card {
    return new Card({ ...this, ...partial })
  }
}
```

### Dependency Injection para Services

```typescript
interface ICardRepository {
  findById(id: string): Promise<Card | null>
  save(card: Card): Promise<void>
}

class CardService {
  constructor(private repo: ICardRepository) {}

  async createCard(data: CardData): Promise<Card> {
    const card = new Card(data)
    await this.repo.save(card)
    return card
  }
}
```

---

## 🧪 Estrategia de Testing

### Cobertura Objetivo: 95%+

```
@asakaa/core/
├── Unit Tests          # 100% coverage
│   ├── Models
│   ├── Services
│   ├── Store
│   └── Algorithms
│
├── Integration Tests   # Flujos completos
│   ├── CRUD operations
│   ├── Drag & Drop
│   └── Filters & Search
│
└── Performance Tests   # Benchmarks
    ├── Large datasets (10k cards)
    ├── Drag operations
    └── Filter/Search speed
```

### Testing Tools

- **Vitest**: Unit & integration tests
- **Testing Library**: React components
- **Benchmark.js**: Performance tests
- **MSW**: API mocking (futuro)

---

## 📊 Métricas de Éxito

### Performance

| Métrica | v0.6.0 | Target v0.7.0 |
|---------|--------|---------------|
| Bundle size (gzip) | ~180KB | <100KB |
| Time to Interactive | ~3.5s | <2s |
| Cards supported | ~1,000 | 10,000+ |
| Drag FPS | 45-50fps | 60fps |
| Memory usage (10k cards) | ~120MB | <80MB |

### Developer Experience

- ✅ API simple y consistente
- ✅ TypeScript strict mode
- ✅ TSDoc en 100% de la API pública
- ✅ Ejemplos de uso en docs
- ✅ Migration guides

### Ecosystem

- ✅ Framework-agnostic core
- ✅ React adapter
- ⏳ Vue adapter (roadmap)
- ⏳ Svelte adapter (roadmap)
- ✅ Vanilla JS adapter

---

## 🔄 Breaking Changes (v0.6.0 → v0.7.0)

### API Changes

```typescript
// BEFORE (v0.6.0)
import { Board } from '@asakaa/board'
import { useBoardState } from '@asakaa/board'

// AFTER (v0.7.0)
import { BoardProvider, Board } from '@asakaa/board'
import { useBoard } from '@asakaa/board'
// Core logic disponible en:
import { BoardStore, CardService } from '@asakaa/core'
```

### Migration Guide

1. Actualizar imports
2. Reemplazar `useBoardState` → `useBoard`
3. Si usabas Jotai atoms directamente, migrar a hooks

**Tiempo estimado de migración**: 1-2 horas

---

## 📚 Documentación

### Docs Structure

```
docs/
├── getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   └── core-concepts.md
│
├── api-reference/
│   ├── core/
│   │   ├── models.md
│   │   ├── services.md
│   │   └── store.md
│   │
│   └── board/
│       ├── components.md
│       └── hooks.md
│
├── guides/
│   ├── custom-themes.md
│   ├── performance-optimization.md
│   ├── testing.md
│   └── migration-guide.md
│
└── examples/
    ├── react-basic.md
    ├── react-advanced.md
    ├── vanilla-js.md
    └── vue.md (futuro)
```

---

## 🎯 Roadmap Post-v0.7.0

### v0.8.0 - Gantt View
- Reutiliza `@asakaa/core`
- Timeline component
- Dependencies visualization

### v0.9.0 - List View
- Table-based view
- Inline editing
- Bulk operations

### v1.0.0 - Production Ready
- Stable API
- Full documentation
- 100% test coverage
- Performance benchmarks
- Security audit

---

## 💰 Bundle Size Analysis

### Current (v0.6.0)

```
@asakaa/board.js (gzipped)
├── React (peer) - not counted
├── @dnd-kit/* - ~30KB
├── framer-motion - ~100KB 🔴 ELIMINAR
├── recharts - ~400KB 🔴 HACER OPCIONAL
├── jotai - ~10KB 🔴 ELIMINAR
├── Components - ~80KB
└── Utils - ~20KB
─────────────
Total: ~640KB (sin React)
Target: ~100KB
```

### Target (v0.7.0)

```
@asakaa/core.js (gzipped)
├── Models - ~5KB
├── Services - ~10KB
├── Store - ~8KB
├── Algorithms - ~15KB
└── Utils - ~5KB
─────────────
Core: ~43KB ✅

@asakaa/board.js (gzipped)
├── Core (peer) - not counted
├── @dnd-kit/* - ~30KB
├── Components - ~60KB (optimized)
├── Theme - ~5KB
└── Adapters - ~8KB
─────────────
Board: ~103KB ✅
```

---

## ✅ Checklist de Aceptación

### Core Package (@asakaa/core)
- [ ] 0 dependencias de UI
- [ ] Test coverage >95%
- [ ] TypeScript strict mode
- [ ] TSDoc completo
- [ ] Bundle <50KB gzipped
- [ ] Benchmarks vs v0.6.0

### Board Package (@asakaa/board)
- [ ] Usa @asakaa/core
- [ ] React adapter funcional
- [ ] Vanilla adapter funcional
- [ ] Test coverage >90%
- [ ] Bundle <100KB gzipped
- [ ] Backward compatibility layer

### Quality
- [ ] CI/CD pipeline
- [ ] ESLint + Prettier
- [ ] Conventional commits
- [ ] Semantic versioning
- [ ] Changelog automático

### Documentation
- [ ] API reference completa
- [ ] Migration guide
- [ ] 5+ ejemplos de uso
- [ ] Performance guide

---

## 🤝 Contribución

Una vez implementada la nueva arquitectura:

1. Estructura clara para nuevas features
2. Fácil agregar nuevos adapters (Vue, Svelte)
3. Core reutilizable para otras vistas (Gantt, List)
4. Testing más sencillo

---

**Próximos pasos**: ¿Comenzamos con la Fase 1 (Crear @asakaa/core)?
