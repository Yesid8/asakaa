/**
 * GridRenderer - Renders the timeline grid (vertical columns and horizontal rows)
 * @module components/Gantt/renderers/GridRenderer
 */

import { TimelineRenderer } from './TimelineRenderer'
import type { RenderContext } from './TimelineRenderer'

/**
 * GridRenderer - Renders vertical and horizontal grid lines
 *
 * Features:
 * - Vertical lines for time columns (days/weeks/months)
 * - Horizontal lines for task rows
 * - Weekend highlighting
 * - Today line indicator
 * - Virtual rendering for performance
 */
export class GridRenderer extends TimelineRenderer {
  /**
   * Render the grid
   */
  render(context: RenderContext): void {
    const { svg, config, viewport } = context
    const gridGroup = this.createGroup('gantt-grid')

    // Render background
    this.renderBackground(gridGroup)

    // Render weekend shading
    if (config.highlightWeekends) {
      this.renderWeekends(gridGroup, viewport)
    }

    // Render vertical grid lines (time columns)
    this.renderVerticalLines(gridGroup, viewport)

    // Render horizontal grid lines (task rows)
    this.renderHorizontalLines(gridGroup, viewport)

    // Render today line
    this.renderTodayLine(gridGroup)

    svg.appendChild(gridGroup)
  }

  /**
   * Render background rectangle
   */
  private renderBackground(parent: SVGGElement): void {
    const bg = this.createRect(0, 0, this.config.width, this.config.height, {
      fill: this.config.backgroundColor || 'var(--asakaa-color-background-primary)',
      class: 'gantt-background',
    })
    parent.appendChild(bg)
  }

  /**
   * Render weekend shading
   */
  private renderWeekends(parent: SVGGElement, viewport?: RenderContext['viewport']): void {
    if (this.config.scale !== 'day') return // Only show weekends in day view

    const positions = this.getColumnPositions()
    const weekendGroup = this.createGroup('gantt-weekends')

    positions.forEach(({ x, date }, index) => {
      if (!this.isWeekend(date)) return

      const nextX = index < positions.length - 1 ? positions[index + 1]?.x ?? this.config.width : this.config.width
      const width = nextX - x

      // Check if in viewport
      if (!this.isInViewport(x, 0, width, this.config.height, viewport)) {
        return
      }

      const rect = this.createRect(x, 0, width, this.config.height, {
        fill: this.config.weekendColor || 'var(--asakaa-color-gantt-weekend)',
        opacity: '0.3',
        class: 'gantt-weekend',
      })
      weekendGroup.appendChild(rect)
    })

    parent.appendChild(weekendGroup)
  }

  /**
   * Render vertical grid lines (time columns)
   */
  private renderVerticalLines(parent: SVGGElement, viewport?: RenderContext['viewport']): void {
    const positions = this.getColumnPositions()
    const linesGroup = this.createGroup('gantt-vertical-lines')

    const lineColor = this.config.gridLineColor || 'var(--asakaa-color-gantt-gridLine)'
    const lineWidth = this.config.gridLineWidth || 1

    positions.forEach(({ x }) => {
      // Check if in viewport
      if (!this.isInViewport(x, 0, lineWidth, this.config.height, viewport)) {
        return
      }

      const line = this.createLine(x, 0, x, this.config.height, {
        stroke: lineColor,
        'stroke-width': lineWidth,
        class: 'gantt-grid-line-vertical',
      })
      linesGroup.appendChild(line)
    })

    parent.appendChild(linesGroup)
  }

  /**
   * Render horizontal grid lines (task rows)
   */
  private renderHorizontalLines(parent: SVGGElement, viewport?: RenderContext['viewport']): void {
    const linesGroup = this.createGroup('gantt-horizontal-lines')

    const lineColor = this.config.gridLineColor || 'var(--asakaa-color-gantt-gridLine)'
    const lineWidth = this.config.gridLineWidth || 1

    // Calculate number of rows
    const totalRows = Math.ceil((this.config.height - this.config.headerHeight) / this.config.rowHeight)

    for (let i = 0; i <= totalRows; i++) {
      const y = this.rowToY(i)

      // Check if in viewport
      if (!this.isInViewport(0, y, this.config.width, lineWidth, viewport)) {
        continue
      }

      const line = this.createLine(0, y, this.config.width, y, {
        stroke: lineColor,
        'stroke-width': lineWidth,
        class: 'gantt-grid-line-horizontal',
      })
      linesGroup.appendChild(line)
    }

    parent.appendChild(linesGroup)
  }

  /**
   * Render "today" indicator line
   */
  private renderTodayLine(parent: SVGGElement): void {
    const today = new Date()

    // Check if today is within the timeline range
    if (today < this.config.startDate || today > this.config.endDate) {
      return
    }

    const x = this.dateToX(today)

    const line = this.createLine(x, 0, x, this.config.height, {
      stroke: this.config.todayLineColor || 'var(--asakaa-color-gantt-todayLine)',
      'stroke-width': 2,
      'stroke-dasharray': '5,5',
      class: 'gantt-today-line',
    })

    // Add label
    const text = this.createText(x + 5, 15, 'Today', {
      fill: this.config.todayLineColor || 'var(--asakaa-color-gantt-todayLine)',
      'font-size': '12',
      'font-weight': 'bold',
      class: 'gantt-today-label',
    })

    const group = this.createGroup('gantt-today-indicator')
    group.appendChild(line)
    group.appendChild(text)
    parent.appendChild(group)
  }

  /**
   * Render header with time labels
   */
  renderHeader(svg: SVGSVGElement): void {
    const headerGroup = this.createGroup('gantt-header')

    // Background
    const bg = this.createRect(0, 0, this.config.width, this.config.headerHeight, {
      fill: this.config.backgroundColor || 'var(--asakaa-color-background-secondary)',
      class: 'gantt-header-background',
    })
    headerGroup.appendChild(bg)

    // Time labels
    const positions = this.getColumnPositions()
    const labelGroup = this.createGroup('gantt-header-labels')

    positions.forEach(({ x, date }, index) => {
      const nextX = index < positions.length - 1 ? positions[index + 1]?.x ?? this.config.width : this.config.width
      const centerX = x + (nextX - x) / 2

      const label = this.formatDate(date, this.config.scale)

      const text = this.createText(centerX, this.config.headerHeight / 2 + 5, label, {
        'text-anchor': 'middle',
        fill: 'var(--asakaa-color-text-primary)',
        'font-size': '13',
        'font-weight': '500',
        class: 'gantt-header-label',
      })

      labelGroup.appendChild(text)

      // Separator line
      if (index > 0) {
        const line = this.createLine(x, 0, x, this.config.headerHeight, {
          stroke: this.config.gridLineColor || 'var(--asakaa-color-gantt-gridLine)',
          'stroke-width': 1,
          class: 'gantt-header-separator',
        })
        labelGroup.appendChild(line)
      }
    })

    headerGroup.appendChild(labelGroup)

    // Bottom border
    const borderLine = this.createLine(0, this.config.headerHeight, this.config.width, this.config.headerHeight, {
      stroke: this.config.gridLineColor || 'var(--asakaa-color-gantt-gridLine)',
      'stroke-width': 2,
      class: 'gantt-header-border',
    })
    headerGroup.appendChild(borderLine)

    svg.appendChild(headerGroup)
  }
}
