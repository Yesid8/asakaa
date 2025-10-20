/**
 * TaskBarRenderer - Renders task bars in the Gantt timeline
 * @module components/Gantt/renderers/TaskBarRenderer
 */

import { TimelineRenderer } from './TimelineRenderer'
import type { RenderContext } from './TimelineRenderer'
import type { Card } from '../../../types'

export interface TaskBarConfig {
  /** Task bar height */
  height: number
  /** Padding inside row */
  padding: number
  /** Border radius */
  borderRadius: number
  /** Task background color */
  backgroundColor?: string
  /** Task border color */
  borderColor?: string
  /** Critical path color */
  criticalPathColor?: string
  /** Completed task color */
  completedColor?: string
  /** Show progress bar */
  showProgress?: boolean
  /** Show task labels */
  showLabels?: boolean
  /** Label font size */
  labelFontSize?: number
}

export interface TaskRenderData {
  /** Card/task data */
  card: Card
  /** Row index (vertical position) */
  rowIndex: number
  /** Is this task on the critical path */
  isCriticalPath?: boolean
}

/**
 * TaskBarRenderer - Renders individual task bars
 *
 * Features:
 * - Colored task bars based on status/priority
 * - Progress indicators
 * - Task labels with truncation
 * - Critical path highlighting
 * - Drag handles for resize
 * - Hover effects
 */
export class TaskBarRenderer extends TimelineRenderer {
  private taskConfig: TaskBarConfig

  constructor(config: RenderContext['config'], taskConfig?: Partial<TaskBarConfig>) {
    super(config)
    this.taskConfig = {
      height: 28,
      padding: 8,
      borderRadius: 4,
      showProgress: true,
      showLabels: true,
      labelFontSize: 12,
      ...taskConfig,
    }
  }

  /**
   * Main render method (not used directly - use renderTask instead)
   */
  render(_context: RenderContext): void {
    // This is implemented by renderTasks method
    throw new Error('Use renderTasks() method instead')
  }

  /**
   * Render multiple tasks
   */
  renderTasks(svg: SVGSVGElement, tasks: TaskRenderData[], viewport?: RenderContext['viewport']): void {
    const tasksGroup = this.createGroup('gantt-tasks')

    tasks.forEach((taskData) => {
      this.renderTask(tasksGroup, taskData, viewport)
    })

    svg.appendChild(tasksGroup)
  }

  /**
   * Render a single task bar
   */
  private renderTask(parent: SVGGElement, taskData: TaskRenderData, viewport?: RenderContext['viewport']): void {
    const { card, rowIndex, isCriticalPath } = taskData

    // Skip if no dates
    if (!card.startDate || !card.endDate) return

    const startX = this.dateToX(new Date(card.startDate))
    const endX = this.dateToX(new Date(card.endDate))
    const width = Math.max(endX - startX, 2) // Minimum 2px width

    const y = this.rowToY(rowIndex) + this.taskConfig.padding
    const height = this.config.rowHeight - this.taskConfig.padding * 2

    // Check if in viewport
    if (!this.isInViewport(startX, y, width, height, viewport)) {
      return
    }

    const taskGroup = this.createGroup(`gantt-task-${card.id}`)
    taskGroup.setAttribute('data-task-id', card.id)

    // Determine colors
    const backgroundColor = this.getTaskColor(card, isCriticalPath)
    const borderColor = this.getBorderColor(card, isCriticalPath)

    // Main task rectangle
    const taskRect = this.createRect(startX, y, width, height, {
      fill: backgroundColor,
      stroke: borderColor,
      'stroke-width': 2,
      rx: this.taskConfig.borderRadius,
      ry: this.taskConfig.borderRadius,
      class: `gantt-task-bar ${isCriticalPath ? 'critical-path' : ''} ${card.priority?.toLowerCase() || ''}`,
      'data-card-id': card.id,
    })

    // Add hover effect
    taskRect.style.cursor = 'pointer'
    taskRect.style.transition = 'opacity 0.2s'
    taskRect.addEventListener('mouseenter', () => {
      taskRect.style.opacity = '0.8'
    })
    taskRect.addEventListener('mouseleave', () => {
      taskRect.style.opacity = '1'
    })

    taskGroup.appendChild(taskRect)

    // Progress bar
    if (this.taskConfig.showProgress && card.progress !== undefined) {
      this.renderProgress(taskGroup, startX, y, width, height, card.progress)
    }

    // Task label
    if (this.taskConfig.showLabels && width > 40) {
      this.renderLabel(taskGroup, startX, y, width, height, card.title)
    }

    // Resize handles (left and right)
    this.renderResizeHandles(taskGroup, startX, y, width, height)

    parent.appendChild(taskGroup)
  }

  /**
   * Render progress indicator
   */
  private renderProgress(
    parent: SVGGElement,
    x: number,
    y: number,
    width: number,
    height: number,
    progress: number
  ): void {
    const progressWidth = (width * Math.min(progress, 100)) / 100

    if (progressWidth < 2) return

    const progressRect = this.createRect(x, y, progressWidth, height, {
      fill: 'rgba(255, 255, 255, 0.3)',
      rx: this.taskConfig.borderRadius,
      ry: this.taskConfig.borderRadius,
      class: 'gantt-task-progress',
      'pointer-events': 'none',
    })

    parent.appendChild(progressRect)
  }

  /**
   * Render task label
   */
  private renderLabel(
    parent: SVGGElement,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string
  ): void {
    const maxChars = Math.floor(width / 7) // Approximate characters that fit
    const truncated = title.length > maxChars ? title.substring(0, maxChars - 3) + '...' : title

    const text = this.createText(x + 8, y + height / 2 + 4, truncated, {
      fill: '#ffffff',
      'font-size': this.taskConfig.labelFontSize ?? 12,
      'font-weight': '500',
      class: 'gantt-task-label',
      'pointer-events': 'none',
    })

    parent.appendChild(text)
  }

  /**
   * Render resize handles
   */
  private renderResizeHandles(
    parent: SVGGElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const handleWidth = 6
    const handleHeight = height * 0.6
    const handleY = y + (height - handleHeight) / 2

    // Left handle
    const leftHandle = this.createRect(x - handleWidth / 2, handleY, handleWidth, handleHeight, {
      fill: 'rgba(255, 255, 255, 0.8)',
      rx: 2,
      class: 'gantt-resize-handle gantt-resize-left',
      'data-handle': 'left',
    })
    leftHandle.style.cursor = 'ew-resize'
    leftHandle.style.opacity = '0'
    leftHandle.style.transition = 'opacity 0.2s'

    // Right handle
    const rightHandle = this.createRect(x + width - handleWidth / 2, handleY, handleWidth, handleHeight, {
      fill: 'rgba(255, 255, 255, 0.8)',
      rx: 2,
      class: 'gantt-resize-handle gantt-resize-right',
      'data-handle': 'right',
    })
    rightHandle.style.cursor = 'ew-resize'
    rightHandle.style.opacity = '0'
    rightHandle.style.transition = 'opacity 0.2s'

    // Show handles on hover
    parent.addEventListener('mouseenter', () => {
      leftHandle.style.opacity = '1'
      rightHandle.style.opacity = '1'
    })
    parent.addEventListener('mouseleave', () => {
      leftHandle.style.opacity = '0'
      rightHandle.style.opacity = '0'
    })

    parent.appendChild(leftHandle)
    parent.appendChild(rightHandle)
  }

  /**
   * Get task color based on status, priority, and critical path
   */
  private getTaskColor(card: Card, isCriticalPath?: boolean): string {
    if (isCriticalPath) {
      return this.taskConfig.criticalPathColor || 'var(--asakaa-color-gantt-criticalPath)'
    }

    // Color by priority
    switch (card.priority) {
      case 'URGENT':
        return 'var(--asakaa-color-priority-urgent)'
      case 'HIGH':
        return 'var(--asakaa-color-priority-high)'
      case 'MEDIUM':
        return 'var(--asakaa-color-priority-medium)'
      case 'LOW':
        return 'var(--asakaa-color-priority-low)'
      default:
        return this.taskConfig.backgroundColor || 'var(--asakaa-color-gantt-taskBackground)'
    }
  }

  /**
   * Get border color
   */
  private getBorderColor(_card: Card, isCriticalPath?: boolean): string {
    if (isCriticalPath) {
      return this.taskConfig.criticalPathColor || 'var(--asakaa-color-gantt-criticalPath)'
    }

    return this.taskConfig.borderColor || 'var(--asakaa-color-gantt-taskBorder)'
  }

  /**
   * Update task configuration
   */
  updateTaskConfig(config: Partial<TaskBarConfig>): void {
    this.taskConfig = { ...this.taskConfig, ...config }
  }

  /**
   * Get task configuration
   */
  getTaskConfig(): TaskBarConfig {
    return { ...this.taskConfig }
  }
}
