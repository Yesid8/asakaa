# ASAKAA

> Modern project management components for React - Built for performance and developer experience.

[![License](https://img.shields.io/badge/license-BSL%201.1-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org/)

## 🎯 Vision

ASAKAA is a comprehensive suite of project management components designed to help teams build powerful productivity tools. Starting with our Kanban board, we're expanding to include todo lists, Gantt charts, calendars, and more.

## 📦 Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@asakaa/board](./packages/board) | 0.1.0 | AI-native Kanban board component |
| @asakaa/todo | Coming Soon | Advanced todo list component |
| @asakaa/gantt | Coming Soon | Interactive Gantt chart component |
| @asakaa/calendar | Coming Soon | Smart calendar component |

## 🚀 Quick Start

```bash
# Install the Kanban board
npm install @asakaa/board

# Or with yarn
yarn add @asakaa/board

# Or with pnpm
pnpm add @asakaa/board
```

```tsx
import { Board } from '@asakaa/board'
import '@asakaa/board/styles.css'

function App() {
  return <Board initialData={myData} />
}
```

## ✨ Features

- 🎨 **Beautiful UI** - Modern, polished design out of the box
- ⚡ **High Performance** - Virtual scrolling, optimized renders
- 🎯 **TypeScript First** - Full type safety and IntelliSense
- 🧩 **Composable** - Use individual components or the full suite
- 🔌 **Extensible** - Plugin system for custom functionality
- 📱 **Responsive** - Works seamlessly on all devices
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🌙 **Dark Mode** - Built-in theme support

## 🏗️ Project Structure

```
asakaa/
├── packages/
│   ├── board/          # @asakaa/board - Kanban board component
│   ├── todo/           # @asakaa/todo (planned)
│   ├── gantt/          # @asakaa/gantt (planned)
│   └── calendar/       # @asakaa/calendar (planned)
└── apps/
    └── docs/           # Documentation site (planned)
```

## 🛠️ Development

This is a monorepo managed with pnpm workspaces.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build all packages
npm run build

# Start Storybook
npm run storybook
```

## 📚 Documentation

- [Kanban Board Documentation](./packages/board/README.md)
- [API Reference](./packages/board/docs) (Coming Soon)
- [Examples](./packages/board/examples)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines (coming soon).

## 📄 License

Business Source License 1.1 - See [LICENSE](./LICENSE) for details.

## 🗺️ Roadmap

### v0.1.0 (Current)
- ✅ Kanban board component
- ✅ Drag and drop
- ✅ Virtual scrolling
- ✅ Plugin system
- ✅ Advanced filtering

### v0.2.0 (Next)
- 🔄 Todo list component
- 🔄 Enhanced documentation
- 🔄 More examples

### v0.3.0 (Future)
- 📅 Gantt chart component
- 📅 Calendar component
- 📅 Integration APIs

## 💬 Community

- GitHub Issues - Bug reports and feature requests
- Discussions - Questions and community chat

---

Built with ❤️ by the ASAKAA team
