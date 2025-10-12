# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-11

### Added
- Initial release of `@asakaa/board` library
- Core Kanban board component with drag & drop functionality
- Atomic state management with Jotai
- Automatic virtualization for large lists (TanStack Virtual)
- TypeScript-first API with complete type definitions
- `useKanbanState` hook for local state management
- `useAI` hook for optional AI features (placeholder)
- Tailwind CSS styling with dark theme
- Storybook documentation with 7 interactive examples
- Performance optimizations (memoization, atomic updates)
- Comprehensive test suite (26 tests)
- CI/CD with GitHub Actions
- API documentation with TypeDoc
- Business Source License 1.1

### Features
- ✅ Drag & drop cards between columns
- ✅ Virtualization for 10,000+ cards
- ✅ WIP limits support
- ✅ Priority badges (LOW, MEDIUM, HIGH, URGENT)
- ✅ Labels and metadata
- ✅ Custom render props
- ✅ Backend-agnostic design
- ✅ Bundle size: 15KB (uncompressed)

### Developer Experience
- ✅ TypeScript strict mode (0 errors)
- ✅ ESLint + Prettier
- ✅ Vitest for testing
- ✅ Storybook for documentation
- ✅ Hot module replacement
- ✅ Source maps

[Unreleased]: https://github.com/[username]/asakaa/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/[username]/asakaa/releases/tag/v0.1.0
