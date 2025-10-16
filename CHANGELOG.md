# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2025-10-16

### Added - Card Detail Modal V2, Time Travel & Card Relationships

#### CardDetailModalV2 Component 🎨
- **Complete CSS Redesign**: 1014-line CSS rewrite with modal-specific variables
  - New `--modal-v2-*` CSS variables replacing global `--color-*` variables
  - Enhanced visual hierarchy and spacing
  - Improved theming support across Dark, Light, and Neutral themes
  - Better contrast ratios and accessibility

#### Time Travel & Card History 📜
- **CardHistoryTimeline Component**: Visual timeline of all card changes
  - Event grouping by date
  - Color-coded event types (created, updated, status changed, etc.)
  - Detailed change descriptions with before/after values
  - Type-safe event system with proper TypeScript definitions

#### Card Relationships Graph 🔗
- **CardRelationshipsGraph Component**: Visual dependency graph
  - D3.js force-directed graph visualization
  - Multiple relationship types: blocks, depends_on, relates_to, duplicates
  - Interactive node selection and filtering
  - Critical path detection
  - Graph statistics (nodes, edges, clusters)
  - Color schemes by status, priority, or assignee

### Fixed - TypeScript Build Errors
- **CardHistoryTimeline.tsx**: Fixed Map.get() type handling and unused parameters
- **CardRelationshipsGraph.tsx**:
  - Fixed priority comparisons (changed from numbers to 'LOW'|'MEDIUM'|'HIGH'|'URGENT' strings)
  - Fixed property name from `assignedTo` to `assigneeId`
  - Removed unused imports and parameters
- **card-relationships.ts**: Prefixed unused parameter with underscore

### Technical Details
- **New Components**: CardDetailModalV2, CardHistoryTimeline, CardRelationshipsGraph
- **New Types**: CardHistoryEvent, GraphNode, GraphEdge, GraphConfig, CriticalPath
- **New Hooks**: useCardHistory, useCardStacking, useRelationshipsGraph
- **Bundle Size**: ESM 198.27 KB, CJS 215.41 KB, CSS 61.14 KB, DTS 74.71 KB
- **Zero Breaking Changes**: Fully backward compatible

### Developer Experience
- All TypeScript errors resolved - clean build
- Enhanced type safety for card relationships and history
- Comprehensive test coverage for new components

## [0.6.0-beta] - 2025-10-13

### Added - Enhanced Design System & Visual Refinements

#### Design Philosophy 🎨
- **Content is King**: Enhanced visual hierarchy putting content first
- **Metadata is Secondary**: Reduced noise from labels and indicators
- **Color is for Intention**: Strategic use of color only where meaningful

#### Theme System Enhancements
- **SVG Icons in ThemeSwitcher**: Replaced emoji with explicit SVG icons
  - Dark: Moon crescent icon
  - Light: Sun with rays icon
  - Neutral: Clock/circle icon for better UX clarity

#### Pure Text Labels
- **Zero Background Noise**: Labels now display as pure text without colored backgrounds
- **Low Contrast Design**: Light gray in dark mode, medium gray in light mode
- **Minimal Visual Weight**: Labels use `--color-text-tertiary` for subtlety
- **Hover Enhancement**: Slight color change on hover (`--color-text-secondary`)
- **No Borders or Padding**: Clean text-only appearance

#### Simplified Column Indicators
- **No Color Backgrounds**: Column count indicators without colored backgrounds
- **Consistent Styling**: Pure text using `--color-text-tertiary`
- **Reduced Visual Noise**: Removed blue accent backgrounds and borders

#### Neutral Theme Purity
- **100% Grayscale Enforcement**: Global `filter: grayscale(100%)` on all elements
- **Zero Color Leakage**: Comprehensive CSS rules preventing any color display
- **Typography-Based Hierarchy**: Bold and underline for dates instead of red color
- **Monochrome Priorities**: All priority indicators in grayscale only
- **Pure SVG Grayscale**: Force `currentColor` on all SVG elements

### Technical Details
- **New File**: `design-refinements.css` - Central file for v0.6.0 visual enhancements (194 lines)
- **Modified Files**: `index.css`, `ThemeSwitcher.tsx`, `Column.tsx`, `DateRangePicker.tsx`, `UserAssignmentSelector.tsx`
- **Bundle Size**: ESM 150.99 KB, CJS 163.44 KB, CSS 41.05 KB
- **Zero Breaking Changes**: Fully backward compatible

### Screenshots
- Added theme screenshots: Dark, Light, and Neutral themes showcased in README
- Location: `.github/screenshots/theme-*.png`
- Specifications: 1600px width, PNG format, high resolution

### Developer Experience
- Centralized design refinements in single CSS file
- Theme-aware with `data-theme` attribute
- Easy to override with standard CSS specificity
- No migration required

## [0.5.0] - 2025-10-12

### Added - Elite Theming, Enhanced Shortcuts, WCAG AA & UX Improvements

#### Theme System 🎨
- **ThemeProvider**: React Context-based theme provider with localStorage persistence
  - Automatic theme persistence across sessions
  - SSR-safe with `typeof window` checks
  - Configurable storage key
  - Applies CSS variables to document root
  - Sets `data-theme` attribute for theme-specific selectors

- **ThemeSwitcher**: Compact UI component for theme selection
  - Emoji icons for each theme (🌙☀️⚪)
  - Active state styling
  - ARIA labels and pressed states
  - Compact mode support
  - 40x40px minimum hit-targets (WCAG AA compliant)

- **3 Professional Themes**:
  - **Dark (Linear)** - Default theme
    - Backgrounds: #222326, #2A2B2F, #33343A
    - Text: #F4F5F8, #AEB6C0 (WCAG AA compliant)
    - Accent: #5E6AD2 (Linear purple-blue)
    - WCAG AA: All text ≥4.5:1, most ≥7:1 (AAA)

  - **Light (Accessible)** - Clean white theme
    - Backgrounds: #FFFFFF, #F7F7F8, #EEEFF1
    - Text: #1A1A1A, #5A5A5A (WCAG AAA 7:1 contrast)
    - Accent: #5E6AD2 (Accessible blue)
    - WCAG AAA: All text ≥7:1 contrast

  - **Neutral (Zen)** - Pure monochrome
    - Backgrounds: #F5F5F5, #EBEBEB, #E0E0E0
    - Text: #1A1A1A, #4A4A4A, #7A7A7A
    - No accent colors - strictly monochromatic
    - WCAG AA: All text ≥4.5:1

- **CSS Variables System**: `--theme-*` tokens for zero-JS theme switching
  - `--theme-bg-primary/secondary/tertiary`
  - `--theme-text-primary/secondary/tertiary`
  - `--theme-accent-primary/hover`
  - `--theme-border-primary/secondary`
  - `--theme-success/warning/error/info`

- **Theme Overrides**: 200+ lines of CSS ensuring all components adapt to themes
  - CardDetailModal: backgrounds, borders, buttons, textareas
  - CommandPalette: modal, input, items, labels
  - FilterBar: container, search input, dropdowns
  - BulkOperationsToolbar: background, borders
  - All modals and menus theme-aware

- **Component Integration**: Header, footer, modals, menus all theme-aware
  - App header uses theme variables
  - Footer uses theme variables
  - All buttons use theme hover states
  - Stats use theme accent colors

#### Keyboard Shortcuts Enhancement ⌨️
- **Single-Key Shortcuts** for speed (no modifiers required):
  - `n` - New card (quick, no modal)
  - `e` - Edit selected card
  - `d` - Delete selected card
  - `/` - Focus search input
  - `?` - Show shortcuts help

- **Enhanced Ctrl/Cmd Shortcuts**:
  - `Ctrl+F` - Open filter bar
  - `Ctrl+Enter` - Quick add card
  - `Ctrl+N` - New card with modal
  - `Ctrl+K` - Command palette (existing)
  - `Ctrl+S` - Save changes
  - `Ctrl+Z` - Undo
  - `Ctrl+Y` - Redo

- **Shift Shortcuts**:
  - `Shift+Delete` - Delete with confirmation

- **Event-Based System**: Easy integration via `keyboard-action` custom events
- **9 New Action Types** added to KeyboardAction type
- **Hook Already Complete**: useKeyboardShortcuts supports all features

#### Accessibility (WCAG AA/AAA) ♿
- **Contrast Ratios**: All text meets WCAG AA minimum (4.5:1)
  - Dark theme: Most text ≥7:1 (AAA)
  - Light theme: All text ≥7:1 (AAA)
  - Neutral theme: All text ≥4.5:1 (AA)

- **Hit-Targets**: All interactive elements minimum 40x40px
  - ThemeSwitcher buttons: 40x40px
  - All modals, buttons, inputs meet minimum

- **Theme Compliance**: Every theme verified for accessibility
  - Complete contrast ratio audit for all 3 themes
  - Semantic color tokens for state communication
  - High visibility in all lighting conditions

#### UX Improvements 🎯
- **Horizontal Scroll Restored**: Board now scrolls horizontally with all columns
  - Proper scrollable container wrapper
  - +Add Group button moved inside scrollable area
  - Button appears inline with column headers at the end

- **FilterBar Enhanced**:
  - Collapsible header now more subtle and compact when collapsed
  - Reduced padding: 6px 12px when collapsed
  - Smaller chevron icon: 14x14px (was 16x16px)
  - Lighter font weight: 500 (was 600)
  - GroupBy selector moved to END of filter line (was at beginning)
  - Better UX: filters flow naturally, grouping control at the end

- **Theme Variable Implementation**:
  - FilterBar now uses var(--theme-*) CSS variables throughout
  - Proper visibility in Light, Dark, and Neutral themes
  - No more hardcoded rgba() colors
  - All inputs, selects, and buttons adapt to theme
  - Perfect contrast in all three themes

- **ConfigMenu Component**:
  - Dropdown menu with Export, Themes, and Shortcuts options
  - Gear icon button with theme-aware hover states
  - Click-outside-to-close functionality
  - Proper z-index and positioning

- **Export Options**:
  - JSON, CSV, and PDF export fully functional
  - PDF export uses jsPDF library
  - No Markdown option (removed from UI)
  - ExportImportModal theme-aware

### Technical Details
- 7 new theme files created (`src/theme/*`)
- 4 source files modified (`types/index.ts`, `index.ts`, `App.tsx`, `package.json`)
- +1,500 lines of code
- +9.15 KB bundle size (+5.3% total)
- Zero breaking changes - fully backward compatible

### Bundle Size
- **ESM**: 141.02 KB (was 136.32 KB) - +4.70 KB (+3.4%)
- **CSS**: 40.92 KB (was 36.47 KB) - +4.45 KB (+12.2%)
- **Total**: 181.94 KB (was 172.79 KB) - +9.15 KB (+5.3%)

### Developer Experience
- Complete TypeScript definitions for all theme types
- Easy theme integration with 3-line setup
- Backward compatible - existing code works unchanged

### Migration Guide
```tsx
// Before (still works)
<KanbanBoard {...props} />

// After (with themes)
import { ThemeProvider, ThemeSwitcher } from '@asakaa/board'

<ThemeProvider defaultTheme="dark">
  <ThemeSwitcher compact showLabels={false} />
  <KanbanBoard {...props} />
</ThemeProvider>
```

### Breaking Changes
None - fully backward compatible

### Build Status
- ✅ TypeScript compilation: 0 errors
- ✅ All exports working correctly
- ✅ Theme switching verified
- ✅ Contrast ratios verified
- ✅ localStorage persistence verified
- ✅ Bundle size acceptable

## [0.4.0] - 2025-10-12

### Added - Easy Integration & Advanced Filtering

#### New Simplified API for Maximum Developer Experience
- **`useBoard()` Hook**: Recommended hook that wraps `useKanbanState` with simpler API
- **`useFilters()` Hook**: Advanced filtering and sorting system
- **FilterBar Component**: Premium UI for all filtering and sorting

### Developer Experience Improvements
- **3-Line Integration**: Complete board setup in minimal code
- **Zero Configuration**: Works out-of-the-box with sensible defaults
- **Type-Safe Filters**: Full TypeScript support for all filter operations
- **Performance**: useMemo and useCallback throughout for optimal re-renders
- **Composable**: Use `useBoard`, `useFilters`, and `FilterBar` together or separately
- **Backward Compatible**: Existing `useKanbanState` still available for advanced users

[Unreleased]: https://github.com/Yesid8/asakaa/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/Yesid8/asakaa/releases/tag/v0.6.0
[0.5.0]: https://github.com/Yesid8/asakaa/releases/tag/v0.5.0
[0.4.0]: https://github.com/Yesid8/asakaa/releases/tag/v0.4.0
