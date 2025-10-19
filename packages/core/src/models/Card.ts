/**
 * Card Model - Immutable card entity
 * @module models/Card
 */

import type { CardData, Priority, CardStatus } from '../types'

/**
 * Immutable Card entity
 *
 * @example
 * ```typescript
 * const card = new Card({
 *   id: 'card-1',
 *   title: 'Implement login',
 *   columnId: 'todo',
 *   position: 0
 * })
 *
 * // Update creates a new instance
 * const updated = card.update({ title: 'Implement authentication' })
 * ```
 */
export class Card {
  readonly id: string
  readonly title: string
  readonly description?: string
  readonly position: number
  readonly columnId: string
  readonly priority?: Priority
  readonly status?: CardStatus
  readonly assignedUserIds?: readonly string[]
  readonly labels?: readonly string[]
  readonly startDate?: Date
  readonly endDate?: Date
  readonly dependencies?: readonly string[]
  readonly estimatedTime?: number
  readonly actualTime?: number
  readonly metadata?: Readonly<Record<string, unknown>>
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(data: Omit<CardData, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id
    this.title = data.title
    this.description = data.description
    this.position = data.position
    this.columnId = data.columnId
    this.priority = data.priority
    this.status = data.status
    this.assignedUserIds = data.assignedUserIds ? Object.freeze([...data.assignedUserIds]) : undefined
    this.labels = data.labels ? Object.freeze([...data.labels]) : undefined
    this.startDate = data.startDate
    this.endDate = data.endDate
    this.dependencies = data.dependencies ? Object.freeze([...data.dependencies]) : undefined
    this.estimatedTime = data.estimatedTime
    this.actualTime = data.actualTime
    this.metadata = data.metadata ? Object.freeze({ ...data.metadata }) : undefined
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()

    // Freeze the instance to make it immutable
    Object.freeze(this)
  }

  /**
   * Create a new Card instance with updated properties
   *
   * @param changes - Partial card data to update
   * @returns New Card instance with applied changes
   */
  update(changes: Partial<Omit<CardData, 'id' | 'createdAt'>>): Card {
    return new Card({
      ...this.toData(),
      ...changes,
      updatedAt: new Date(),
    })
  }

  /**
   * Convert Card instance to plain data object
   *
   * @returns CardData object
   */
  toData(): CardData {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      position: this.position,
      columnId: this.columnId,
      priority: this.priority,
      status: this.status,
      assignedUserIds: this.assignedUserIds ? [...this.assignedUserIds] : undefined,
      labels: this.labels ? [...this.labels] : undefined,
      startDate: this.startDate,
      endDate: this.endDate,
      dependencies: this.dependencies ? [...this.dependencies] : undefined,
      estimatedTime: this.estimatedTime,
      actualTime: this.actualTime,
      metadata: this.metadata ? { ...this.metadata } : undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  /**
   * Create a Card from plain data object
   *
   * @param data - CardData object
   * @returns Card instance
   */
  static fromData(data: CardData): Card {
    return new Card(data)
  }

  /**
   * Check if card is overdue
   *
   * @returns true if card has end date and it's in the past
   */
  isOverdue(): boolean {
    if (!this.endDate) return false
    return new Date(this.endDate) < new Date()
  }

  /**
   * Check if card is assigned to a specific user
   *
   * @param userId - User ID to check
   * @returns true if user is assigned to this card
   */
  isAssignedTo(userId: string): boolean {
    return this.assignedUserIds?.includes(userId) ?? false
  }

  /**
   * Check if card has a specific label
   *
   * @param label - Label to check
   * @returns true if card has the label
   */
  hasLabel(label: string): boolean {
    return this.labels?.includes(label) ?? false
  }

  /**
   * Calculate progress based on actual time vs estimated time
   *
   * @returns Progress percentage (0-100) or undefined if no estimate
   */
  getProgress(): number | undefined {
    if (!this.estimatedTime || this.estimatedTime === 0) return undefined
    if (!this.actualTime) return 0

    const progress = (this.actualTime / this.estimatedTime) * 100
    return Math.min(progress, 100) // Cap at 100%
  }
}
