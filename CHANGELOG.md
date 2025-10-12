# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-10-12

### Added - WIP Limits & Bulk Operations (Priority 2 Features)

#### WIP Limits - Complete Workflow Control
- **Soft vs Hard Limits**: Configure columns with 'soft' (warning) or 'hard' (blocking) WIP limits
- **Visual Indicators**: Color-coded badges (green/orange/yellow/red) based on capacity
- **Status Icons**: ✓ (OK), ⚡ (approaching), ⚠️ (warning), ⛔ (exceeded)
- **Drag & Drop Validation**: Hard limits prevent card moves when column is full
- **onWipLimitExceeded Callback**: Notify users when hard limits block operations
- **Capacity Tooltips**: Hover to see percentage and limit type

#### Bulk Operations - Multi-Select & Batch Actions
- **Multi-Select Hook**: `useMultiSelect()` with keyboard shortcuts support
  - **Cmd/Ctrl+Click**: Toggle individual card selection
  - **Shift+Click**: Range selection within same column
  - Regular click: Replace selection
- **Floating Toolbar**: Premium glassmorphism bulk operations toolbar
  - Appears at bottom center when cards are selected
  - Shows selection count
  - Smooth slide-up animation
- **Bulk Actions**:
  - Update priority for multiple cards
  - Assign users to multiple cards
  - Add labels to multiple cards
  - Move cards to different column
  - Delete multiple cards (with confirmation)
- **BulkOperationsCallbacks**: Three callbacks for persistence
  - `onBulkUpdate`: Batch update card properties
  - `onBulkDelete`: Batch delete cards
  - `onBulkMove`: Batch move to target column
- **Visual Feedback**: Selected cards show blue ring highlight

### Technical Improvements
- Extended `Column` interface with `wipLimitType?: 'soft' | 'hard'`
- Added `onWipLimitExceeded` callback to `BoardCallbacks`
- New `SelectionState` interface for multi-select state management
- Selection state atoms in Jotai for optimal performance
- Premium glassmorphism styling for bulk toolbar

### Components Added
1. **useMultiSelect hook** (~170 lines)
   - Full keyboard modifier support
   - Range selection within columns
   - Selection state management
2. **BulkOperationsToolbar** (~220 lines + 145 CSS)
   - Floating bottom toolbar
   - Dropdown menus for actions
   - Responsive design

### Bundle Size
- ESM: ~103.65 KB (was ~98.78 KB) - +4.87 KB
- CJS: ~113.08 KB (was ~107.81 KB) - +5.27 KB
- CSS: ~27.63 KB (was ~22.28 KB) - +5.35 KB
- Total increase: ~15.5 KB uncompressed for WIP Limits + Bulk Operations

### Build Status
- ✅ TypeScript compilation: 0 errors
- ✅ All exports working correctly
- ✅ Tailwind CSS compiled successfully
- ✅ Demo updated with new features

### Demo Enhancements
- Configured columns with mixed soft/hard WIP limits
- Integrated multi-select with Cmd/Ctrl/Shift modifiers
- Added bulk operations toolbar with all actions
- WIP limit exceeded alerts for hard limits

### Breaking Changes
None - fully backward compatible

### Statistics
- **Total new code**: ~600 lines (components + hooks + types)
- **Files created**: 4
- **Commits**: TBD
- **Priority 2 completion**: 50% ✅ (WIP Limits + Bulk Ops done, Custom Fields + Automation pending)

## [0.2.0] - 2025-10-12

### Added - Premium UI Features (Priority 1 Complete)

#### Command Palette (Cmd+K/Ctrl+K)
- Multi-page navigation system (Home, Create Card, Navigate, AI Commands)
- Fuzzy search with `cmdk` library
- Portal rendering with z-index 99999 for proper layering
- Keyboard shortcuts: arrows, enter, escape
- Visual indicators: priority dots, labels, badges
- Premium glassmorphism UI with backdrop blur
- Fully integrated with demo app

#### CardDetailModal - Complete Card Management
- 5 comprehensive tabs: Details, Comments, Activity, Attachments, AI
- **Details Tab**: Full card editing (all fields), delete functionality
- **Comments Tab**: Add/view/delete comments with user avatars
- **Activity Tab**: Full activity feed with emoji icons and ActivityType enum
- **Attachments Tab**: NEW - File upload and management
- **AI Tab**: Suggest assignee, generate subtasks, estimate effort + insights display
- Premium glassmorphism UI (850+ lines)
- New types: Comment, Activity, ActivityType interfaces

#### File Attachments UI
- AttachmentUploader component with drag & drop interface
- File preview with thumbnails for images and file type icons
- Validation: max 10MB per file, max 20 files total
- Configurable file types and size limits
- Upload/delete functionality with confirmation dialogs
- Premium glassmorphism UI with upload states
- File metadata: name, size, type, upload date, uploader
- Activity log support (ATTACHMENT_ADDED/REMOVED)

#### Charts Components - Data Visualization
- **VelocityChart**: Team velocity over time (completed vs planned vs average)
  - Line chart showing sprint/weekly velocity
  - Stats panel with total completed and average velocity
  - Configurable to show planned and average lines
- **BurnDownChart**: Sprint/project burndown tracking
  - Actual vs ideal burndown visualization
  - On-track status indicator (✓ On Track / ⚠ Behind)
  - Progress percentage and remaining tasks
  - Area or line chart modes
- **DistributionCharts**: Pie/Bar charts for analytics
  - Distribution by priority, status, or assignees
  - Interactive tooltips with percentages
  - Customizable colors and chart types
  - Stats showing total cards, categories, largest category
- Premium glassmorphism styling for all charts
- Powered by Recharts library
- Responsive design for all screen sizes

#### AI Features Enhancement
- GeneratePlanModal for AI-powered project planning
- AIUsageDashboard for tracking API usage and costs
- Risk prediction integration
- Assignee suggestion algorithms
- Subtask generation
- Effort estimation
- Full AI insights display in CardDetailModal

### Technical Improvements
- Added `cmdk@^latest` for command palette functionality
- Added `recharts@^3.2.1` for chart visualizations
- Extended ActivityType with ATTACHMENT_ADDED and ATTACHMENT_REMOVED
- New Attachment interface with full metadata
- Card click handling via onCardClick prop
- Full TypeScript support for all new components
- Zero breaking changes - fully backward compatible

### Components Added
1. CommandPalette (500+ lines + 400 CSS)
2. CardDetailModal enhanced (850+ lines + 800 CSS)
3. AttachmentUploader (300+ lines + 350 CSS)
4. VelocityChart (150+ lines)
5. BurnDownChart (170+ lines)
6. DistributionCharts (200+ lines)
7. Charts CSS (200+ lines)

### Bundle Size
- ESM: ~97.61 KB (was ~84 KB) - +13.61 KB
- CJS: ~106.63 KB (was ~91 KB) - +15.63 KB
- CSS: ~22.28 KB (was ~16 KB) - +6.28 KB
- Total increase: ~35 KB uncompressed for all premium features

### Build Status
- ✅ TypeScript compilation: 0 errors
- ✅ All exports working correctly
- ✅ Tailwind CSS compiled successfully
- ✅ Demo running on localhost:3001

### Developer Experience
- Full TypeScript definitions for all new components
- Comprehensive props documentation
- Premium glassmorphism design system throughout
- Responsive design for mobile and desktop
- Accessible keyboard navigation

### Statistics
- **Total new code**: ~4,050 lines
- **Files created**: 24
- **Commits**: 5
- **Priority 1 completion**: 100% ✅

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

[Unreleased]: https://github.com/Yesid8/asakaa/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Yesid8/asakaa/releases/tag/v0.2.0
[0.1.0]: https://github.com/Yesid8/asakaa/releases/tag/v0.1.0
