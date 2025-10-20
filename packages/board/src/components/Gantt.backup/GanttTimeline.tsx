/**
 * GanttTimeline - Main Gantt chart timeline component
 * @module components/Gantt/GanttTimeline
 */

import React, { useRef, useEffect, useState, useCallback } from 'react'
import type { TimelineScale } from '@asakaa/core'
import { DateUtils, Card as CardModel } from '@asakaa/core'
import type { Card } from '../../types'
import { GridRenderer } from './renderers/GridRenderer'
import { TaskBarRenderer } from './renderers/TaskBarRenderer'
import { DependencyLineRenderer } from './renderers/DependencyLineRenderer'
import { MilestoneRenderer } from './renderers/MilestoneRenderer'
import type { TimelineConfig } from './renderers/TimelineRenderer'

export interface GanttTimelineProps {
  /** Tasks to display */
  tasks: Card[]
  /** Timeline scale */
  scale?: TimelineScale
  /** Start date (auto-calculated if not provided) */
  startDate?: Date
  /** End date (auto-calculated if not provided) */
  endDate?: Date
  /** Width of the timeline */
  width?: number
  /** Height of the timeline */
  height?: number
  /** Row height for tasks */
  rowHeight?: number
  /** Header height */
  headerHeight?: number
  /** Critical path task IDs */
  criticalPath?: string[]
  /** Show dependencies */
  showDependencies?: boolean
  /** Show milestones */
  showMilestones?: boolean
  /** Task click handler */
  onTaskClick?: (task: Card) => void
  /** Task update handler (for drag/resize) */
  onTaskUpdate?: (taskId: string, updates: Partial<Card>) => void
  /** Custom className */
  className?: string
}

/**
 * GanttTimeline - SVG-based Gantt chart
 *
 * Features:
 * - Auto-scaling timeline based on task dates
 * - Multiple scale views (day, week, month, quarter, year)
 * - Task bars with progress indicators
 * - Dependency arrows
 * - Milestones
 * - Critical path highlighting
 * - Virtual scrolling for performance
 * - Drag and resize support
 */
export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  tasks,
  scale = 'week',
  startDate: providedStartDate,
  endDate: providedEndDate,
  width = 1200,
  height = 600,
  rowHeight = 44,
  headerHeight = 60,
  criticalPath = [],
  showDependencies = true,
  showMilestones = true,
  onTaskClick,
  onTaskUpdate, // Reserved for future drag-to-resize feature
  className = '',
}) => {
  // TODO: Implement onTaskUpdate for drag-to-resize task bars
  void onTaskUpdate
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState({ x: 0, y: 0, width, height })

  const dateUtils = new DateUtils()

  // Calculate timeline range
  const { startDate, endDate } = React.useMemo(() => {
    if (providedStartDate && providedEndDate) {
      return { startDate: providedStartDate, endDate: providedEndDate }
    }

    // Convert board Card types to core CardData for DateUtils
    const cardDataArray = tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      startDate: t.startDate ? (typeof t.startDate === 'string' ? new Date(t.startDate) : t.startDate) : undefined,
      endDate: t.endDate ? (typeof t.endDate === 'string' ? new Date(t.endDate) : t.endDate) : undefined,
      dueDate: t.dueDate ? (typeof t.dueDate === 'string' ? new Date(t.dueDate) : t.dueDate) : undefined,
      priority: t.priority,
      columnId: t.columnId,
      position: t.position,
      createdAt: t.createdAt ? (typeof t.createdAt === 'string' ? new Date(t.createdAt) : t.createdAt) : new Date(),
      updatedAt: t.updatedAt ? (typeof t.updatedAt === 'string' ? new Date(t.updatedAt) : t.updatedAt) : new Date(),
    }))
    const coreCards = cardDataArray.map(data => CardModel.fromData(data))
    const range = dateUtils.getTimelineRange(coreCards, 14)
    return { startDate: range.start, endDate: range.end }
  }, [tasks, providedStartDate, providedEndDate])

  // Create timeline config
  const timelineConfig: TimelineConfig = React.useMemo(
    () => ({
      width,
      height,
      startDate,
      endDate,
      scale,
      columnWidth: getColumnWidth(scale),
      rowHeight,
      headerHeight,
      gridLineColor: 'var(--asakaa-color-gantt-gridLine)',
      gridLineWidth: 1,
      backgroundColor: 'var(--asakaa-color-background-primary)',
      todayLineColor: 'var(--asakaa-color-gantt-todayLine)',
      highlightWeekends: scale === 'day',
      weekendColor: 'var(--asakaa-color-gantt-weekend)',
    }),
    [width, height, startDate, endDate, scale, rowHeight, headerHeight]
  )

  // Render the Gantt chart
  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild)
    }

    // Create renderers
    const gridRenderer = new GridRenderer(timelineConfig)
    const taskRenderer = new TaskBarRenderer(timelineConfig)
    const depRenderer = new DependencyLineRenderer(timelineConfig)
    const milestoneRenderer = new MilestoneRenderer(timelineConfig)

    // Render grid and header
    gridRenderer.render({ svg, config: timelineConfig, viewport })
    gridRenderer.renderHeader(svg)

    // Prepare task data
    const taskData = tasks
      .filter((task) => task.startDate && task.endDate)
      .map((task, index) => ({
        card: task,
        rowIndex: index,
        isCriticalPath: criticalPath.includes(task.id),
      }))

    // Render tasks
    taskRenderer.renderTasks(svg, taskData, viewport)

    // Render dependencies
    if (showDependencies) {
      const dependencies: any[] = []

      tasks.forEach((task, toIndex) => {
        if (!task.dependencies) return

        task.dependencies.forEach((dep) => {
          if (typeof dep === 'string') {
            // Legacy format - convert to new format
            const fromTask = tasks.find((t) => t.id === dep)
            if (!fromTask) return

            dependencies.push({
              fromTask: {
                card: fromTask,
                rowIndex: tasks.indexOf(fromTask),
              },
              toTask: {
                card: task,
                rowIndex: toIndex,
              },
              dependency: {
                taskId: dep,
                type: 'finish-to-start' as const,
              },
              isCriticalPath: criticalPath.includes(fromTask.id) && criticalPath.includes(task.id),
            })
          } else {
            // New format with Dependency object
            const fromTask = tasks.find((t) => t.id === dep.taskId)
            if (!fromTask) return

            dependencies.push({
              fromTask: {
                card: fromTask,
                rowIndex: tasks.indexOf(fromTask),
              },
              toTask: {
                card: task,
                rowIndex: toIndex,
              },
              dependency: dep,
              isCriticalPath: criticalPath.includes(fromTask.id) && criticalPath.includes(task.id),
            })
          }
        })
      })

      depRenderer.renderDependencies(svg, dependencies, viewport)
    }

    // Render milestones
    if (showMilestones) {
      const milestones = taskData
        .filter(({ card }) => MilestoneRenderer.isMilestone(card))
        .map(({ card, rowIndex, isCriticalPath }) => ({
          card,
          rowIndex,
          isCritical: isCriticalPath,
        }))

      milestoneRenderer.renderMilestones(svg, milestones, viewport)
    }

    // Add click handlers
    if (onTaskClick) {
      svg.querySelectorAll('.gantt-task-bar').forEach((element) => {
        const cardId = element.getAttribute('data-card-id')
        if (cardId) {
          const task = tasks.find((t) => t.id === cardId)
          if (task) {
            element.addEventListener('click', () => onTaskClick(task))
          }
        }
      })
    }
  }, [tasks, timelineConfig, viewport, criticalPath, showDependencies, showMilestones, onTaskClick])

  // Handle scroll for virtual rendering
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    setViewport({
      x: target.scrollLeft,
      y: target.scrollTop,
      width: target.clientWidth,
      height: target.clientHeight,
    })
  }, [])

  return (
    <div
      ref={containerRef}
      className={`gantt-timeline-container ${className}`}
      style={{
        width: '100%',
        height: height,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height + headerHeight}
        className="gantt-timeline-svg"
        style={{
          display: 'block',
          backgroundColor: 'var(--asakaa-color-background-primary)',
        }}
      />
    </div>
  )
}

/**
 * Get column width based on scale
 */
function getColumnWidth(scale: TimelineScale): number {
  switch (scale) {
    case 'day':
      return 40
    case 'week':
      return 80
    case 'month':
      return 120
    case 'quarter':
      return 200
    case 'year':
      return 300
    default:
      return 80
  }
}
