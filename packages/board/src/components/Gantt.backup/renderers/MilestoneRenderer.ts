/**
 * MilestoneRenderer - Renders milestone markers in the Gantt timeline
 * @module components/Gantt/renderers/MilestoneRenderer
 */

import { TimelineRenderer } from './TimelineRenderer'
import type { RenderContext } from './TimelineRenderer'
import type { Card } from '../../../types'

export interface MilestoneConfig {
  /** Size of milestone diamond */
  size: number
  /** Rotation angle (typically 45 degrees for diamond shape) */
  rotation: number
  /** Milestone color */
  color?: string
  /** Critical milestone color */
  criticalColor?: string
  /** Show milestone labels */
  showLabels?: boolean
  /** Label font size */
  labelFontSize?: number
}

export interface MilestoneRenderData {
  /** Card representing the milestone */
  card: Card
  /** Row index */
  rowIndex: number
  /** Is this a critical milestone */
  isCritical?: boolean
}

/**
 * MilestoneRenderer - Renders milestone diamonds
 *
 * Features:
 * - Diamond-shaped markers
 * - Labels for milestone names
 * - Critical milestone highlighting
 * - Hover effects with milestone info
 *
 * Milestones are identified as tasks with:
 * - Zero duration (startDate === endDate)
 * - OR tasks marked as milestones in metadata
 */
export class MilestoneRenderer extends TimelineRenderer {
  private milestoneConfig: MilestoneConfig

  constructor(config: RenderContext['config'], milestoneConfig?: Partial<MilestoneConfig>) {
    super(config)
    this.milestoneConfig = {
      size: 16,
      rotation: 45,
      showLabels: true,
      labelFontSize: 11,
      ...milestoneConfig,
    }
  }

  /**
   * Main render method (not used directly)
   */
  render(_context: RenderContext): void {
    throw new Error('Use renderMilestones() method instead')
  }

  /**
   * Render multiple milestones
   */
  renderMilestones(
    svg: SVGSVGElement,
    milestones: MilestoneRenderData[],
    viewport?: RenderContext['viewport']
  ): void {
    const milestonesGroup = this.createGroup('gantt-milestones')

    milestones.forEach((milestoneData) => {
      this.renderMilestone(milestonesGroup, milestoneData, viewport)
    })

    svg.appendChild(milestonesGroup)
  }

  /**
   * Check if a card is a milestone
   */
  static isMilestone(card: Card): boolean {
    // Check if explicitly marked as milestone
    if (card.metadata?.milestone === true) {
      return true
    }

    // Check if zero duration
    if (card.startDate && card.endDate) {
      const start = new Date(card.startDate).getTime()
      const end = new Date(card.endDate).getTime()
      return start === end
    }

    return false
  }

  /**
   * Render a single milestone
   */
  private renderMilestone(
    parent: SVGGElement,
    milestoneData: MilestoneRenderData,
    viewport?: RenderContext['viewport']
  ): void {
    const { card, rowIndex, isCritical } = milestoneData

    // Use endDate as the milestone date
    if (!card.endDate) return

    const x = this.dateToX(new Date(card.endDate))
    const y = this.rowToY(rowIndex) + this.config.rowHeight / 2

    // Check if in viewport
    if (!this.isInViewport(x - this.milestoneConfig.size, y - this.milestoneConfig.size,
                           this.milestoneConfig.size * 2, this.milestoneConfig.size * 2, viewport)) {
      return
    }

    const milestoneGroup = this.createGroup(`gantt-milestone-${card.id}`)
    milestoneGroup.setAttribute('data-milestone-id', card.id)

    // Determine color
    const color = isCritical
      ? this.milestoneConfig.criticalColor || 'var(--asakaa-color-gantt-criticalPath)'
      : this.milestoneConfig.color || 'var(--asakaa-color-gantt-milestone)'

    // Create diamond (rotated square)
    const diamond = this.createDiamond(x, y, this.milestoneConfig.size, color)
    diamond.style.cursor = 'pointer'
    diamond.style.transition = 'transform 0.2s'

    // Hover effect
    diamond.addEventListener('mouseenter', () => {
      diamond.style.transform = 'scale(1.2)'
    })
    diamond.addEventListener('mouseleave', () => {
      diamond.style.transform = 'scale(1)'
    })

    milestoneGroup.appendChild(diamond)

    // Add border
    const borderDiamond = this.createDiamond(x, y, this.milestoneConfig.size, 'none')
    borderDiamond.setAttribute('stroke', '#ffffff')
    borderDiamond.setAttribute('stroke-width', '2')
    borderDiamond.setAttribute('pointer-events', 'none')
    milestoneGroup.appendChild(borderDiamond)

    // Label
    if (this.milestoneConfig.showLabels) {
      this.renderLabel(milestoneGroup, x, y, card.title)
    }

    // Tooltip
    const title = this.createSVGElement('title')
    title.textContent = `Milestone: ${card.title}`
    milestoneGroup.appendChild(title)

    parent.appendChild(milestoneGroup)
  }

  /**
   * Create a diamond shape (rotated square)
   */
  private createDiamond(cx: number, cy: number, size: number, fill: string): SVGPolygonElement {
    const halfSize = size / 2

    // Calculate diamond points (top, right, bottom, left)
    const points = [
      `${cx},${cy - halfSize}`, // Top
      `${cx + halfSize},${cy}`, // Right
      `${cx},${cy + halfSize}`, // Bottom
      `${cx - halfSize},${cy}`, // Left
    ].join(' ')

    return this.createSVGElement('polygon', {
      points,
      fill,
      class: 'gantt-milestone-diamond',
    })
  }

  /**
   * Render milestone label
   */
  private renderLabel(parent: SVGGElement, x: number, y: number, title: string): void {
    const labelY = y + this.milestoneConfig.size + 15

    const text = this.createText(x, labelY, title, {
      'text-anchor': 'middle',
      fill: 'var(--asakaa-color-text-primary)',
      'font-size': this.milestoneConfig.labelFontSize ?? 12,
      'font-weight': '600',
      class: 'gantt-milestone-label',
      'pointer-events': 'none',
    })

    // Background for better readability
    const bbox = text.getBBox()
    const bg = this.createRect(bbox.x - 4, bbox.y - 2, bbox.width + 8, bbox.height + 4, {
      fill: 'var(--asakaa-color-background-primary)',
      opacity: '0.9',
      rx: '3',
      class: 'gantt-milestone-label-bg',
      'pointer-events': 'none',
    })

    parent.insertBefore(bg, parent.lastChild)
    parent.appendChild(text)
  }

  /**
   * Update milestone configuration
   */
  updateMilestoneConfig(config: Partial<MilestoneConfig>): void {
    this.milestoneConfig = { ...this.milestoneConfig, ...config }
  }

  /**
   * Get milestone configuration
   */
  getMilestoneConfig(): MilestoneConfig {
    return { ...this.milestoneConfig }
  }
}
