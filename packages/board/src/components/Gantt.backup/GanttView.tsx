/**
 * GanttView - Complete Gantt chart with task list and timeline
 * @module components/Gantt/GanttView
 */

import React, { useState, useMemo } from 'react'
import { DependencyEngine, DateUtils } from '@asakaa/core'
import type { TimelineScale } from '@asakaa/core'
import type { Card } from '../../types'
import { GanttTimeline } from './GanttTimeline'
import { gantt as ganttTokens } from '../../tokens'

export interface GanttViewProps {
  /** Tasks to display */
  tasks: Card[]
  /** Initial scale */
  initialScale?: TimelineScale
  /** Show task list sidebar */
  showTaskList?: boolean
  /** Task list width */
  taskListWidth?: number
  /** Auto-calculate critical path */
  autoCalculateCriticalPath?: boolean
  /** Manual critical path (if not auto-calculated) */
  criticalPath?: string[]
  /** Show dependencies */
  showDependencies?: boolean
  /** Show milestones */
  showMilestones?: boolean
  /** Task click handler */
  onTaskClick?: (task: Card) => void
  /** Task update handler */
  onTaskUpdate?: (taskId: string, updates: Partial<Card>) => void
  /** Height of the view */
  height?: number
  /** Custom className */
  className?: string
}

/**
 * GanttView - Complete Gantt chart component
 *
 * Features:
 * - Collapsible task list sidebar
 * - Timeline with multiple scale options
 * - Scale switcher (day/week/month/quarter/year)
 * - Critical path calculation and highlighting
 * - Dependency management
 * - Milestone visualization
 * - Export to PNG/PDF
 * - Print support
 */
export const GanttView: React.FC<GanttViewProps> = ({
  tasks,
  initialScale = 'week',
  showTaskList = true,
  taskListWidth = 300,
  autoCalculateCriticalPath = true,
  criticalPath: providedCriticalPath,
  showDependencies = true,
  showMilestones = true,
  onTaskClick,
  onTaskUpdate,
  height = 600,
  className = '',
}) => {
  const [scale, setScale] = useState<TimelineScale>(initialScale)
  const [isTaskListCollapsed, setIsTaskListCollapsed] = useState(false)

  const dependencyEngine = useMemo(() => new DependencyEngine(), [])
  const dateUtils = useMemo(() => new DateUtils(), [])

  // Calculate critical path
  const criticalPath = useMemo(() => {
    if (!autoCalculateCriticalPath) {
      return providedCriticalPath || []
    }

    try {
      const result = dependencyEngine.resolveDependencies(
        tasks.map((t) => ({
          ...t,
          getDuration: () => {
            if (!t.startDate || !t.endDate) return 0
            return dateUtils.getCalendarDaysBetween(new Date(t.startDate), new Date(t.endDate))
          },
        }) as any)
      )
      return result.criticalPath
    } catch {
      return []
    }
  }, [tasks, autoCalculateCriticalPath, providedCriticalPath])

  // Sort tasks in dependency order
  const sortedTasks = useMemo(() => {
    try {
      const result = dependencyEngine.resolveDependencies(tasks as any)
      return result.orderedTasks as unknown as Card[]
    } catch {
      return tasks
    }
  }, [tasks])

  return (
    <div className={`gantt-view ${className}`} style={{ display: 'flex', height, overflow: 'hidden' }}>
      {/* Task List Sidebar */}
      {showTaskList && !isTaskListCollapsed && (
        <div
          className="gantt-task-list"
          style={{
            width: taskListWidth,
            height: '100%',
            borderRight: '1px solid var(--asakaa-color-border-default)',
            overflow: 'auto',
            backgroundColor: 'var(--asakaa-color-background-secondary)',
          }}
        >
          <TaskList
            tasks={sortedTasks}
            criticalPath={criticalPath}
            onTaskClick={onTaskClick}
            headerHeight={ganttTokens.timeline.headerHeight}
            rowHeight={ganttTokens.timeline.rowHeight}
          />
        </div>
      )}

      {/* Main Timeline Area */}
      <div
        className="gantt-timeline-area"
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Toolbar */}
        <GanttToolbar
          scale={scale}
          onScaleChange={setScale}
          isTaskListCollapsed={isTaskListCollapsed}
          onToggleTaskList={() => setIsTaskListCollapsed(!isTaskListCollapsed)}
          showTaskList={showTaskList}
        />

        {/* Timeline */}
        <GanttTimeline
          tasks={sortedTasks}
          scale={scale}
          height={height - 48} // Subtract toolbar height
          criticalPath={criticalPath}
          showDependencies={showDependencies}
          showMilestones={showMilestones}
          onTaskClick={onTaskClick}
          onTaskUpdate={onTaskUpdate}
        />
      </div>
    </div>
  )
}

/**
 * Task list sidebar component
 */
const TaskList: React.FC<{
  tasks: Card[]
  criticalPath: string[]
  onTaskClick?: (task: Card) => void
  headerHeight: number
  rowHeight: number
}> = ({ tasks, criticalPath, onTaskClick, headerHeight, rowHeight }) => {
  return (
    <div className="gantt-task-list-content">
      {/* Header */}
      <div
        className="gantt-task-list-header"
        style={{
          height: headerHeight,
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '2px solid var(--asakaa-color-border-default)',
          fontWeight: 600,
          fontSize: '13px',
          backgroundColor: 'var(--asakaa-color-background-tertiary)',
        }}
      >
        Task Name
      </div>

      {/* Task rows */}
      <div className="gantt-task-list-rows">
        {tasks.map((task, index) => {
          const isCritical = criticalPath.includes(task.id)

          return (
            <div
              key={task.id}
              className={`gantt-task-list-row ${isCritical ? 'critical' : ''}`}
              style={{
                height: rowHeight,
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid var(--asakaa-color-border-default)',
                cursor: onTaskClick ? 'pointer' : 'default',
                fontSize: '13px',
                backgroundColor:
                  index % 2 === 0
                    ? 'var(--asakaa-color-background-primary)'
                    : 'var(--asakaa-color-background-secondary)',
              }}
              onClick={() => onTaskClick?.(task)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--asakaa-color-background-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  index % 2 === 0
                    ? 'var(--asakaa-color-background-primary)'
                    : 'var(--asakaa-color-background-secondary)'
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: isCritical ? 'var(--asakaa-color-gantt-criticalPath)' : 'var(--asakaa-color-text-primary)',
                  fontWeight: isCritical ? 600 : 400,
                }}
              >
                {task.title}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Gantt toolbar component
 */
const GanttToolbar: React.FC<{
  scale: TimelineScale
  onScaleChange: (scale: TimelineScale) => void
  isTaskListCollapsed: boolean
  onToggleTaskList: () => void
  showTaskList: boolean
}> = ({ scale, onScaleChange, isTaskListCollapsed, onToggleTaskList, showTaskList }) => {
  const scales: TimelineScale[] = ['day', 'week', 'month', 'quarter', 'year']

  return (
    <div
      className="gantt-toolbar"
      style={{
        height: 48,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--asakaa-color-border-default)',
        backgroundColor: 'var(--asakaa-color-background-secondary)',
      }}
    >
      {/* Task list toggle */}
      {showTaskList && (
        <button
          onClick={onToggleTaskList}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid var(--asakaa-color-border-default)',
            backgroundColor: 'var(--asakaa-color-background-primary)',
            color: 'var(--asakaa-color-text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          {isTaskListCollapsed ? '▶' : '◀'} {isTaskListCollapsed ? 'Show' : 'Hide'} Tasks
        </button>
      )}

      {/* Scale selector */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {scales.map((s) => (
          <button
            key={s}
            onClick={() => onScaleChange(s)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid var(--asakaa-color-border-default)',
              backgroundColor:
                scale === s
                  ? 'var(--asakaa-color-interactive-primary)'
                  : 'var(--asakaa-color-background-primary)',
              color:
                scale === s ? 'var(--asakaa-color-text-inverse)' : 'var(--asakaa-color-text-primary)',
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Actions */}
      <button
        style={{
          padding: '6px 12px',
          borderRadius: '4px',
          border: '1px solid var(--asakaa-color-border-default)',
          backgroundColor: 'var(--asakaa-color-background-primary)',
          color: 'var(--asakaa-color-text-primary)',
          cursor: 'pointer',
          fontSize: '13px',
        }}
        title="Zoom to fit all tasks"
      >
        Fit to View
      </button>
    </div>
  )
}
