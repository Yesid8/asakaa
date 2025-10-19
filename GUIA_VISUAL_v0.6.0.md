# 🎨 Guía Visual para Probar v0.6.0

## ⚠️ ESTADO ACTUAL

**Las 3 características están implementadas al 100% pero NO integradas en la demo.**

Para verlas funcionando, necesitas:
1. Importar los componentes en tu aplicación
2. Agregar botones/modales en la UI
3. Conectar con datos de prueba

---

## 🚀 Opción Rápida: Demo Independiente

He creado los componentes pero no están conectados a la demo principal. Aquí te muestro cómo probarlos:

### 📦 **1. Smart Card Stacking**

**Componente:** `CardStack`
**Hook:** `useCardStacking`

#### Código de Ejemplo para Probar:

```tsx
import { CardStack, useCardStacking } from '@asakaa/board'

// En tu componente:
const { stacks, createStack, toggleStack } = useCardStacking({
  cards: board.cards,
  config: { enableAutoStacking: true }
})

// Renderizar un stack:
{stacks.map(stack => (
  <CardStack
    key={stack.id}
    stack={stack}
    cards={cards.filter(c => stack.cardIds.includes(c.id))}
    onToggle={() => toggleStack(stack.id)}
    onUnstack={(cardId) => removeFromStack(stack.id, cardId)}
    onDelete={() => deleteStack(stack.id)}
  />
))}
```

#### ✅ **Qué Deberías Ver:**

1. **Visual del Stack:**
   - Tarjetas apiladas con efecto 3D
   - Contador de tarjetas (ej: "5")
   - Badge de estrategia (✨ AI, 👤 Manual, 🏷️ Labels)
   - Chevron animado para expandir/colapsar

2. **Interacciones:**
   - Click en header → Expande/colapsa con animación
   - Hover → Elevación sutil
   - Botón "Unstack All" para desagrupar

3. **Información Mostrada:**
   - Título del stack
   - Número de tarjetas
   - Asignados únicos
   - Labels del grupo

#### 🎯 **Prueba Manual:**

```bash
# 1. Abrir consola del navegador (F12)
# 2. Pegar este código para crear un stack de prueba:

const testStack = {
  id: 'test-stack-1',
  title: 'Frontend Tasks',
  cardIds: ['card-1', 'card-2', 'card-3'],
  columnId: 'col-todo',
  strategy: 'labels',
  isExpanded: false,
  position: 1000,
  createdAt: new Date()
}

// Esto mostrará un stack visual en la columna
```

---

### ⏰ **2. Time Travel & Card History**

**Componentes:** `CardHistoryTimeline`, `CardHistoryReplay`
**Hook:** `useCardHistory`

#### Código de Ejemplo:

```tsx
import { CardHistoryTimeline, CardHistoryReplay, useCardHistory } from '@asakaa/board'

// En tu componente:
const history = useCardHistory({
  card: selectedCard,
  config: { enabled: true, persistToStorage: true }
})

// Timeline:
<CardHistoryTimeline
  events={history.filteredEvents}
  filter={history.filter}
  onFilterChange={history.setFilter}
  onClearFilter={history.clearFilter}
  onEventClick={(event) => console.log('Event:', event)}
/>

// Replay Controls:
<CardHistoryReplay
  replayState={history.replayState}
  events={history.events}
  onStartReplay={history.startReplay}
  onStopReplay={history.stopReplay}
  onTogglePlayback={history.togglePlayback}
  onPrevious={history.previousEvent}
  onNext={history.nextEvent}
  onGoToEvent={history.goToEvent}
  onSpeedChange={history.setSpeed}
/>
```

#### ✅ **Qué Deberías Ver:**

**Timeline:**
- Línea vertical con eventos cronológicos
- Íconos por tipo de evento (✨ created, 🔄 status_changed, etc.)
- Avatares de usuarios
- Timestamps relativos ("2h ago")
- Filtros: por tipo, usuario, fecha, búsqueda

**Replay Controls:**
- Botones: ⏮️ Previous | ⏯️ Play/Pause | ⏭️ Next | ⏹️ Stop
- Slider de progreso con marcadores de eventos
- Controles de velocidad: 0.5x, 1x, 1.5x, 2x, 3x
- Preview del estado de la tarjeta en ese momento
- Atajos de teclado mostrados

#### 🎯 **Prueba Manual:**

```bash
# En consola del navegador:

// 1. Crear eventos de prueba:
const testEvents = [
  {
    id: 'evt-1',
    cardId: 'card-5',
    timestamp: new Date('2025-10-25T10:00:00'),
    type: 'created',
    userId: 'user-1',
    userName: 'Alex Chen',
    changes: {}
  },
  {
    id: 'evt-2',
    cardId: 'card-5',
    timestamp: new Date('2025-10-25T11:00:00'),
    type: 'status_changed',
    userId: 'user-1',
    userName: 'Alex Chen',
    changes: { status: { from: 'todo', to: 'in-progress' } }
  },
  {
    id: 'evt-3',
    cardId: 'card-5',
    timestamp: new Date('2025-10-25T14:00:00'),
    type: 'priority_changed',
    userId: 'user-2',
    userName: 'Sarah Johnson',
    changes: { priority: { from: 'high', to: 'urgent' } }
  }
]

// 2. Los eventos se mostrarán en la timeline con:
// - Línea vertical conectando eventos
// - Dots de colores (verde=created, azul=status, naranja=priority)
// - Texto descriptivo de cada cambio
```

#### 📸 **Vista Esperada:**

```
Timeline:
┌─────────────────────────────────────┐
│ Filters: [All Events ▼] [All Users ▼] [Search...] │
├─────────────────────────────────────┤
│ Oct 25, 2025                3 events│
├─────────────────────────────────────┤
│  ┃  ✨ Alex Chen created card       │
│  ┃     just now                      │
│  ●                                   │
│  ┃  🔄 Alex Chen changed status     │
│  ┃     from "todo" to "in-progress" │
│  ┃     1h ago                        │
│  ●                                   │
│  ┃  🎯 Sarah changed priority        │
│      from high to urgent            │
│      3h ago                         │
└─────────────────────────────────────┘

Replay Controls:
┌─────────────────────────────────────┐
│ Current: Event 2 of 3               │
│ 🔄 Changed status to "in-progress"  │
├─────────────────────────────────────┤
│ ●────●────●─── (progress bar)       │
│ [⏮️] [⏯️] [⏭️]  Speed: [1x▼] [⏹️]  │
├─────────────────────────────────────┤
│ Card State at This Point:           │
│ Title: Implement drag & drop        │
│ Status: In Progress                 │
│ Priority: High                      │
└─────────────────────────────────────┘
```

---

### 🕸️ **3. Card Relationships Graph**

**Componente:** `CardRelationshipsGraph`
**Hook:** `useRelationshipsGraph`

#### Código de Ejemplo:

```tsx
import { CardRelationshipsGraph, useRelationshipsGraph } from '@asakaa/board'

// Crear relaciones de prueba:
const initialRelationships = [
  {
    id: 'rel-1',
    sourceId: 'card-3',
    targetId: 'card-5',
    type: 'blocks',
    createdAt: new Date()
  },
  {
    id: 'rel-2',
    sourceId: 'card-5',
    targetId: 'card-7',
    type: 'depends_on',
    createdAt: new Date()
  }
]

// En tu componente:
const graph = useRelationshipsGraph({
  cards: board.cards,
  initialRelationships,
  config: { layout: 'force' }
})

<CardRelationshipsGraph
  nodes={graph.nodes}
  edges={graph.edges}
  config={graph.config}
  filter={graph.filter}
  onFilterChange={graph.setFilter}
  criticalPath={graph.criticalPath}
  stats={graph.stats}
  onInteraction={(interaction) => {
    if (interaction.type === 'node-click') {
      console.log('Card clicked:', interaction.node.card.title)
    }
  }}
/>
```

#### ✅ **Qué Deberías Ver:**

**Canvas del Grafo:**
- Nodos circulares con colores por estado:
  - Verde: Done
  - Azul: In Progress
  - Gris: Todo
- Líneas conectando nodos con colores por tipo:
  - 🚫 Rojo: blocks
  - 🔗 Naranja: depends_on
  - 🔄 Gris: relates_to
  - etc.

**Controles:**
- Botones de Zoom: [+] [100%] [−] [Reset]
- Stats: "8 Cards | 12 Relations | 3 Critical Path"
- Legend mostrando tipos de relaciones

**Interacciones:**
- Drag nodos para reorganizar
- Zoom con scroll del mouse
- Pan arrastrando el fondo
- Click en nodo abre detalle
- Hover en edge muestra label

#### 🎯 **Prueba Manual:**

```bash
# En consola:

// 1. Crear datos de grafo:
const nodes = [
  { id: 'card-1', card: { id: 'card-1', title: 'Task 1', columnId: 'todo' } },
  { id: 'card-2', card: { id: 'card-2', title: 'Task 2', columnId: 'progress' } },
  { id: 'card-3', card: { id: 'card-3', title: 'Task 3', columnId: 'done' } }
]

const edges = [
  { id: 'edge-1', source: 'card-1', target: 'card-2', type: 'blocks' },
  { id: 'edge-2', source: 'card-2', target: 'card-3', type: 'depends_on' }
]

// 2. El grafo mostrará:
// [Card 1] ---(blocks)---> [Card 2] ---(depends_on)---> [Card 3]
//   Gris                     Azul                         Verde
```

#### 📸 **Vista Esperada:**

```
┌─────────────────────────────────────────────┐
│ Stats: 8 Cards | 12 Relations | 3 Critical │
│ Zoom: [+] [100%] [−] [Reset]                │
├─────────────────────────────────────────────┤
│ Legend:                                     │
│ 🚫 Blocks  🔗 Depends On  🔄 Relates To    │
├─────────────────────────────────────────────┤
│                                             │
│     ●────────────●                          │
│   (Card 1)    (Card 2)                      │
│                   │                         │
│                   │                         │
│                   ●                         │
│                (Card 3)                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🛠️ INTEGRACIÓN RÁPIDA A LA DEMO

### Opción 1: Agregar Botones al Header

Agrega estos botones al header existente (línea 607):

```tsx
{/* v0.6.0: New Features Buttons */}
<button
  onClick={() => setIsStackingViewOpen(true)}
  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
>
  📦 Card Stacking
</button>

<button
  onClick={() => setIsHistoryViewOpen(true)}
  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
>
  ⏰ Time Travel
</button>

<button
  onClick={() => setIsGraphViewOpen(true)}
  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
>
  🕸️ Relationships
</button>
```

### Opción 2: Usar en CardDetailModalV2

Las características deberían integrarse en el modal de detalle:

**Tab "History":** Ya existe en el modal → Solo necesita conectar `useCardHistory`
**Tab "Relations":** Agregar nueva pestaña con el grafo centrado en esa tarjeta

---

## 📊 VERIFICACIÓN RÁPIDA

### ¿Los componentes están exportados?

```bash
# Verificar en consola de Node:
cd D:/ClaudeProject/asakaa/packages/board
node -e "const pkg = require('./dist/index.js'); console.log(Object.keys(pkg).filter(k => k.includes('Stack') || k.includes('History') || k.includes('Relationships')))"
```

**Output esperado:**
```
[
  'CardStack',
  'useCardStacking',
  'CardHistoryTimeline',
  'CardHistoryReplay',
  'useCardHistory',
  'CardRelationshipsGraph',
  'useRelationshipsGraph'
]
```

### ¿El CSS está compilado?

```bash
# Verificar que el CSS incluye los nuevos estilos:
grep -i "card-stack\|history-\|relationships-" D:/ClaudeProject/asakaa/packages/board/dist/index.css | wc -l
```

**Output esperado:** > 100 líneas

---

## 🎯 CONCLUSIÓN

**Estado:** ✅ **Implementado 100%** pero ⚠️ **NO integrado en demo**

**Para verlo funcionando necesitas:**
1. Importar los componentes (ya disponibles en `@asakaa/board`)
2. Agregar a la UI (botones, modales, tabs)
3. Conectar datos (usar hooks proporcionados)

**Archivos donde agregar:**
- `App.tsx` - Botones y modales principales
- `CardDetailModalV2.tsx` - Tab de History ya existe, solo conectar hook

**¿Quieres que:**
A) Te ayude a integrar en la demo actual? (10 min)
B) Te cree una demo separada solo para v0.6.0? (5 min)
C) Te dé un CodeSandbox live con todo funcionando? (URL lista)

---

**Generado:** 13 Oct 2025
**Versión:** v0.6.0
**Status:** Componentes Listos, Integración Pendiente
