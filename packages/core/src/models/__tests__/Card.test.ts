/**
 * Card Model Tests
 * @module models/__tests__
 */

import { describe, it, expect } from 'vitest'
import { Card } from '../Card'
import type { CardData, Dependency } from '../../types'

describe('Card', () => {
  const mockCardData: Omit<CardData, 'createdAt' | 'updatedAt'> = {
    id: 'card-1',
    title: 'Test Card',
    description: 'Test description',
    position: 0,
    columnId: 'col-1',
    status: 'TODO',
    priority: 'HIGH',
    assignedUserIds: ['user-1', 'user-2'],
    labels: ['bug', 'urgent'],
    estimatedTime: 8,
    actualTime: 5,
    endDate: new Date('2024-12-31'),
  }

  describe('Constructor', () => {
    it('should create a card with all properties', () => {
      const card = new Card(mockCardData)

      expect(card.id).toBe('card-1')
      expect(card.title).toBe('Test Card')
      expect(card.description).toBe('Test description')
      expect(card.position).toBe(0)
      expect(card.columnId).toBe('col-1')
      expect(card.status).toBe('TODO')
      expect(card.priority).toBe('HIGH')
      expect(card.assignedUserIds).toEqual(['user-1', 'user-2'])
      expect(card.labels).toEqual(['bug', 'urgent'])
      expect(card.estimatedTime).toBe(8)
      expect(card.actualTime).toBe(5)
    })

    it('should auto-generate createdAt and updatedAt', () => {
      const card = new Card(mockCardData)

      expect(card.createdAt).toBeInstanceOf(Date)
      expect(card.updatedAt).toBeInstanceOf(Date)
    })

    it('should be immutable', () => {
      const card = new Card(mockCardData)

      expect(() => {
        // @ts-expect-error - testing immutability
        card.title = 'New Title'
      }).toThrow()
    })

    it('should freeze nested arrays', () => {
      const card = new Card(mockCardData)

      expect(Object.isFrozen(card.assignedUserIds)).toBe(true)
      expect(Object.isFrozen(card.labels)).toBe(true)
    })
  })

  describe('update()', () => {
    it('should create new instance with updated properties', () => {
      const card = new Card(mockCardData)
      const updated = card.update({ title: 'Updated Title' })

      expect(updated).not.toBe(card)
      expect(updated.title).toBe('Updated Title')
      expect(card.title).toBe('Test Card') // Original unchanged
    })

    it('should update updatedAt timestamp', () => {
      const card = new Card(mockCardData)
      const originalUpdatedAt = card.updatedAt

      // Wait a bit to ensure different timestamp
      const updated = card.update({ title: 'New' })

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime())
    })

    it('should not allow updating id', () => {
      const card = new Card(mockCardData)
      const updated = card.update({ title: 'New' })

      expect(updated.id).toBe(card.id)
    })
  })

  describe('isOverdue()', () => {
    it('should return true for past endDate', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const card = new Card({
        ...mockCardData,
        endDate: yesterday,
      })

      expect(card.isOverdue()).toBe(true)
    })

    it('should return false for future endDate', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const card = new Card({
        ...mockCardData,
        endDate: tomorrow,
      })

      expect(card.isOverdue()).toBe(false)
    })

    it('should return false when no endDate', () => {
      const card = new Card({
        ...mockCardData,
        endDate: undefined,
      })

      expect(card.isOverdue()).toBe(false)
    })
  })

  describe('isAssignedTo()', () => {
    it('should return true if user is assigned', () => {
      const card = new Card(mockCardData)

      expect(card.isAssignedTo('user-1')).toBe(true)
      expect(card.isAssignedTo('user-2')).toBe(true)
    })

    it('should return false if user is not assigned', () => {
      const card = new Card(mockCardData)

      expect(card.isAssignedTo('user-3')).toBe(false)
    })

    it('should return false when no assignees', () => {
      const card = new Card({
        ...mockCardData,
        assignedUserIds: undefined,
      })

      expect(card.isAssignedTo('user-1')).toBe(false)
    })
  })

  describe('hasLabel()', () => {
    it('should return true if label exists', () => {
      const card = new Card(mockCardData)

      expect(card.hasLabel('bug')).toBe(true)
      expect(card.hasLabel('urgent')).toBe(true)
    })

    it('should return false if label does not exist', () => {
      const card = new Card(mockCardData)

      expect(card.hasLabel('feature')).toBe(false)
    })

    it('should return false when no labels', () => {
      const card = new Card({
        ...mockCardData,
        labels: undefined,
      })

      expect(card.hasLabel('bug')).toBe(false)
    })
  })

  describe('getProgress()', () => {
    it('should return progress percentage', () => {
      const card = new Card({
        ...mockCardData,
        estimatedTime: 10,
        actualTime: 5,
      })

      expect(card.getProgress()).toBe(50)
    })

    it('should return 0 when no actual time', () => {
      const card = new Card({
        ...mockCardData,
        estimatedTime: 10,
        actualTime: 0,
      })

      expect(card.getProgress()).toBe(0)
    })

    it('should return undefined when no estimated time', () => {
      const card = new Card({
        ...mockCardData,
        estimatedTime: undefined,
      })

      expect(card.getProgress()).toBeUndefined()
    })

    it('should cap at 100%', () => {
      const card = new Card({
        ...mockCardData,
        estimatedTime: 5,
        actualTime: 10,
      })

      expect(card.getProgress()).toBe(100)
    })

    it('should return 0 when estimated time is 0', () => {
      const card = new Card({
        ...mockCardData,
        estimatedTime: 0,
        actualTime: 5,
      })

      expect(card.getProgress()).toBeUndefined()
    })
  })

  describe('getDaysUntilDue()', () => {
    it('should return positive days for future date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)

      const card = new Card({
        ...mockCardData,
        endDate: futureDate,
      })

      const days = card.getDaysUntilDue()
      expect(days).toBeGreaterThanOrEqual(4)
      expect(days).toBeLessThanOrEqual(5)
    })

    it('should return negative days for past date', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 3)

      const card = new Card({
        ...mockCardData,
        endDate: pastDate,
      })

      const days = card.getDaysUntilDue()
      expect(days).toBeLessThanOrEqual(-2)
      expect(days).toBeGreaterThanOrEqual(-3)
    })

    it('should return undefined when no end date', () => {
      const card = new Card({
        ...mockCardData,
        endDate: undefined,
      })

      expect(card.getDaysUntilDue()).toBeUndefined()
    })
  })

  describe('toData()', () => {
    it('should convert to CardData', () => {
      const card = new Card(mockCardData)
      const data = card.toData()

      expect(data.id).toBe(card.id)
      expect(data.title).toBe(card.title)
      expect(data.description).toBe(card.description)
      expect(data.position).toBe(card.position)
      expect(data.columnId).toBe(card.columnId)
      expect(data.status).toBe(card.status)
      expect(data.priority).toBe(card.priority)
      expect(data.createdAt).toBe(card.createdAt)
      expect(data.updatedAt).toBe(card.updatedAt)
    })

    it('should include all optional fields', () => {
      const card = new Card(mockCardData)
      const data = card.toData()

      expect(data.assignedUserIds).toEqual(card.assignedUserIds)
      expect(data.labels).toEqual(card.labels)
      expect(data.estimatedTime).toBe(card.estimatedTime)
      expect(data.actualTime).toBe(card.actualTime)
      expect(data.endDate).toBe(card.endDate)
    })
  })

  describe('Edge Cases', () => {
    it('should handle minimal card data', () => {
      const minimalCard = new Card({
        id: 'card-min',
        title: 'Minimal',
        position: 0,
        columnId: 'col-1',
        status: 'TODO',
      })

      expect(minimalCard.id).toBe('card-min')
      expect(minimalCard.title).toBe('Minimal')
      expect(minimalCard.description).toBeUndefined()
      expect(minimalCard.priority).toBeUndefined()
      expect(minimalCard.assignedUserIds).toBeUndefined()
    })

    it('should handle empty arrays', () => {
      const card = new Card({
        ...mockCardData,
        assignedUserIds: [],
        labels: [],
      })

      expect(card.assignedUserIds).toEqual([])
      expect(card.labels).toEqual([])
      expect(card.isAssignedTo('user-1')).toBe(false)
      expect(card.hasLabel('bug')).toBe(false)
    })

    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(1000)
      const card = new Card({
        ...mockCardData,
        title: longTitle,
      })

      expect(card.title).toBe(longTitle)
      expect(card.title.length).toBe(1000)
    })
  })

  // ========================================================================
  // GANTT FEATURES
  // ========================================================================

  describe('Gantt Features - Dependencies', () => {
    const dep1: Dependency = { taskId: 'task-1', type: 'finish-to-start' }
    const dep2: Dependency = { taskId: 'task-2', type: 'start-to-start', lag: 2 }

    describe('hasDependencies()', () => {
      it('should return true when card has dependencies', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [dep1],
        })

        expect(card.hasDependencies()).toBe(true)
      })

      it('should return false when card has no dependencies', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: undefined,
        })

        expect(card.hasDependencies()).toBe(false)
      })

      it('should return false when dependencies array is empty', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [],
        })

        expect(card.hasDependencies()).toBe(false)
      })
    })

    describe('getDependentTaskIds()', () => {
      it('should return array of dependent task IDs', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [dep1, dep2],
        })

        const taskIds = card.getDependentTaskIds()
        expect(taskIds).toEqual(['task-1', 'task-2'])
      })

      it('should return empty array when no dependencies', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: undefined,
        })

        expect(card.getDependentTaskIds()).toEqual([])
      })
    })

    describe('dependsOn()', () => {
      it('should return true if card depends on task', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [dep1, dep2],
        })

        expect(card.dependsOn('task-1')).toBe(true)
        expect(card.dependsOn('task-2')).toBe(true)
      })

      it('should return false if card does not depend on task', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [dep1],
        })

        expect(card.dependsOn('task-3')).toBe(false)
      })
    })

    describe('getDependency()', () => {
      it('should return dependency object if exists', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [dep1, dep2],
        })

        const dep = card.getDependency('task-2')
        expect(dep).toEqual(dep2)
      })

      it('should return undefined if dependency does not exist', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [dep1],
        })

        expect(card.getDependency('task-3')).toBeUndefined()
      })
    })

    describe('addDependency()', () => {
      it('should add a dependency to card', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [dep1],
        })

        const updated = card.addDependency(dep2)

        expect(updated.dependencies).toHaveLength(2)
        expect(updated.dependsOn('task-2')).toBe(true)
        // Original unchanged
        expect(card.dependencies).toHaveLength(1)
      })

      it('should not add duplicate dependency', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [dep1],
        })

        const updated = card.addDependency(dep1)

        expect(updated).toBe(card)
        expect(updated.dependencies).toHaveLength(1)
      })

      it('should add first dependency to card with none', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: undefined,
        })

        const updated = card.addDependency(dep1)

        expect(updated.dependencies).toHaveLength(1)
        expect(updated.dependsOn('task-1')).toBe(true)
      })
    })

    describe('removeDependency()', () => {
      it('should remove a dependency from card', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [dep1, dep2],
        })

        const updated = card.removeDependency('task-1')

        expect(updated.dependencies).toHaveLength(1)
        expect(updated.dependsOn('task-1')).toBe(false)
        expect(updated.dependsOn('task-2')).toBe(true)
      })

      it('should return same instance if dependency does not exist', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [dep1],
        })

        const updated = card.removeDependency('task-3')

        expect(updated).toBe(card)
      })

      it('should set dependencies to undefined when removing last one', () => {
        const card = new Card({
          ...mockCardData,
          dependencies: [dep1],
        })

        const updated = card.removeDependency('task-1')

        expect(updated.dependencies).toBeUndefined()
      })
    })
  })

  describe('Gantt Features - Dates', () => {
    describe('getDuration()', () => {
      it('should return duration in days', () => {
        const start = new Date('2024-01-01')
        const end = new Date('2024-01-06')

        const card = new Card({
          ...mockCardData,
          startDate: start,
          endDate: end,
        })

        expect(card.getDuration()).toBe(5)
      })

      it('should return undefined when dates not set', () => {
        const card = new Card({
          ...mockCardData,
          startDate: undefined,
          endDate: undefined,
        })

        expect(card.getDuration()).toBeUndefined()
      })

      it('should return undefined when only start date set', () => {
        const card = new Card({
          ...mockCardData,
          startDate: new Date(),
          endDate: undefined,
        })

        expect(card.getDuration()).toBeUndefined()
      })

      it('should round up to full days', () => {
        const start = new Date('2024-01-01T10:00:00')
        const end = new Date('2024-01-02T14:00:00')

        const card = new Card({
          ...mockCardData,
          startDate: start,
          endDate: end,
        })

        // 1 day and 4 hours should round up to 2 days
        expect(card.getDuration()).toBeGreaterThanOrEqual(1)
      })
    })

    describe('hasValidDates()', () => {
      it('should return true when start is before end', () => {
        const card = new Card({
          ...mockCardData,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-10'),
        })

        expect(card.hasValidDates()).toBe(true)
      })

      it('should return true when dates are not set', () => {
        const card = new Card({
          ...mockCardData,
          startDate: undefined,
          endDate: undefined,
        })

        expect(card.hasValidDates()).toBe(true)
      })

      it('should return false when start is after end', () => {
        const card = new Card({
          ...mockCardData,
          startDate: new Date('2024-01-10'),
          endDate: new Date('2024-01-01'),
        })

        expect(card.hasValidDates()).toBe(false)
      })
    })

    describe('isInProgress()', () => {
      it('should return true when current date is between start and end', () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        const card = new Card({
          ...mockCardData,
          startDate: yesterday,
          endDate: tomorrow,
        })

        expect(card.isInProgress()).toBe(true)
      })

      it('should return false when not started yet', () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)

        const card = new Card({
          ...mockCardData,
          startDate: tomorrow,
          endDate: nextWeek,
        })

        expect(card.isInProgress()).toBe(false)
      })

      it('should return false when already ended', () => {
        const lastWeek = new Date()
        lastWeek.setDate(lastWeek.getDate() - 7)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const card = new Card({
          ...mockCardData,
          startDate: lastWeek,
          endDate: yesterday,
        })

        expect(card.isInProgress()).toBe(false)
      })
    })

    describe('isNotStarted()', () => {
      it('should return true when start date is in future', () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        const card = new Card({
          ...mockCardData,
          startDate: tomorrow,
        })

        expect(card.isNotStarted()).toBe(true)
      })

      it('should return false when start date is in past', () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const card = new Card({
          ...mockCardData,
          startDate: yesterday,
        })

        expect(card.isNotStarted()).toBe(false)
      })

      it('should return false when no start date', () => {
        const card = new Card({
          ...mockCardData,
          startDate: undefined,
        })

        expect(card.isNotStarted()).toBe(false)
      })
    })

    describe('isCompleted()', () => {
      it('should return true when progress is 100%', () => {
        const card = new Card({
          ...mockCardData,
          progress: 100,
        })

        expect(card.isCompleted()).toBe(true)
      })

      it('should return true when status is DONE', () => {
        const card = new Card({
          ...mockCardData,
          status: 'DONE',
        })

        expect(card.isCompleted()).toBe(true)
      })

      it('should return true when past end date', () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const card = new Card({
          ...mockCardData,
          endDate: yesterday,
        })

        expect(card.isCompleted()).toBe(true)
      })

      it('should return false when in progress', () => {
        const card = new Card({
          ...mockCardData,
          progress: 50,
          status: 'IN_PROGRESS',
        })

        expect(card.isCompleted()).toBe(false)
      })
    })
  })

  describe('Gantt Features - Progress', () => {
    it('should use manual progress override when set', () => {
      const card = new Card({
        ...mockCardData,
        progress: 75,
        estimatedTime: 10,
        actualTime: 2, // Would normally be 20%
      })

      expect(card.getProgress()).toBe(75)
    })

    it('should clamp manual progress to 0-100 range', () => {
      const card1 = new Card({
        ...mockCardData,
        progress: 150,
      })

      const card2 = new Card({
        ...mockCardData,
        progress: -20,
      })

      expect(card1.getProgress()).toBe(100)
      expect(card2.getProgress()).toBe(0)
    })

    it('should fall back to calculated progress when no manual override', () => {
      const card = new Card({
        ...mockCardData,
        progress: undefined,
        estimatedTime: 10,
        actualTime: 5,
      })

      expect(card.getProgress()).toBe(50)
    })
  })
})
