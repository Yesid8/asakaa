/**
 * ASAKAA Board - AI-native Kanban board library
 * @packageDocumentation
 */

// Components
export {
  KanbanBoard,
  Column,
  Card,
  EditableColumnTitle,
  PrioritySelector,
  DateRangePicker,
  UserAssignmentSelector,
  DependenciesSelector,
  ErrorBoundary,
  withErrorBoundary,
  CommandPalette,
  CardDetailModal,
  CardDetailModalV2,
  AttachmentUploader,
  VelocityChart,
  BurnDownChart,
  DistributionCharts,
  BulkOperationsToolbar,
  SwimlaneBoardView,
  GroupBySelector,
  KeyboardShortcutsHelp,
  CardTemplateSelector,
  DEFAULT_TEMPLATES,
  ExportImportModal,
  FilterBar,
  ConfigMenu,
  ThemeModal,
} from './components'

// v0.6.0: Smart Card Stacking
export { CardStack } from './components/CardStack/CardStack'
export type { CardStackProps } from './components/CardStack/CardStack'

// v0.6.0: Card History & Time Travel
export { CardHistoryTimeline, CardHistoryReplay } from './components/CardHistory'
export type { CardHistoryTimelineProps, CardHistoryReplayProps } from './components/CardHistory'

// v0.6.0: Card Relationships Graph
export { CardRelationshipsGraph } from './components/CardRelationships'
export type { CardRelationshipsGraphProps } from './components/CardRelationships'

export type {
  ColumnProps,
  CardProps,
  EditableColumnTitleProps,
  PrioritySelectorProps,
  DateRangePickerProps,
  UserAssignmentSelectorProps,
  DependenciesSelectorProps,
  ErrorBoundaryProps,
  CommandPaletteProps,
  CardDetailModalProps,
  CardDetailModalV2Props,
  AttachmentUploaderProps,
  VelocityChartProps,
  VelocityDataPoint,
  BurnDownChartProps,
  BurnDownDataPoint,
  DistributionChartsProps,
  DistributionDataPoint,
  BulkOperationsToolbarProps,
  SwimlaneBoardViewProps,
  GroupBySelectorProps,
  KeyboardShortcutsHelpProps,
  CardTemplateSelectorProps,
  ExportImportModalProps,
  FilterBarProps,
  ConfigMenuProps,
  ThemeModalProps,
} from './components'

// AI Components
export { GeneratePlanModal, AIUsageDashboard } from './components/AI'
export type { GeneratePlanModalProps, AIUsageDashboardProps } from './components/AI'

// Hooks (Jotai-based - legacy, will be deprecated in v0.8.0)
export {
  useKanbanState,
  useBoard,
  useFilters,
  useAI,
  useMultiSelect,
  useKeyboardShortcuts,
  DEFAULT_SHORTCUTS,
  useCardStacking,
} from './hooks'
export type {
  UseKanbanStateOptions,
  UseKanbanStateReturn,
  UseBoardOptions,
  UseBoardReturn,
  UseFiltersOptions,
  UseFiltersReturn,
  FilterState,
  SortState,
  DateFilter,
  SortBy,
  SortOrder,
  UseAIOptions,
  UseAIReturn,
  UseMultiSelectReturn,
  UseKeyboardShortcutsOptions,
  UseKeyboardShortcutsReturn,
  UseCardStackingOptions,
  UseCardStackingResult,
} from './hooks'

// React Adapters (@asakaa/core integration - v0.7.0)
export { BoardProvider, useBoardStore } from './adapters/react'
export type { BoardProviderProps } from './adapters/react'

// Export with alias to avoid conflict with legacy useBoard hook
export { useBoard as useBoardCore } from './adapters/react'
export type { UseBoardReturn as UseBoardCoreReturn } from './adapters/react'

export { useFilteredCards, useSortedCards } from './adapters/react'
export type { CardFilters } from './adapters/react'

// Types
export type {
  Board,
  Column as ColumnType,
  Card as CardType,
  Priority,
  CardStatus,
  BoardCallbacks,
  AICallbacks,
  Insight,
  InsightType,
  InsightSeverity,
  AssigneeSuggestion,
  GeneratedPlan,
  BoardConfig,
  RenderProps,
  KanbanBoardProps,
  DragData,
  DropData,
  CardFilter,
  CardSort,
  CardSortKey,
  User,
  Comment,
  Activity,
  ActivityType,
  Attachment,
  GroupByOption,
  SwimlaneConfig,
  Swimlane,
  KeyboardAction,
  KeyboardShortcut,
  CardTemplate,
  ExportFormat,
  ExportOptions,
  ImportResult,
  CardStack as CardStackType,
  StackingStrategy,
  StackingConfig,
  StackSuggestion,
} from './types'

// Utilities
export {
  cn,
  calculatePosition,
  generateInitialPositions,
  retryWithBackoff,
  retrySyncOperation,
  createRetryWrapper,
  CircuitBreaker,
} from './utils'
export type { RetryOptions, RetryResult } from './utils'

// AI Utilities
export { aiUsageTracker, formatCost } from './lib/ai/costs'
export type {
  AIOperation,
  UsageStats,
} from './lib/ai/costs'
export { AI_MODELS, AI_FEATURES, RATE_LIMITS } from './lib/ai/config'
export type { AIModelKey } from './lib/ai/config'

// State (advanced usage)
export {
  boardAtom,
  cardAtomFamily,
  columnAtomFamily,
  dragStateAtom,
} from './state/atoms'

// Plugins
export { PluginManager, pluginManager } from './plugins'
export type { Plugin, PluginContext, PluginHooks, IPluginManager } from './plugins'

// Theme System (v0.5.0)
export { ThemeProvider, useTheme, ThemeSwitcher, themes, darkTheme, lightTheme, neutralTheme, defaultTheme } from './theme'
export type { ThemeName, Theme, ThemeColors, ThemeContextValue } from './theme'

// Re-export @asakaa/core (v0.7.0 - framework-agnostic models and store)
export {
  Card as CardModel,
  Column as ColumnModel,
  Board as BoardModel,
  BoardStore,
  Store,
} from '@asakaa/core'

export type {
  CardData,
  ColumnData,
  BoardData,
  UserData,
  BaseEntity,
  BoardState,
  StoreEvent,
} from '@asakaa/core'

// Note: Priority type already exported from ./types above
