/**
 * TimelineRenderer - Base class for SVG-based Gantt timeline rendering
 * @module components/Gantt/renderers/TimelineRenderer
 */

import type { TimelineScale } from '@asakaa/core'

export interface TimelineConfig {
  /** Width of the timeline in pixels */
  width: number
  /** Height of the timeline in pixels */
  height: number
  /** Start date of the timeline */
  startDate: Date
  /** End date of the timeline */
  endDate: Date
  /** Scale of the timeline (day, week, month, quarter) */
  scale: TimelineScale
  /** Column width for the scale */
  columnWidth: number
  /** Row height for tasks */
  rowHeight: number
  /** Header height */
  headerHeight: number
  /** Grid line color */
  gridLineColor?: string
  /** Grid line width */
  gridLineWidth?: number
  /** Background color */
  backgroundColor?: string
  /** Today line color */
  todayLineColor?: string
  /** Enable weekend shading */
  highlightWeekends?: boolean
  /** Weekend background color */
  weekendColor?: string
}

export interface RenderContext {
  /** SVG element to render into */
  svg: SVGSVGElement
  /** Configuration */
  config: TimelineConfig
  /** Current viewport (for virtual scrolling) */
  viewport?: {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * Base class for timeline renderers
 * Provides common utilities for SVG rendering
 */
export abstract class TimelineRenderer {
  protected config: TimelineConfig

  constructor(config: TimelineConfig) {
    this.config = config
  }

  /**
   * Main render method - must be implemented by subclasses
   */
  abstract render(context: RenderContext): void

  /**
   * Clear the SVG canvas
   */
  protected clear(svg: SVGSVGElement): void {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild)
    }
  }

  /**
   * Create an SVG element
   */
  protected createSVGElement<K extends keyof SVGElementTagNameMap>(
    type: K,
    attributes?: Record<string, string | number>
  ): SVGElementTagNameMap[K] {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type)

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, String(value))
      })
    }

    return element
  }

  /**
   * Create a group element
   */
  protected createGroup(className?: string): SVGGElement {
    const g = this.createSVGElement('g')
    if (className) {
      g.setAttribute('class', className)
    }
    return g
  }

  /**
   * Create a line element
   */
  protected createLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    attributes?: Record<string, string | number>
  ): SVGLineElement {
    return this.createSVGElement('line', {
      x1,
      y1,
      x2,
      y2,
      ...attributes,
    })
  }

  /**
   * Create a rectangle element
   */
  protected createRect(
    x: number,
    y: number,
    width: number,
    height: number,
    attributes?: Record<string, string | number>
  ): SVGRectElement {
    return this.createSVGElement('rect', {
      x,
      y,
      width,
      height,
      ...attributes,
    })
  }

  /**
   * Create a text element
   */
  protected createText(
    x: number,
    y: number,
    content: string,
    attributes?: Record<string, string | number>
  ): SVGTextElement {
    const text = this.createSVGElement('text', {
      x,
      y,
      ...attributes,
    })
    text.textContent = content
    return text
  }

  /**
   * Create a path element
   */
  protected createPath(d: string, attributes?: Record<string, string | number>): SVGPathElement {
    return this.createSVGElement('path', {
      d,
      ...attributes,
    })
  }

  /**
   * Convert date to X coordinate
   */
  protected dateToX(date: Date): number {
    const startTime = this.config.startDate.getTime()
    const endTime = this.config.endDate.getTime()
    const dateTime = date.getTime()

    // Clamp to timeline range
    const clampedTime = Math.max(startTime, Math.min(endTime, dateTime))

    const totalDuration = endTime - startTime
    const elapsed = clampedTime - startTime

    return (elapsed / totalDuration) * this.config.width
  }

  /**
   * Convert X coordinate to date
   */
  protected xToDate(x: number): Date {
    const startTime = this.config.startDate.getTime()
    const endTime = this.config.endDate.getTime()
    const totalDuration = endTime - startTime

    const elapsed = (x / this.config.width) * totalDuration
    return new Date(startTime + elapsed)
  }

  /**
   * Convert row index to Y coordinate
   */
  protected rowToY(rowIndex: number): number {
    return this.config.headerHeight + rowIndex * this.config.rowHeight
  }

  /**
   * Convert Y coordinate to row index
   */
  protected yToRow(y: number): number {
    const adjustedY = y - this.config.headerHeight
    return Math.floor(adjustedY / this.config.rowHeight)
  }

  /**
   * Check if a date is a weekend
   */
  protected isWeekend(date: Date): boolean {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  /**
   * Check if element is in viewport (for virtual rendering)
   */
  protected isInViewport(x: number, y: number, width: number, height: number, viewport?: RenderContext['viewport']): boolean {
    if (!viewport) return true

    const right = x + width
    const bottom = y + height

    return (
      right >= viewport.x &&
      x <= viewport.x + viewport.width &&
      bottom >= viewport.y &&
      y <= viewport.y + viewport.height
    )
  }

  /**
   * Get column positions for the current scale
   */
  protected getColumnPositions(): Array<{ x: number; date: Date }> {
    const positions: Array<{ x: number; date: Date }> = []
    const current = new Date(this.config.startDate)
    const scale = this.config.scale

    while (current <= this.config.endDate) {
      const x = this.dateToX(current)
      positions.push({ x, date: new Date(current) })

      // Increment based on scale
      switch (scale) {
        case 'day':
          current.setDate(current.getDate() + 1)
          break
        case 'week':
          current.setDate(current.getDate() + 7)
          break
        case 'month':
          current.setMonth(current.getMonth() + 1)
          break
        case 'quarter':
          current.setMonth(current.getMonth() + 3)
          break
        case 'year':
          current.setFullYear(current.getFullYear() + 1)
          break
      }
    }

    return positions
  }

  /**
   * Format date based on scale
   */
  protected formatDate(date: Date, scale: TimelineScale): string {
    switch (scale) {
      case 'day':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case 'week':
        return `W${this.getWeekNumber(date)}`
      case 'month':
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      case 'quarter':
        return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`
      case 'year':
        return date.getFullYear().toString()
      default:
        return date.toLocaleDateString()
    }
  }

  /**
   * Get ISO week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 4 - (d.getDay() || 7))
    const yearStart = new Date(d.getFullYear(), 0, 1)
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
    return weekNo
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TimelineConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): TimelineConfig {
    return { ...this.config }
  }
}
