<div align="center">

<img src="./.github/logo.png" alt="ASAKAA Logo" width="120" height="120">

# 🚀 ASAKAA Board

### **The Ultimate Project Management Library for React**

**Kanban + Gantt + AI** • Production-Ready • TypeScript-First • Zero Configuration

[![NPM Version](https://img.shields.io/npm/v/@asakaa/board?color=blue&logo=npm)](https://www.npmjs.com/package/@asakaa/board)
[![License: BSL 1.1](https://img.shields.io/badge/license-BSL%201.1-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb?logo=react)](https://reactjs.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@asakaa/board?label=gzip&color=success)](https://bundlephobia.com/package/@asakaa/board)
[![Downloads](https://img.shields.io/npm/dm/@asakaa/board?color=success)](https://www.npmjs.com/package/@asakaa/board)
[![Stars](https://img.shields.io/github/stars/Yesid8/asakaa?style=social)](https://github.com/Yesid8/asakaa/stargazers)

[🎮 Live Demo](https://asakaa-kanban.vercel.app/) • [📖 Documentation](#quick-start) • [💡 Examples](#usage) • [🤝 Contributing](./packages/board/CHANGELOG.md)

---

</div>

## 🎯 Why ASAKAA?

**Stop patching together 5 different libraries.** Get a complete, production-ready project management solution in one package.

```bash
npm install @asakaa/board
# That's it. You're done. 🎉
```

### ⚡ What Makes ASAKAA Different?

<table>
<tr>
<td width="33%" align="center">

### 🎨 **2-in-1 Views**
**Kanban + Gantt** in the same component. Switch views instantly. Same data, different perspectives.

</td>
<td width="33%" align="center">

### 🧠 **Smart by Default**
Circular dependency detection, date validation, undo/redo (50 levels). **Your users won't break things.**

</td>
<td width="33%" align="center">

### 🎯 **5-Minute Setup**
No configuration hell. Import, render, done. Comes with themes, keyboard shortcuts, and accessibility **out of the box**.

</td>
</tr>
</table>

---

## 📸 See It In Action

### **Gantt Chart View** - Professional Project Planning

> **NEW in v0.8.0:** Complete Gantt chart with dependencies, milestones, and intelligent validation

<!-- REPLACE THIS WITH YOUR SCREENSHOT -->
![ASAKAA Gantt Chart Dark Theme](./.github/screenshots/gantt-dark-hero.png)

<details>
<summary><strong>✨ Gantt Features (Click to expand)</strong></summary>

<br>

**🎯 Core Capabilities:**
- ✅ **Drag & Drop Scheduling** - Move and resize task bars with pixel-perfect precision
- ✅ **Dependency Management** - Visual arrows showing task relationships
- ✅ **Circular Dependency Detection** - Prevents invalid workflows with smart validation
- ✅ **Milestone Markers** - Diamonds (not bars) for key deliverables
- ✅ **Progress Tracking** - Inline progress bars with percentages
- ✅ **Today Indicator** - Red vertical line showing current date
- ✅ **Hierarchical Tasks** - Unlimited nested subtasks with visual indentation
- ✅ **Click-to-Create** - Click any date in timeline to schedule tasks

**🧠 Intelligent Features:**
- ✅ **Date Validation** - Can't create tasks shorter than 1 day or with start > end
- ✅ **Undo/Redo System** - 50 levels of history with Ctrl+Z/Ctrl+Y
- ✅ **Auto-Scroll Timeline** - Horizontal scroll for extended project timelines
- ✅ **Smart Icons** - Diamonds for milestones, circles for tasks, dots for subtasks

**⚙️ Views & Controls:**
- ✅ **3 Time Scales** - Day, Week (default), Month views
- ✅ **Column Manager** - Show/hide: Status, Assignees, Progress, Dates
- ✅ **3 Themes** - Dark, Light, Neutral with instant switching
- ✅ **Keyboard Shortcuts** - Tab (indent), Shift+Tab (outdent), F2 (rename), Delete

**📊 Professional Features:**
- ✅ **Critical Path Highlighting** - Visual emphasis on blocking tasks
- ✅ **Context Menus** - Right-click for quick actions
- ✅ **Resizable Panels** - Adjust task list / timeline ratio

</details>

---

### **Kanban Board View** - Agile Workflow Management

<!-- REPLACE THIS WITH YOUR SCREENSHOT -->
![ASAKAA Kanban Dark Theme](./.github/screenshots/kanban-dark.png)

<details>
<summary><strong>✨ Kanban Features (Click to expand)</strong></summary>

<br>

**🎯 Core Capabilities:**
- ✅ **Smooth Drag & Drop** - 60fps animations powered by @dnd-kit
- ✅ **Advanced Filtering** - Search, filter by assignee, labels, priority, dates
- ✅ **Virtual Scrolling** - Handle 10,000+ cards without lag
- ✅ **Keyboard Shortcuts** - Cmd+K command palette, arrow navigation
- ✅ **Bulk Operations** - Multi-select with Shift/Ctrl
- ✅ **Export/Import** - JSON, CSV, PDF exports built-in

**🎨 Themes:**
- ✅ **Dark Theme** - Speed, focus, and developer productivity
- ✅ **Light Theme** - WCAG AAA compliant (7:1 contrast)
- ✅ **Neutral Theme** - Minimalist grayscale for distraction-free work

</details>

---

## 🚀 Quick Start

### Installation

```bash
npm install @asakaa/board
# or
yarn add @asakaa/board
# or
pnpm add @asakaa/board
```

### Basic Usage - Gantt Chart

```tsx
import { GanttBoard } from '@asakaa/board'
import '@asakaa/board/styles.css'

function App() {
  const tasks = [
    {
      id: '1',
      name: 'Project Setup',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-05'),
      progress: 100,
      status: 'completed'
    },
    {
      id: '2',
      name: 'Development',
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-01-20'),
      progress: 60,
      status: 'in-progress',
      dependencies: ['1'] // Depends on task 1
    },
    {
      id: '3',
      name: 'Launch',
      startDate: new Date('2025-01-21'),
      endDate: new Date('2025-01-21'),
      isMilestone: true,
      dependencies: ['2']
    }
  ]

  return (
    <GanttBoard
      tasks={tasks}
      config={{
        theme: 'dark',
        timeScale: 'week',
        onTaskUpdate: (updatedTask) => {
          console.log('Task updated:', updatedTask)
        }
      }}
    />
  )
}
```

### Basic Usage - Kanban Board

```tsx
import { KanbanBoard } from '@asakaa/board'
import '@asakaa/board/styles.css'

function App() {
  return (
    <KanbanBoard
      columns={[
        { id: 'todo', title: 'To Do', cards: [] },
        { id: 'in-progress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] }
      ]}
      onUpdate={(columns) => console.log('Board updated:', columns)}
    />
  )
}
```

**That's it!** 🎉 You now have a fully functional Gantt/Kanban board with:
- ✅ Drag & drop
- ✅ Theme switching
- ✅ Keyboard shortcuts
- ✅ Undo/redo
- ✅ And 50+ other features

---

## 💎 Feature Comparison

### vs. Other Solutions

| Feature | ASAKAA | react-beautiful-dnd | @dnd-kit | Jira/Asana |
|---------|--------|---------------------|----------|------------|
| **Ready-to-use UI** | ✅ | ❌ (DIY) | ❌ (DIY) | ✅ |
| **Gantt + Kanban** | ✅ Both | ❌ | ❌ | 💰 Paid |
| **Dependency Management** | ✅ Built-in | ❌ | ❌ | ✅ |
| **Circular Dependency Detection** | ✅ | ❌ | ❌ | ⚠️ Basic |
| **Undo/Redo (50 levels)** | ✅ | ❌ | ❌ | ⚠️ Limited |
| **Date Validation** | ✅ Smart | ❌ | ❌ | ✅ |
| **Themes** | ✅ 3 | ❌ | ❌ | ⚠️ 2 |
| **TypeScript** | ✅ Full | ⚠️ Partial | ✅ | N/A |
| **Bundle Size** | 328 KB | ~40 KB* | ~20 KB* | N/A |
| **Learning Curve** | **5 min** | 2-3 days | 2-3 days | Weeks |
| **Price** | **Free*** | Free | Free | $7-15/user/mo |
| **Self-hosted** | ✅ | ✅ | ✅ | ❌ |

*\*Without UI, themes, filtering, or features*
*\*\*Free for non-production use. Converts to Apache 2.0 in 2027. See [License](#license)*

---

## 📦 What's Included

### Gantt Chart Features (v0.8.0)

```tsx
import {
  GanttBoard,          // Main Gantt component
  useGanttKeyboard,    // Keyboard shortcuts hook
  useUndoRedo,         // Undo/redo system
  cardToGanttTask,     // Convert Kanban cards to Gantt tasks
  ganttTaskToCard      // Convert Gantt tasks to Kanban cards
} from '@asakaa/board'
```

**Components:**
- `GanttBoard` - Complete Gantt chart with timeline
- `GanttToolbar` - Theme switcher, view controls
- `TaskGrid` - Hierarchical task list with inline editing
- `Timeline` - Visual timeline with drag-drop task bars
- `DependencyLine` - Curved arrows showing dependencies
- `Milestone` - Diamond markers for key deliverables
- `ColumnManager` - Toggle visibility of columns
- `ContextMenu` - Right-click actions

**Hooks:**
- `useUndoRedo<T>` - 50-level history management
- `useGanttUndoRedoKeys` - Ctrl+Z/Y keyboard shortcuts
- `useGanttKeyboard` - Arrow navigation, shortcuts
- `useGanttSelection` - Multi-select with Shift/Ctrl

**Utilities:**
- Circular dependency detection (DFS algorithm)
- Date validation (min 1 day, start < end)
- Hierarchy operations (indent, outdent, move, duplicate)
- Type adapters (Kanban ↔ Gantt conversion)

---

### Kanban Board Features

```tsx
import {
  KanbanBoard,         // Main Kanban component
  ThemeProvider,       // Theme context
  useTheme,            // Theme hook
  useBoard,            // Board state hook
  useFilters,          // Advanced filtering
  useSelection,        // Multi-select
  useUndo              // Undo/redo
} from '@asakaa/board'
```

---

## 🎨 Themes

ASAKAA comes with 3 professionally designed themes:

### Dark Theme (Enhanced)
> Optimized for developer productivity and long coding sessions

<!-- SCREENSHOT: Gantt Dark Theme -->

### Light Theme (Standard)
> WCAG AAA compliant with 7:1 contrast ratios for accessibility

<!-- SCREENSHOT: Gantt Light Theme -->

### Neutral Theme (Zen Mode)
> Pure monochrome for distraction-free focus

<!-- SCREENSHOT: Gantt Neutral Theme -->

**Switching themes:**
```tsx
import { ThemeSwitcher } from '@asakaa/board'

function App() {
  return <ThemeSwitcher /> // Done!
}
```

---

## 🎯 Real-World Examples

<details>
<summary><strong>Example 1: Software Development Sprint</strong></summary>

```tsx
const sprintTasks = [
  {
    id: 'epic-1',
    name: 'User Authentication Epic',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-15'),
    progress: 75,
    subtasks: [
      {
        id: 'task-1',
        name: 'Design login UI',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-03'),
        progress: 100,
        status: 'completed',
        assignees: [{ id: '1', name: 'Designer' }]
      },
      {
        id: 'task-2',
        name: 'Implement OAuth',
        startDate: new Date('2025-01-04'),
        endDate: new Date('2025-01-10'),
        progress: 80,
        status: 'in-progress',
        dependencies: ['task-1'],
        assignees: [{ id: '2', name: 'Backend Dev' }]
      },
      {
        id: 'task-3',
        name: 'Write tests',
        startDate: new Date('2025-01-11'),
        endDate: new Date('2025-01-15'),
        progress: 40,
        status: 'in-progress',
        dependencies: ['task-2']
      }
    ]
  },
  {
    id: 'milestone-1',
    name: 'Sprint 1 Complete',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-15'),
    isMilestone: true,
    isCriticalPath: true,
    dependencies: ['epic-1']
  }
]

<GanttBoard tasks={sprintTasks} />
```

</details>

<details>
<summary><strong>Example 2: Marketing Campaign</strong></summary>

```tsx
const campaignTasks = [
  {
    id: '1',
    name: 'Research Phase',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-02-07'),
    progress: 100
  },
  {
    id: '2',
    name: 'Content Creation',
    startDate: new Date('2025-02-08'),
    endDate: new Date('2025-02-20'),
    progress: 60,
    dependencies: ['1'],
    subtasks: [
      { id: '2a', name: 'Blog posts', progress: 80 },
      { id: '2b', name: 'Social media', progress: 40 }
    ]
  },
  {
    id: '3',
    name: 'Campaign Launch',
    startDate: new Date('2025-02-21'),
    endDate: new Date('2025-02-21'),
    isMilestone: true,
    isCriticalPath: true,
    dependencies: ['2']
  }
]

<GanttBoard
  tasks={campaignTasks}
  config={{ theme: 'light', timeScale: 'day' }}
/>
```

</details>

---

## 🔧 Advanced Configuration

### Gantt Configuration

```tsx
<GanttBoard
  tasks={tasks}
  config={{
    theme: 'dark' | 'light' | 'neutral',
    timeScale: 'day' | 'week' | 'month',
    rowDensity: 'compact' | 'comfortable' | 'spacious',
    showThemeSelector: true,
    availableUsers: [
      { id: '1', name: 'John Doe', initials: 'JD', color: '#3B82F6' }
    ],
    onTaskClick: (task) => console.log('Clicked:', task),
    onTaskUpdate: (task) => console.log('Updated:', task),
    onDependencyCreate: (fromId, toId) => console.log('Dependency:', fromId, '→', toId),
    onDependencyDelete: (taskId, depId) => console.log('Removed dependency')
  }}
/>
```

### Keyboard Shortcuts

**Gantt Chart:**
- `Tab` - Indent task (create subtask)
- `Shift+Tab` - Outdent task (promote to parent level)
- `F2` - Rename task
- `Delete` - Delete task
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Shift+Z` - Redo
- `Ctrl+D` / `Cmd+D` - Duplicate task
- `Alt+Up` / `Alt+Down` - Move task up/down
- `Shift+Click` - Connect tasks (create dependency)
- `Click on timeline` - Create 1-day task bar

**Kanban Board:**
- `Cmd+K` / `Ctrl+K` - Open command palette
- `Arrow keys` - Navigate cards
- `Space` - Select/deselect card
- `Shift+Click` - Multi-select
- `Delete` - Delete selected cards

---

## 📊 Performance

**Built for scale:**
- ✅ Virtual scrolling handles **10,000+ tasks**
- ✅ **60fps** drag-and-drop animations
- ✅ Debounced search (300ms) for instant filtering
- ✅ Optimized re-renders with `React.memo`
- ✅ Tree-shakeable - only import what you need

**Bundle Size:**
- ESM: 328 KB (minified)
- Gzipped: ~85 KB
- CSS: 67 KB

---

## 🧪 TypeScript Support

**100% TypeScript with complete type definitions:**

```tsx
import type {
  Task,
  GanttConfig,
  TimeScale,
  Theme,
  Dependency,
  TaskStatus
} from '@asakaa/board'

const task: Task = {
  id: '1',
  name: 'TypeScript Heaven',
  startDate: new Date(),
  endDate: new Date(),
  progress: 100,
  status: 'completed',
  isMilestone: false,
  dependencies: [],
  subtasks: []
}
```

---

## 🌐 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Modern mobile browsers

---

## 📚 Documentation

- [📖 Full API Reference](./packages/board/docs/)
- [🎯 Examples & Recipes](./packages/board/examples/)
- [📝 CHANGELOG](./packages/board/CHANGELOG.md)
- [🐛 Report Issues](https://github.com/Yesid8/asakaa/issues)

---

## 🗺️ Roadmap

### v0.9.0 (Planned - Q1 2025)
- [ ] Real-time collaboration (WebSocket support)
- [ ] Export to MS Project / Jira format
- [ ] Custom field types
- [ ] Advanced filtering (saved filters, complex queries)

### v1.0.0 (Planned - Q2 2025)
- [ ] Mobile-optimized touch controls
- [ ] Calendar view
- [ ] Resource allocation view
- [ ] REST API integration helpers

**Want a feature?** [Open an issue!](https://github.com/Yesid8/asakaa/issues/new)

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Quick start:**
```bash
git clone https://github.com/Yesid8/asakaa.git
cd asakaa/packages/board
pnpm install
pnpm run dev
```

---

## 📄 License

**Business Source License 1.1**

- ✅ **Free for non-production use** (development, testing, evaluation)
- ✅ **Converts to Apache 2.0** on 2027-10-12 (fully open source)
- ✅ **Commercial use:** Contact for licensing

See [LICENSE](./LICENSE) for full details.

**TLDR:** Use it freely for side projects, learning, and evaluation. For production use in commercial products, please reach out.

---

## 🏆 Built With

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [@dnd-kit](https://dndkit.com/) - Drag and drop
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide React](https://lucide.dev/) - Icons
- [Jotai](https://jotai.org/) - State management

---

## 💖 Show Your Support

If ASAKAA saves you time and makes your project management easier:

- ⭐ Star this repository
- 🐦 Tweet about it
- 📝 Write a blog post
- 🎥 Create a tutorial
- 💬 Spread the word!

---

<div align="center">

**Made with ❤️ for developers who value their time**

[⬆ Back to Top](#-asakaa-board)

</div>
