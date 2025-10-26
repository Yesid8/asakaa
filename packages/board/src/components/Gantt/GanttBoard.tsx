import { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { Task, TimeScale, Theme, GanttConfig, GanttColumn, ColumnType, GanttTheme, RowDensity } from './types';
import { themes } from './themes';
import { GanttToolbar } from './GanttToolbar';
import { TaskGrid } from './TaskGrid';
import { Timeline } from './Timeline';
import { motion } from 'framer-motion';
import { useUndoRedo } from './useUndoRedo';
import { useGanttUndoRedoKeys } from './useGanttUndoRedoKeys';
import {
  indentTasks,
  outdentTasks,
  moveTasks,
  deleteTasks,
  duplicateTasks,
  createTask,
  renameTask,
  toggleTaskExpansion,
  createSubtask,
} from './hierarchyUtils';

interface GanttBoardProps {
  tasks: Task[];
  config?: GanttConfig;
}

// Utility function to get row height based on density
const getRowHeight = (density: RowDensity): number => {
  switch (density) {
    case 'compact':
      return 40;
    case 'comfortable':
      return 48;
    case 'spacious':
      return 56;
    default:
      return 48;
  }
};

export const GanttBoard = memo<GanttBoardProps>(function GanttBoard({ tasks, config = {} }) {
  const {
    theme: initialTheme = 'dark',
    timeScale: initialTimeScale = 'week',
    rowDensity: initialRowDensity = 'comfortable',
    showThemeSelector = true,
    availableUsers = [],
    onTaskClick,
    onTaskUpdate,
    onDependencyCreate,
    onDependencyDelete,
  } = config;

  const [currentTheme, setCurrentTheme] = useState<Theme>(initialTheme);
  const [timeScale, setTimeScale] = useState<TimeScale>(initialTimeScale);
  const [rowDensity, setRowDensity] = useState<RowDensity>(initialRowDensity);
  const [zoom, setZoom] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [gridWidthOverride, setGridWidthOverride] = useState<number | null>(null);

  // Use undo/redo hook for task management
  const {
    state: localTasks,
    setState: setLocalTasks,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<Task[]>(tasks, 50);

  // Column configuration - Default: Only show task name
  const [columns, setColumns] = useState<GanttColumn[]>([
    { id: 'name', label: 'Task Name', width: 240, visible: true, sortable: true },
    { id: 'startDate', label: 'Start Date', width: 110, visible: false, sortable: true },
    { id: 'endDate', label: 'End Date', width: 110, visible: false, sortable: true },
    { id: 'duration', label: 'Duration', width: 80, visible: false, sortable: true },
    { id: 'assignees', label: 'Assignees', width: 120, visible: false, sortable: false },
    { id: 'status', label: 'Status', width: 80, visible: false, sortable: true },
    { id: 'progress', label: '% Complete', width: 120, visible: false, sortable: true },
  ]);

  // Calculate grid width based on visible columns (memoized)
  const calculatedGridWidth = useMemo(() =>
    columns
      .filter(col => col.visible)
      .reduce((sum, col) => sum + col.width, 0) + 60, // +60 for add button and padding
    [columns]
  );

  const gridWidth = gridWidthOverride || calculatedGridWidth;

  const gridScrollRef = useRef<HTMLDivElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  const theme = (themes[currentTheme] ?? themes.dark) as GanttTheme;

  // Calculate row height based on density
  const rowHeight = getRowHeight(rowDensity);

  // Enable undo/redo keyboard shortcuts
  useGanttUndoRedoKeys({
    undo,
    redo,
    canUndo,
    canRedo,
    enabled: true,
  });

  // Handle column toggle (memoized)
  const handleToggleColumn = useCallback((columnId: ColumnType) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  // Handle task toggle (memoized)
  const handleTaskToggle = useCallback((taskId: string) => {
    setLocalTasks((prev) => toggleTaskExpansion(prev, taskId));
    config.onTaskToggleExpand?.(taskId);
  }, [config]);

  // Handle task updates from context menu (memoized)
  const handleTaskUpdate = useCallback((taskId: string, updates: Partial<Task>) => {
    const updateTask = (tasks: Task[]): Task[] => {
      return tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, ...updates };
        }
        if (task.subtasks) {
          return { ...task, subtasks: updateTask(task.subtasks) };
        }
        return task;
      });
    };
    setLocalTasks(updateTask(localTasks));
    onTaskUpdate?.(localTasks.find(t => t.id === taskId)!);
  }, [localTasks, onTaskUpdate]);

  // Handle task deletion (memoized)
  const handleTaskDelete = useCallback((taskId: string) => {
    const deleteTask = (tasks: Task[]): Task[] => {
      return tasks.filter(task => {
        if (task.id === taskId) return false;
        if (task.subtasks) {
          task.subtasks = deleteTask(task.subtasks);
        }
        return true;
      });
    };
    setLocalTasks(deleteTask(localTasks));
  }, [localTasks]);

  // Hierarchy handlers
  const handleTaskIndent = useCallback((taskIds: string[]) => {
    if (taskIds.length === 0) return;
    setLocalTasks((prev) => indentTasks(prev, taskIds));
    config.onTaskIndent?.(taskIds[0]!);
  }, [config]);

  const handleTaskOutdent = useCallback((taskIds: string[]) => {
    if (taskIds.length === 0) return;
    setLocalTasks((prev) => outdentTasks(prev, taskIds));
    config.onTaskOutdent?.(taskIds[0]!);
  }, [config]);

  const handleTaskMove = useCallback((taskIds: string[], direction: 'up' | 'down') => {
    if (taskIds.length === 0) return;
    setLocalTasks((prev) => moveTasks(prev, taskIds, direction));
    config.onTaskMove?.(taskIds[0]!, direction);
  }, [config]);

  const handleMultiTaskDelete = useCallback((taskIds: string[]) => {
    setLocalTasks((prev) => deleteTasks(prev, taskIds));
    taskIds.forEach(id => config.onTaskDelete?.(id));
  }, [config]);

  const handleTaskDuplicate = useCallback((taskIds: string[]) => {
    setLocalTasks((prev) => duplicateTasks(prev, taskIds));
    taskIds.forEach(id => config.onTaskDuplicate?.(id));
  }, [config]);

  const handleTaskCreate = useCallback((afterTaskId: string, direction: 'above' | 'below') => {
    setLocalTasks((prev) => {
      const { tasks, newTask } = createTask(prev, afterTaskId, direction);
      config.onTaskCreate?.(newTask.parentId, newTask.position || 0);
      return tasks;
    });
  }, [config]);

  const handleTaskRename = useCallback((taskId: string, newName: string) => {
    setLocalTasks((prev) => renameTask(prev, taskId, newName));
    config.onTaskRename?.(taskId, newName);
  }, [config]);

  const handleCreateSubtask = useCallback((parentTaskId: string) => {
    setLocalTasks((prev) => {
      const { tasks } = createSubtask(prev, parentTaskId);
      config.onTaskCreate?.(parentTaskId, 0);
      return tasks;
    });
  }, [config]);

  // Handle task date changes (from drag & drop) (memoized)
  const handleTaskDateChange = useCallback((task: Task, newStart: Date, newEnd: Date) => {
    const updateTaskDates = (tasks: Task[]): Task[] => {
      return tasks.map((t) => {
        if (t.id === task.id) {
          return { ...t, startDate: newStart, endDate: newEnd };
        }
        if (t.subtasks) {
          return { ...t, subtasks: updateTaskDates(t.subtasks) };
        }
        return t;
      });
    };
    setLocalTasks(updateTaskDates(localTasks));
    onTaskUpdate?.({ ...task, startDate: newStart, endDate: newEnd });
  }, [localTasks, onTaskUpdate]);

  // Helper function to detect circular dependencies using DFS
  const wouldCreateCircularDependency = useCallback((fromTaskId: string, toTaskId: string, tasks: Task[]): boolean => {
    // Build dependency map
    const dependencyMap = new Map<string, string[]>();

    const buildMap = (taskList: Task[]) => {
      taskList.forEach(task => {
        if (task.dependencies) {
          dependencyMap.set(task.id, task.dependencies);
        }
        if (task.subtasks) {
          buildMap(task.subtasks);
        }
      });
    };

    buildMap(tasks);

    // Simulate adding the new dependency
    const existingDeps = dependencyMap.get(toTaskId) || [];
    dependencyMap.set(toTaskId, [...existingDeps, fromTaskId]);

    // DFS to detect cycle
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      if (!visited.has(taskId)) {
        visited.add(taskId);
        recStack.add(taskId);

        const deps = dependencyMap.get(taskId) || [];
        for (const depId of deps) {
          if (!visited.has(depId) && hasCycle(depId)) {
            return true;
          } else if (recStack.has(depId)) {
            return true;
          }
        }
      }
      recStack.delete(taskId);
      return false;
    };

    return hasCycle(toTaskId);
  }, []);

  // Handle dependency creation (memoized)
  const handleDependencyCreate = useCallback((fromTask: Task, toTaskId: string) => {
    // Check for circular dependency
    if (wouldCreateCircularDependency(fromTask.id, toTaskId, localTasks)) {
      // Show error feedback - you could integrate a toast notification here
      console.warn('Cannot create dependency: would create a circular dependency');
      alert('Cannot create this dependency: it would create a circular dependency chain.\n\nTask dependencies must flow in one direction only.');
      return;
    }

    const updateTaskDependencies = (tasks: Task[]): Task[] => {
      return tasks.map((t) => {
        if (t.id === toTaskId) {
          const dependencies = t.dependencies || [];
          // Avoid duplicate dependencies
          if (!dependencies.includes(fromTask.id)) {
            return { ...t, dependencies: [...dependencies, fromTask.id] };
          }
        }
        if (t.subtasks) {
          return { ...t, subtasks: updateTaskDependencies(t.subtasks) };
        }
        return t;
      });
    };
    setLocalTasks(updateTaskDependencies(localTasks));
    onDependencyCreate?.(fromTask.id, toTaskId);
  }, [localTasks, onDependencyCreate, wouldCreateCircularDependency]);

  // Handle dependency deletion (memoized)
  const handleDependencyDelete = useCallback((taskId: string, dependencyId: string) => {
    const removeTaskDependency = (tasks: Task[]): Task[] => {
      return tasks.map((t) => {
        if (t.id === taskId && t.dependencies) {
          const dependencies = t.dependencies.filter((depId) => depId !== dependencyId);
          return { ...t, dependencies };
        }
        if (t.subtasks) {
          return { ...t, subtasks: removeTaskDependency(t.subtasks) };
        }
        return t;
      });
    };
    setLocalTasks(removeTaskDependency(localTasks));
    onDependencyDelete?.(taskId, dependencyId);
  }, [localTasks, onDependencyDelete]);

  // Calculate date range (memoized)
  const { startDate, endDate } = useMemo(() => {
    // Filter tasks that have dates
    const tasksWithDates = localTasks.filter(t => t.startDate && t.endDate);

    if (tasksWithDates.length === 0) {
      // Default range if no tasks have dates
      const today = new Date();
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      const end = new Date(today);
      end.setDate(end.getDate() + 60);
      return { startDate: start, endDate: end };
    }

    const allDates = tasksWithDates.flatMap((t) => [t.startDate, t.endDate]).filter((d): d is Date => d !== undefined);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

    const padding = timeScale === 'day' ? 7 : timeScale === 'week' ? 14 : 30;
    minDate.setDate(minDate.getDate() - padding);
    maxDate.setDate(maxDate.getDate() + padding);

    return { startDate: minDate, endDate: maxDate };
  }, [localTasks, timeScale]);

  // Handlers (future implementation - currently unused but kept for future features)
  // TODO: Implement zoom controls in toolbar
  // const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  // const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));

  // TODO: Implement "Today" button in toolbar
  // const handleTodayClick = () => {
  //   if (timelineScrollRef.current) {
  //     const today = new Date();
  //     const dayWidth = timeScale === 'day' ? 60 : timeScale === 'week' ? 20 : 8;
  //     const daysFromStart = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  //     const scrollX = daysFromStart * dayWidth * zoom - 300;
  //     timelineScrollRef.current.scrollTo({ left: Math.max(0, scrollX), behavior: 'smooth' });
  //   }
  // };

  // TODO: Implement add task functionality
  // const handleAddTask = () => {
  //   // Placeholder - implement in parent component if needed
  // };

  // Handle separator resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Synchronized scrolling and resizing
  useEffect(() => {
    const gridScroll = gridScrollRef.current;
    const timelineScroll = timelineScrollRef.current;

    if (!gridScroll || !timelineScroll) return;

    const handleGridScroll = () => {
      if (timelineScroll.scrollTop !== gridScroll.scrollTop) {
        timelineScroll.scrollTop = gridScroll.scrollTop;
      }
      setScrollTop(gridScroll.scrollTop);
    };

    const handleTimelineScroll = () => {
      if (gridScroll.scrollTop !== timelineScroll.scrollTop) {
        gridScroll.scrollTop = timelineScroll.scrollTop;
      }
      setScrollTop(timelineScroll.scrollTop);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth > 300 && newWidth < window.innerWidth - 400) {
          setGridWidthOverride(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    gridScroll.addEventListener('scroll', handleGridScroll);
    timelineScroll.addEventListener('scroll', handleTimelineScroll);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      gridScroll.removeEventListener('scroll', handleGridScroll);
      timelineScroll.removeEventListener('scroll', handleTimelineScroll);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{
        backgroundColor: theme.bgPrimary,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Toolbar */}
      <GanttToolbar
        theme={theme}
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        zoom={zoom}
        onZoomChange={setZoom}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        rowDensity={rowDensity}
        onRowDensityChange={setRowDensity}
        showThemeSelector={showThemeSelector}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task Grid */}
        <div ref={gridScrollRef} style={{ width: gridWidth }}>
          <TaskGrid
            tasks={localTasks}
            theme={theme}
            rowHeight={rowHeight}
            availableUsers={availableUsers}
            onTaskClick={onTaskClick}
            onTaskToggle={handleTaskToggle}
            scrollTop={scrollTop}
            columns={columns}
            onToggleColumn={handleToggleColumn}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskIndent={handleTaskIndent}
            onTaskOutdent={handleTaskOutdent}
            onTaskMove={handleTaskMove}
            onMultiTaskDelete={handleMultiTaskDelete}
            onTaskDuplicate={handleTaskDuplicate}
            onTaskCreate={handleTaskCreate}
            onTaskRename={handleTaskRename}
            onCreateSubtask={handleCreateSubtask}
            onOpenTaskModal={onTaskClick ? (task: Task) => onTaskClick(task) : undefined}
          />
        </div>

        {/* Separator - Resizable */}
        <div
          className="relative flex-shrink-0 cursor-col-resize group"
          style={{
            width: 8,
            backgroundColor: isResizing ? theme.accent : theme.border,
            transition: 'background-color 0.2s',
          }}
          onMouseDown={handleMouseDown}
        >
          <motion.div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2"
            style={{
              width: 2,
              backgroundColor: theme.accent,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isResizing ? 1 : 0 }}
            whileHover={{ opacity: 1 }}
          />
        </div>

        {/* Timeline */}
        <div ref={timelineScrollRef} className="flex-1 overflow-hidden">
          <Timeline
            tasks={localTasks}
            theme={theme}
            rowHeight={rowHeight}
            timeScale={timeScale}
            startDate={startDate}
            endDate={endDate}
            zoom={zoom}
            onTaskClick={onTaskClick}
            onTaskDateChange={handleTaskDateChange}
            onDependencyCreate={handleDependencyCreate}
            onDependencyDelete={handleDependencyDelete}
          />
        </div>
      </div>
    </div>
  );
})