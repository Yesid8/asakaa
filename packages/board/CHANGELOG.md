# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2025-01-26

### Added

#### Gantt Chart - Critical Improvements
- **Circular Dependency Detection**: Prevents creation of circular task dependencies using DFS algorithm
  - Visual feedback with alert modal when circular dependency is detected
  - Protects workflow integrity and prevents logical deadlocks
- **Date Validation System**: Comprehensive validation for task date ranges
  - Prevents invalid states where start date > end date
  - Enforces minimum task duration of 1 day
  - Silent validation with console warnings for better UX
- **Undo/Redo System**: Complete history management for all task operations
  - Support for up to 50 levels of undo/redo
  - Keyboard shortcuts: `Ctrl+Z` (undo), `Ctrl+Y` (redo) on Windows/Linux
  - Keyboard shortcuts: `Cmd+Z` (undo), `Cmd+Shift+Z` (redo) on macOS
  - Functional update support for state management
  - Covers all operations: create, delete, edit, move, indent, outdent, duplicate tasks

#### Gantt Chart - Visual Enhancements
- **Hierarchical Icon System**: Differentiated icons based on task level
  - Level 0 (Projects): Thick circle icon (2px stroke)
  - Level 1 (Tasks): Regular circle icon (1.5px stroke)
  - Level 2+ (Subtasks): Small filled dot (2.5px radius)
  - Milestones: Diamond icon with accent color
- **Enhanced Typography Hierarchy**: Improved visual hierarchy in task list
  - Level 0: 14px, Semi-Bold (600), 100% opacity
  - Level 1: 13px, Medium (500), 95% opacity
  - Level 2+: 12px, Regular (400), 88% opacity
- **Improved Tooltip System**: Fixed tooltip persistence issues
  - Tooltips properly hide when dragging operations start
  - AnimatePresence for smooth exit animations
  - No tooltip accumulation during link creation

#### Gantt Chart - User Experience
- **Horizontal Scrolling**: Fixed horizontal scroll to view future dates beyond viewport
- **Today Indicator**: Red vertical line marking current date in timeline
- **Progress Visualization**: Inline progress bars with percentage display
- **Milestone Differentiation**: Milestones render as diamonds in timeline (not bars)
- **Default Week View**: Timeline defaults to week view for optimal balance
- **Dependency Lines**: Curved dependency lines showing task flow

### Fixed
- Tooltip "Link" text no longer persists when creating task dependencies
- Horizontal scroll now works correctly for extended timelines
- Task date validation prevents invalid date ranges

### Changed
- Default column visibility: Only "Task Name" visible by default
- Other columns accessible via "+" button in column manager
- Typography refinement for better visual hierarchy

### Technical
- New hooks: `useUndoRedo`, `useGanttUndoRedoKeys`
- Enhanced `TaskBar` component with date validation
- Improved `GanttBoard` with circular dependency detection
- Better type safety with functional update support

---

## [0.7.0] - Previous Release

### Added
- Gantt chart component with timeline visualization
- Task hierarchy with subtasks
- Drag and drop for task scheduling
- Dependency management
- Multiple view modes (Day, Week, Month)
- Theme support (Light, Dark, High Contrast)
- Column management
- Keyboard shortcuts for task operations

[0.8.0]: https://github.com/asakaa/board/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/asakaa/board/releases/tag/v0.7.0
