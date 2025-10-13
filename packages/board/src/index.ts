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

// Hooks
export {
  useKanbanState,
  useBoard,
  useFilters,
  useAI,
  useMultiSelect,
  useKeyboardShortcuts,
  DEFAULT_SHORTCUTS,
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
} from './hooks'

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
