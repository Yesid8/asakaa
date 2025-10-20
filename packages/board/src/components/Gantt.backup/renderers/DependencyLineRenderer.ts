/**
 * DependencyLineRenderer - Renders dependency arrows between tasks
 * @module components/Gantt/renderers/DependencyLineRenderer
 */

import { TimelineRenderer } from './TimelineRenderer'
import type { RenderContext } from './TimelineRenderer'
import type { Card } from '../../../types'
import type { Dependency, DependencyType } from '@asakaa/core'

export interface DependencyLineConfig {
  /** Line width */
  lineWidth: number
  /** Line color */
  lineColor?: string
  /** Critical path line color */
  criticalPathColor?: string
  /** Arrow size */
  arrowSize: number
  /** Line style */
  lineStyle?: 'solid' | 'dashed' | 'dotted'
  /** Show arrow heads */
  showArrows?: boolean
}

export interface DependencyRenderData {
  /** Source task */
  fromTask: {
    card: Card
    rowIndex: number
  }
  /** Target task */
  toTask: {
    card: Card
    rowIndex: number
  }
  /** Dependency configuration */
  dependency: Dependency
  /** Is this dependency on the critical path */
  isCriticalPath?: boolean
}

/**
 * DependencyLineRenderer - Renders dependency arrows
 *
 * Features:
 * - Smart routing to avoid overlapping with tasks
 * - Different arrow styles for dependency types
 * - Critical path highlighting
 * - Hover effects with dependency info
 */
export class DependencyLineRenderer extends TimelineRenderer {
  private depConfig: DependencyLineConfig

  constructor(config: RenderContext['config'], depConfig?: Partial<DependencyLineConfig>) {
    super(config)
    this.depConfig = {
      lineWidth: 2,
      arrowSize: 8,
      lineStyle: 'solid',
      showArrows: true,
      ...depConfig,
    }
  }

  /**
   * Main render method (not used directly)
   */
  render(_context: RenderContext): void {
    throw new Error('Use renderDependencies() method instead')
  }

  /**
   * Render multiple dependencies
   */
  renderDependencies(
    svg: SVGSVGElement,
    dependencies: DependencyRenderData[],
    viewport?: RenderContext['viewport']
  ): void {
    // Create defs for arrow markers
    this.createArrowMarkers(svg)

    const depsGroup = this.createGroup('gantt-dependencies')

    dependencies.forEach((depData) => {
      this.renderDependency(depsGroup, depData, viewport)
    })

    svg.appendChild(depsGroup)
  }

  /**
   * Create arrow marker definitions
   */
  private createArrowMarkers(svg: SVGSVGElement): void {
    let defs = svg.querySelector('defs')
    if (!defs) {
      defs = this.createSVGElement('defs')
      svg.appendChild(defs)
    }

    // Normal arrow
    const normalMarker = this.createArrowMarker(
      'arrow-normal',
      this.depConfig.lineColor || 'var(--asakaa-color-gantt-dependency)'
    )
    defs.appendChild(normalMarker)

    // Critical path arrow
    const criticalMarker = this.createArrowMarker(
      'arrow-critical',
      this.depConfig.criticalPathColor || 'var(--asakaa-color-gantt-criticalPath)'
    )
    defs.appendChild(criticalMarker)
  }

  /**
   * Create an arrow marker element
   */
  private createArrowMarker(id: string, color: string): SVGMarkerElement {
    const marker = this.createSVGElement('marker', {
      id,
      markerWidth: this.depConfig.arrowSize,
      markerHeight: this.depConfig.arrowSize,
      refX: this.depConfig.arrowSize - 1,
      refY: this.depConfig.arrowSize / 2,
      orient: 'auto',
    })

    const path = this.createPath(`M0,0 L0,${this.depConfig.arrowSize} L${this.depConfig.arrowSize},${this.depConfig.arrowSize / 2} z`, {
      fill: color,
    })

    marker.appendChild(path)
    return marker
  }

  /**
   * Render a single dependency line
   */
  private renderDependency(
    parent: SVGGElement,
    depData: DependencyRenderData,
    viewport?: RenderContext['viewport']
  ): void {
    const { fromTask, toTask, dependency, isCriticalPath } = depData

    // Skip if tasks don't have dates
    if (!fromTask.card.startDate || !fromTask.card.endDate || !toTask.card.startDate || !toTask.card.endDate) {
      return
    }

    // Calculate connection points based on dependency type
    const points = this.calculateConnectionPoints(fromTask, toTask, dependency.type)

    if (!points) return

    // Check if in viewport (rough check)
    const minX = Math.min(points.from.x, points.to.x)
    const maxX = Math.max(points.from.x, points.to.x)
    const minY = Math.min(points.from.y, points.to.y)
    const maxY = Math.max(points.from.y, points.to.y)

    if (!this.isInViewport(minX, minY, maxX - minX, maxY - minY, viewport)) {
      return
    }

    const depGroup = this.createGroup(`gantt-dependency-${fromTask.card.id}-${toTask.card.id}`)
    depGroup.setAttribute('data-from', fromTask.card.id)
    depGroup.setAttribute('data-to', toTask.card.id)

    // Generate path
    const pathD = this.generatePath(points.from, points.to, dependency.type)

    // Line color
    const lineColor = isCriticalPath
      ? this.depConfig.criticalPathColor || 'var(--asakaa-color-gantt-criticalPath)'
      : this.depConfig.lineColor || 'var(--asakaa-color-gantt-dependency)'

    // Marker
    const markerId = isCriticalPath ? 'arrow-critical' : 'arrow-normal'

    // Create path element
    const path = this.createPath(pathD, {
      stroke: lineColor,
      'stroke-width': this.depConfig.lineWidth,
      fill: 'none',
      'marker-end': this.depConfig.showArrows ? `url(#${markerId})` : '',
      class: `gantt-dependency-line ${isCriticalPath ? 'critical-path' : ''}`,
    })

    // Add stroke dash pattern if needed
    if (this.depConfig.lineStyle === 'dashed') {
      path.setAttribute('stroke-dasharray', '5,3')
    } else if (this.depConfig.lineStyle === 'dotted') {
      path.setAttribute('stroke-dasharray', '2,2')
    }

    // Hover effects
    path.style.cursor = 'pointer'
    path.style.transition = 'stroke-width 0.2s'
    path.addEventListener('mouseenter', () => {
      path.setAttribute('stroke-width', String(this.depConfig.lineWidth + 1))
    })
    path.addEventListener('mouseleave', () => {
      path.setAttribute('stroke-width', String(this.depConfig.lineWidth))
    })

    depGroup.appendChild(path)

    // Add title for tooltip
    const title = this.createSVGElement('title')
    title.textContent = `${fromTask.card.title} → ${toTask.card.title} (${this.formatDependencyType(dependency.type)})`
    depGroup.appendChild(title)

    parent.appendChild(depGroup)
  }

  /**
   * Calculate connection points for tasks
   */
  private calculateConnectionPoints(
    fromTask: { card: Card; rowIndex: number },
    toTask: { card: Card; rowIndex: number },
    type: DependencyType
  ): { from: { x: number; y: number }; to: { x: number; y: number } } | null {
    const rowHeight = this.config.rowHeight

    const fromY = this.rowToY(fromTask.rowIndex) + rowHeight / 2
    const toY = this.rowToY(toTask.rowIndex) + rowHeight / 2

    let fromX: number
    let toX: number

    switch (type) {
      case 'finish-to-start':
        // From end of source to start of target
        fromX = this.dateToX(new Date(fromTask.card.endDate!))
        toX = this.dateToX(new Date(toTask.card.startDate!))
        break

      case 'start-to-start':
        // From start of source to start of target
        fromX = this.dateToX(new Date(fromTask.card.startDate!))
        toX = this.dateToX(new Date(toTask.card.startDate!))
        break

      case 'finish-to-finish':
        // From end of source to end of target
        fromX = this.dateToX(new Date(fromTask.card.endDate!))
        toX = this.dateToX(new Date(toTask.card.endDate!))
        break

      case 'start-to-finish':
        // From start of source to end of target
        fromX = this.dateToX(new Date(fromTask.card.startDate!))
        toX = this.dateToX(new Date(toTask.card.endDate!))
        break

      default:
        return null
    }

    return {
      from: { x: fromX, y: fromY },
      to: { x: toX, y: toY },
    }
  }

  /**
   * Generate SVG path with smart routing
   */
  private generatePath(from: { x: number; y: number }, to: { x: number; y: number }, _type: DependencyType): string {
    const dx = to.x - from.x
    const dy = to.y - from.y

    // Simple case: same row or straight line possible
    if (Math.abs(dy) < 10) {
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
    }

    // Smart routing with corners
    const midX = from.x + dx * 0.5
    const cornerRadius = 8

    // Path with rounded corners
    const path: string[] = []
    path.push(`M ${from.x} ${from.y}`)

    if (dx > 50) {
      // Sufficient horizontal space - use S-curve
      path.push(`L ${midX - cornerRadius} ${from.y}`)
      path.push(`Q ${midX} ${from.y} ${midX} ${from.y + (dy > 0 ? cornerRadius : -cornerRadius)}`)
      path.push(`L ${midX} ${to.y - (dy > 0 ? cornerRadius : -cornerRadius)}`)
      path.push(`Q ${midX} ${to.y} ${midX + cornerRadius} ${to.y}`)
      path.push(`L ${to.x} ${to.y}`)
    } else {
      // Limited horizontal space - use stepped path
      const stepX = from.x + 20
      path.push(`L ${stepX} ${from.y}`)
      path.push(`L ${stepX} ${to.y}`)
      path.push(`L ${to.x} ${to.y}`)
    }

    return path.join(' ')
  }

  /**
   * Format dependency type for display
   */
  private formatDependencyType(type: DependencyType): string {
    switch (type) {
      case 'finish-to-start':
        return 'Finish to Start'
      case 'start-to-start':
        return 'Start to Start'
      case 'finish-to-finish':
        return 'Finish to Finish'
      case 'start-to-finish':
        return 'Start to Finish'
      default:
        return type
    }
  }

  /**
   * Update dependency configuration
   */
  updateDependencyConfig(config: Partial<DependencyLineConfig>): void {
    this.depConfig = { ...this.depConfig, ...config }
  }

  /**
   * Get dependency configuration
   */
  getDependencyConfig(): DependencyLineConfig {
    return { ...this.depConfig }
  }
}
