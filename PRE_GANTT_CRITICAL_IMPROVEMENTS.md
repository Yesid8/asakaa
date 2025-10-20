# MEJORAS CRÍTICAS PRE-GANTT

**Fecha:** 19 de Octubre, 2025
**Objetivo:** Preparar base sólida para módulo Gantt
**Timeline:** 2-3 semanas antes de iniciar Gantt

---

## 🎯 RESUMEN EJECUTIVO

Basado en el reporte ejecutivo v0.7.0 y análisis de arquitectura, estas son las **mejoras críticas** que debemos completar **ANTES** de iniciar el módulo Gantt.

**Estado actual:**
- ✅ Arquitectura base excelente (9.6/10)
- ✅ AsakaaRuntime, Plugin System, ViewAdapter funcionando
- 🔴 Faltan extensiones al modelo de datos para Gantt
- 🔴 Falta motor de dependencias
- 🔴 Falta virtual scrolling

**Prioridad:**
1. **CRÍTICO** - Sin esto, Gantt no puede empezar
2. **IMPORTANTE** - Afecta calidad/performance del Gantt
3. **NICE-TO-HAVE** - Puede hacerse en paralelo con Gantt

---

## 🚨 PRIORIDAD 1: CRÍTICO (Hacer AHORA)

### 1. Extender Modelo de Datos para Gantt

**Estado actual:**
```typescript
// packages/core/src/models/Card.ts
class Card {
  id: string
  title: string
  columnId: string
  position: number
  description?: string
  labels?: string[]
  assigneeId?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  // ❌ NO HAY: startDate, endDate, dependencies
}
```

**Necesario para Gantt:**
```typescript
class Card {
  // ... campos existentes

  // 🆕 Gantt fields
  startDate?: Date | string
  endDate?: Date | string
  dependencies?: Dependency[]  // Array de dependencias
  estimatedHours?: number
  actualHours?: number
  progress?: number  // 0-100%

  // 🆕 Gantt methods
  getDuration(): number
  getProgress(): number
  hasDependencies(): boolean
  getDependentTasks(): string[]
  canStart(tasks: Card[]): boolean
}

interface Dependency {
  taskId: string
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'
  lag?: number  // días de retraso/adelanto
}
```

**Acción:**
1. Actualizar `CardData` interface con campos opcionales
2. Agregar métodos helper en `Card` class
3. Mantener backward compatibility (campos opcionales)
4. Actualizar tests

**Timeline:** 2 días
**Impacto:** 🔴 CRÍTICO - Sin esto Gantt no puede funcionar

---

### 2. Motor de Dependencias

**Crear:** `packages/core/src/gantt/DependencyEngine.ts`

```typescript
/**
 * Dependency Engine
 * Handles task dependencies, topological sort, cycle detection
 */

export class DependencyEngine {
  /**
   * Resolve task order based on dependencies
   * Returns tasks in execution order
   */
  resolveDependencies(tasks: Card[]): Card[] {
    const graph = this.buildGraph(tasks)
    const sorted = this.topologicalSort(graph)
    this.detectCycles(graph)
    return sorted
  }

  /**
   * Calculate earliest start date for a task
   */
  calculateEarliestStart(task: Card, tasks: Card[]): Date {
    const dependencies = this.getDependencies(task, tasks)
    if (dependencies.length === 0) {
      return task.startDate || new Date()
    }

    // Find latest end date of dependencies
    const latestDependencyEnd = Math.max(
      ...dependencies.map(dep => dep.endDate?.getTime() || 0)
    )

    return new Date(latestDependencyEnd)
  }

  /**
   * Calculate critical path
   * Returns array of task IDs in critical path
   */
  calculateCriticalPath(tasks: Card[]): string[] {
    // CPM algorithm
    const path: string[] = []
    // ... implementation
    return path
  }

  /**
   * Detect circular dependencies
   * Throws error if cycle detected
   */
  private detectCycles(graph: Map<string, string[]>): void {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    for (const [node] of graph) {
      if (this.hasCycle(node, graph, visited, recursionStack)) {
        throw new Error(`Circular dependency detected involving task: ${node}`)
      }
    }
  }

  private hasCycle(
    node: string,
    graph: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    if (recursionStack.has(node)) return true
    if (visited.has(node)) return false

    visited.add(node)
    recursionStack.add(node)

    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      if (this.hasCycle(neighbor, graph, visited, recursionStack)) {
        return true
      }
    }

    recursionStack.delete(node)
    return false
  }

  /**
   * Topological sort using DFS
   */
  private topologicalSort(graph: Map<string, string[]>): Card[] {
    // ... implementation
  }

  private buildGraph(tasks: Card[]): Map<string, string[]> {
    const graph = new Map<string, string[]>()

    tasks.forEach(task => {
      graph.set(task.id, [])

      task.dependencies?.forEach(dep => {
        const dependencies = graph.get(task.id) || []
        dependencies.push(dep.taskId)
        graph.set(task.id, dependencies)
      })
    })

    return graph
  }
}

export const dependencyEngine = new DependencyEngine()
```

**Tests:**
```typescript
// packages/core/src/gantt/__tests__/DependencyEngine.test.ts
describe('DependencyEngine', () => {
  it('should detect circular dependencies', () => {
    const tasks = [
      { id: 'A', dependencies: [{ taskId: 'B', type: 'finish-to-start' }] },
      { id: 'B', dependencies: [{ taskId: 'A', type: 'finish-to-start' }] }
    ]

    expect(() => {
      dependencyEngine.resolveDependencies(tasks)
    }).toThrow('Circular dependency')
  })

  it('should calculate critical path', () => {
    // ... test
  })

  it('should resolve dependencies in correct order', () => {
    // ... test
  })
})
```

**Timeline:** 3-4 días
**Impacto:** 🔴 CRÍTICO - Core del Gantt

---

### 3. Date Utilities para Gantt

**Crear:** `packages/core/src/gantt/DateUtils.ts`

```typescript
/**
 * Date utilities for Gantt calculations
 */

export class DateUtils {
  /**
   * Add business days (skip weekends)
   */
  static addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date)
    let addedDays = 0

    while (addedDays < days) {
      result.setDate(result.getDate() + 1)
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        addedDays++
      }
    }

    return result
  }

  /**
   * Calculate business days between two dates
   */
  static getBusinessDaysBetween(start: Date, end: Date): number {
    let count = 0
    const current = new Date(start)

    while (current <= end) {
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }

    return count
  }

  /**
   * Get week number
   */
  static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  /**
   * Format date for Gantt display
   */
  static formatForGantt(date: Date, scale: 'day' | 'week' | 'month'): string {
    switch (scale) {
      case 'day':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case 'week':
        return `W${this.getWeekNumber(date)}`
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
  }

  /**
   * Get date range for timeline
   */
  static getTimelineRange(tasks: Card[]): { start: Date; end: Date } {
    const dates = tasks
      .flatMap(task => [task.startDate, task.endDate])
      .filter((date): date is Date => date instanceof Date)

    if (dates.length === 0) {
      return { start: new Date(), end: new Date() }
    }

    return {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime())))
    }
  }
}
```

**Timeline:** 1 día
**Impacto:** 🔴 CRÍTICO - Gantt necesita cálculos de fechas

---

### 4. Actualizar BoardStore para Dependencias

**Modificar:** `packages/core/src/store/BoardStore.ts`

```typescript
class BoardStore {
  // ... métodos existentes

  // 🆕 Dependency methods
  addDependency(cardId: string, dependency: Dependency): void {
    const card = this.cards.get(cardId)
    if (!card) throw new Error(`Card ${cardId} not found`)

    const dependencies = card.dependencies || []
    dependencies.push(dependency)

    const updated = card.update({ dependencies })
    this.cards.set(cardId, updated)

    // Validate no cycles
    this.validateDependencies()

    this.emit('card:dependency:added', { cardId, dependency })
    this.notifyAll()
  }

  removeDependency(cardId: string, dependencyTaskId: string): void {
    const card = this.cards.get(cardId)
    if (!card) return

    const dependencies = (card.dependencies || []).filter(
      dep => dep.taskId !== dependencyTaskId
    )

    const updated = card.update({ dependencies })
    this.cards.set(cardId, updated)

    this.emit('card:dependency:removed', { cardId, dependencyTaskId })
    this.notifyAll()
  }

  getDependencies(cardId: string): Card[] {
    const card = this.cards.get(cardId)
    if (!card) return []

    return (card.dependencies || [])
      .map(dep => this.cards.get(dep.taskId))
      .filter((c): c is Card => c !== undefined)
  }

  getDependentCards(cardId: string): Card[] {
    return Array.from(this.cards.values()).filter(card =>
      (card.dependencies || []).some(dep => dep.taskId === cardId)
    )
  }

  private validateDependencies(): void {
    const tasks = Array.from(this.cards.values())
    try {
      dependencyEngine.resolveDependencies(tasks)
    } catch (error) {
      throw new Error(`Invalid dependencies: ${error.message}`)
    }
  }
}
```

**Timeline:** 2 días
**Impacto:** 🔴 CRÍTICO - Store debe manejar dependencias

---

## ⚠️ PRIORIDAD 2: IMPORTANTE (Hacer antes o en paralelo con Gantt)

### 5. Virtual Scrolling

**Estado actual:** Limitado a ~1000 cards óptimo

**Implementar:** `@tanstack/react-virtual` en Kanban

```typescript
// packages/board/src/components/Board/VirtualizedBoard.tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualizedBoard({ cards }: { cards: Card[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: cards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // estimated card height
    overscan: 5
  })

  return (
    <div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const card = cards[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <Card card={card} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Beneficio para Gantt:**
- Gantt puede renderizar miles de tareas sin lag
- Scrolling horizontal y vertical performante

**Timeline:** 3 días
**Impacto:** ⚠️ IMPORTANTE - Performance del Gantt

---

### 6. Sistema de Tokens de Diseño Compartido

**Crear:** `packages/core/src/theme/tokens.ts`

```typescript
/**
 * Design tokens shared across all views
 */

export const designTokens = {
  colors: {
    // Brand
    primary: 'hsl(240, 90%, 60%)',
    secondary: 'hsl(200, 80%, 50%)',

    // Status
    success: 'hsl(142, 76%, 36%)',
    warning: 'hsl(38, 92%, 50%)',
    error: 'hsl(0, 84%, 60%)',
    info: 'hsl(199, 89%, 48%)',

    // Neutrals
    bg: 'hsl(220, 15%, 97%)',
    surface: 'hsl(0, 0%, 100%)',
    border: 'hsl(220, 13%, 91%)',
    text: 'hsl(220, 9%, 26%)',
    textMuted: 'hsl(220, 9%, 46%)',

    // Gantt specific
    timeline: 'hsl(220, 13%, 95%)',
    taskBar: 'hsl(210, 80%, 60%)',
    dependency: 'hsl(0, 0%, 60%)',
    milestone: 'hsl(45, 100%, 51%)',
    critical: 'hsl(0, 84%, 60%)',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },

  gantt: {
    rowHeight: 40,
    headerHeight: 60,
    taskHeight: 28,
    taskMargin: 6,
    dependencyLineWidth: 2,
    timelineGridColor: 'hsl(220, 13%, 91%)',
  }
}

// CSS Variables
export function generateCSSVariables() {
  return `
    :root {
      --asakaa-primary: ${designTokens.colors.primary};
      --asakaa-bg: ${designTokens.colors.bg};
      --asakaa-gantt-row-height: ${designTokens.gantt.rowHeight}px;
      --asakaa-gantt-task-height: ${designTokens.gantt.taskHeight}px;
      /* ... more vars */
    }
  `
}
```

**Timeline:** 2 días
**Impacto:** ⚠️ IMPORTANTE - Coherencia visual Kanban + Gantt

---

### 7. Render Engine Base para Timeline

**Crear:** `packages/core/src/gantt/TimelineRenderer.ts`

```typescript
/**
 * Timeline renderer (SVG-based)
 * Can be used by Gantt, Calendar, Timeline views
 */

export interface TimelineConfig {
  startDate: Date
  endDate: Date
  scale: 'day' | 'week' | 'month'
  width: number
  height: number
}

export class TimelineRenderer {
  private svg: SVGElement
  private config: TimelineConfig

  constructor(container: HTMLElement, config: TimelineConfig) {
    this.config = config
    this.svg = this.createSVG(config.width, config.height)
    container.appendChild(this.svg)
  }

  private createSVG(width: number, height: number): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', width.toString())
    svg.setAttribute('height', height.toString())
    svg.style.display = 'block'
    return svg
  }

  /**
   * Render timeline grid
   */
  renderGrid(): void {
    const { startDate, endDate, scale, width, height } = this.config
    const totalDays = DateUtils.getBusinessDaysBetween(startDate, endDate)
    const dayWidth = width / totalDays

    // Vertical lines for each day/week/month
    for (let i = 0; i <= totalDays; i++) {
      const x = i * dayWidth
      const line = this.createLine(x, 0, x, height, designTokens.gantt.timelineGridColor)
      this.svg.appendChild(line)
    }
  }

  /**
   * Render task bar
   */
  renderTask(task: Card, y: number): SVGGElement {
    const { startDate, endDate } = this.config
    const taskGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const taskStart = task.startDate || startDate
    const taskEnd = task.endDate || endDate

    const x = this.dateToX(taskStart)
    const width = this.dateToX(taskEnd) - x
    const height = designTokens.gantt.taskHeight

    const rect = this.createRect(x, y, width, height, designTokens.colors.taskBar)
    taskGroup.appendChild(rect)

    // Progress bar
    if (task.progress) {
      const progressWidth = width * (task.progress / 100)
      const progressRect = this.createRect(x, y, progressWidth, height, designTokens.colors.primary)
      progressRect.setAttribute('opacity', '0.5')
      taskGroup.appendChild(progressRect)
    }

    return taskGroup
  }

  /**
   * Render dependency line
   */
  renderDependency(from: Card, to: Card, fromY: number, toY: number): SVGPathElement {
    const fromX = this.dateToX(from.endDate || new Date())
    const toX = this.dateToX(to.startDate || new Date())

    // Create bezier curve from (fromX, fromY) to (toX, toY)
    const path = this.createPath(
      `M ${fromX} ${fromY} C ${fromX + 50} ${fromY}, ${toX - 50} ${toY}, ${toX} ${toY}`,
      designTokens.colors.dependency
    )

    return path
  }

  private dateToX(date: Date): number {
    const { startDate, endDate, width } = this.config
    const totalDays = DateUtils.getBusinessDaysBetween(startDate, endDate)
    const daysSinceStart = DateUtils.getBusinessDaysBetween(startDate, date)
    const dayWidth = width / totalDays
    return daysSinceStart * dayWidth
  }

  private createLine(x1: number, y1: number, x2: number, y2: number, color: string): SVGLineElement {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x1.toString())
    line.setAttribute('y1', y1.toString())
    line.setAttribute('x2', x2.toString())
    line.setAttribute('y2', y2.toString())
    line.setAttribute('stroke', color)
    line.setAttribute('stroke-width', '1')
    return line
  }

  private createRect(x: number, y: number, width: number, height: number, fill: string): SVGRectElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', x.toString())
    rect.setAttribute('y', y.toString())
    rect.setAttribute('width', width.toString())
    rect.setAttribute('height', height.toString())
    rect.setAttribute('fill', fill)
    rect.setAttribute('rx', designTokens.borderRadius.sm)
    return rect
  }

  private createPath(d: string, stroke: string): SVGPathElement {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)
    path.setAttribute('stroke', stroke)
    path.setAttribute('stroke-width', designTokens.gantt.dependencyLineWidth.toString())
    path.setAttribute('fill', 'none')
    return path
  }

  clear(): void {
    this.svg.innerHTML = ''
  }

  destroy(): void {
    this.svg.remove()
  }
}
```

**Timeline:** 4-5 días
**Impacto:** ⚠️ IMPORTANTE - Motor reutilizable para Gantt y futuras vistas

---

## 🟢 PRIORIDAD 3: NICE-TO-HAVE (Puede hacerse en paralelo con Gantt)

### 8. Monorepo con Turborepo

Actualmente tienes estructura de paquetes, pero no Turborepo.

**Beneficio:**
- Builds incrementales
- Cache compartido
- Pipelines paralelos

**Timeline:** 2-3 días
**Impacto:** 🟢 NICE-TO-HAVE - Mejora DX pero Gantt puede empezar sin esto

---

### 9. Storybook para Documentación

**Beneficio:**
- Componentes aislados
- Visual regression testing
- Documentación interactiva

**Timeline:** 3-4 días
**Impacto:** 🟢 NICE-TO-HAVE - Puede hacerse después

---

### 10. AI Implementation Real

Según el reporte, AI implementation está en 3/10 (stub code).

**Esto es CRÍTICO para el producto**, pero **NO bloquea Gantt**.

Puedes hacer AI en paralelo mientras construyes Gantt.

---

## 📅 TIMELINE RECOMENDADO

### Semana 1 (Crítico)
**Días 1-2:** Extender modelo de datos (Card con startDate, endDate, dependencies)
**Días 3-5:** Motor de dependencias + DateUtils
**Día 6-7:** Actualizar BoardStore para dependencias

### Semana 2 (Importante)
**Días 1-3:** Virtual scrolling en Kanban
**Días 4-5:** Sistema de tokens de diseño
**Días 6-7:** Tests + documentación

### Semana 3 (Render Engine)
**Días 1-5:** TimelineRenderer base (SVG)
**Días 6-7:** Tests + optimización

**Total:** 2-3 semanas

**Después de esto → LISTO PARA GANTT** ✅

---

## ✅ CHECKLIST PRE-GANTT

Antes de empezar Gantt, verifica:

- [ ] Card model tiene `startDate`, `endDate`, `dependencies`
- [ ] `DependencyEngine` funciona (tests passing)
- [ ] `DateUtils` tiene todas las funciones necesarias
- [ ] `BoardStore` maneja dependencias sin ciclos
- [ ] Virtual scrolling implementado en Kanban
- [ ] Design tokens definidos y usados
- [ ] `TimelineRenderer` base funcional (SVG grid + task bars)
- [ ] Tests de integración pasando (100%)
- [ ] Bundle size < 250 KB
- [ ] Documentación actualizada

---

## 🎯 DESPUÉS DE COMPLETAR ESTO

Con esto listo, el módulo Gantt será:

1. **Fácil de implementar** - Motor de dependencias ya existe
2. **Performante** - Virtual scrolling + SVG optimizado
3. **Coherente** - Design tokens compartidos
4. **Extensible** - TimelineRenderer reutilizable
5. **Robusto** - Tests + validación de ciclos

**Gantt se convertirá en una vista más** que usa:
- `DependencyEngine` para lógica
- `TimelineRenderer` para render
- `BoardStore` para estado
- `ViewAdapter` pattern para integración

---

## 💡 RECOMENDACIÓN FINAL

**Hacer en orden:**

1. ✅ **Semana 1:** Modelo de datos + Motor de dependencias (CRÍTICO)
2. ✅ **Semana 2:** Virtual scrolling + Design tokens (IMPORTANTE)
3. ✅ **Semana 3:** TimelineRenderer base (IMPORTANTE)
4. 🚀 **Semana 4+:** INICIAR GANTT con base sólida

**AI Implementation** → Hacer en paralelo (no bloquea Gantt)

**Monorepo/Storybook** → Hacer después (nice-to-have)

---

**Con esto, Gantt se implementará en 3-4 semanas vs 8+ semanas sin base sólida.**
