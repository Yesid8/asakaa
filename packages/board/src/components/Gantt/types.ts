export interface Task {
  id: string;
  name: string;
  startDate?: Date; // Optional - tasks without dates can be created by clicking on timeline
  endDate?: Date;   // Optional - tasks without dates can be created by clicking on timeline
  progress: number;
  assignees?: Array<{ name: string; avatar?: string; initials: string; color: string }>;
  status?: 'todo' | 'in-progress' | 'completed';
  dependencies?: string[];
  subtasks?: Task[];
  isExpanded?: boolean;
  isMilestone?: boolean;
  isCriticalPath?: boolean;

  // Hierarchy properties
  parentId?: string;  // ID of parent task (undefined for root-level tasks)
  level?: number;     // Indentation level (0 for root, 1 for first level children, etc.)
  position?: number;  // Position within its level/parent
}

export type TimeScale = 'day' | 'week' | 'month';
export type Theme = 'dark' | 'light' | 'neutral';
export type RowDensity = 'compact' | 'comfortable' | 'spacious';

export type ColumnType = 'name' | 'startDate' | 'endDate' | 'duration' | 'assignees' | 'status' | 'progress';

export interface GanttColumn {
  id: ColumnType;
  label: string;
  width: number;
  visible: boolean;
  sortable?: boolean;
}

export interface Assignee {
  name: string;
  initials: string;
  color: string;
}

export interface GanttTheme {
  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgGrid: string;
  bgWeekend: string;
  
  // Borders
  border: string;
  borderLight: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Accent & Interactive
  accent: string;
  accentHover: string;
  accentLight: string;
  
  // Task Elements
  taskBarPrimary: string;
  taskBarProgress: string;
  taskBarHandle: string;
  
  // Dependencies & Critical Path
  dependency: string;
  dependencyHover: string;
  criticalPath: string;
  criticalPathLight: string;
  
  // Special Elements
  today: string;
  todayLight: string;
  milestone: string;
  milestoneLight: string;
  
  // Status Colors
  statusTodo: string;
  statusInProgress: string;
  statusCompleted: string;
  
  // Hover & Focus States
  hoverBg: string;
  focusRing: string;
}

export interface GanttConfig {
  theme?: Theme;
  timeScale?: TimeScale;
  rowDensity?: RowDensity; // Row height density (default: 'comfortable')
  showThemeSelector?: boolean; // Show theme selector in toolbar (default: true)
  availableUsers?: Array<{ id: string; name: string; initials: string; color: string }>; // Available users for assignment
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDateChange?: (task: Task, startDate: Date, endDate: Date) => void;
  onDependencyCreate?: (fromTaskId: string, toTaskId: string) => void;
  onDependencyDelete?: (taskId: string, dependencyId: string) => void;

  // Hierarchy callbacks
  onTaskCreate?: (parentId: string | undefined, position: number) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskDuplicate?: (taskId: string) => void;
  onTaskMove?: (taskId: string, direction: 'up' | 'down') => void;
  onTaskIndent?: (taskId: string) => void;
  onTaskOutdent?: (taskId: string) => void;
  onTaskRename?: (taskId: string, newName: string) => void;
  onTaskToggleExpand?: (taskId: string) => void;
}