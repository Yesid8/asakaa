/**
 * DependencyEngine Tests
 */

import { describe, it, expect } from 'vitest'
import { DependencyEngine } from '../DependencyEngine'
import type { CardData } from '../../types'

describe('DependencyEngine', () => {
  const createCard = (id: string, dependencies: string[] = []): CardData => ({
    id,
    title: `Task ${id}`,
    position: 0,
    columnId: 'todo',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-05'),
    estimatedTime: 32, // 4 days * 8 hours
    dependencies: dependencies.map(taskId => ({
      taskId,
      type: 'finish-to-start' as const,
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  describe('Cycle Detection', () => {
    it('should detect circular dependencies', () => {
      const cards = [
        createCard('A', ['B']),
        createCard('B', ['C']),
        createCard('C', ['A']), // Creates a cycle: A -> B -> C -> A
      ]

      const engine = new DependencyEngine(cards)
      const validation = engine.validateDependencies()

      expect(validation.isValid).toBe(false)
      expect(validation.circularDependencies.length).toBeGreaterThan(0)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('should pass validation for valid dependencies', () => {
      const cards = [
        createCard('A'),
        createCard('B', ['A']),
        createCard('C', ['B']),
      ]

      const engine = new DependencyEngine(cards)
      const validation = engine.validateDependencies()

      expect(validation.isValid).toBe(true)
      expect(validation.circularDependencies).toHaveLength(0)
      expect(validation.errors).toHaveLength(0)
    })

    it('should detect self-dependencies', () => {
      const cards = [createCard('A', ['A'])]

      const engine = new DependencyEngine(cards)
      const validation = engine.validateDependencies()

      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.includes('self-dependency'))).toBe(true)
    })
  })

  describe('Topological Sort', () => {
    it('should sort tasks in dependency order', () => {
      const cards = [
        createCard('C', ['B']),
        createCard('A'),
        createCard('B', ['A']),
      ]

      const engine = new DependencyEngine(cards)
      const sorted = engine.topologicalSort()

      // A should come before B, B should come before C
      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('B'))
      expect(sorted.indexOf('B')).toBeLessThan(sorted.indexOf('C'))
    })

    it('should handle tasks with no dependencies', () => {
      const cards = [
        createCard('A'),
        createCard('B'),
        createCard('C'),
      ]

      const engine = new DependencyEngine(cards)
      const sorted = engine.topologicalSort()

      expect(sorted).toHaveLength(3)
      expect(sorted).toContain('A')
      expect(sorted).toContain('B')
      expect(sorted).toContain('C')
    })
  })

  describe('Critical Path Method', () => {
    it('should calculate early and late dates', () => {
      const cards = [
        createCard('A'),
        createCard('B', ['A']),
        createCard('C', ['B']),
      ]

      const engine = new DependencyEngine(cards)
      const schedule = engine.calculateSchedule({
        projectStartDate: new Date('2025-01-01'),
        workingHoursPerDay: 8,
      })

      expect(schedule.size).toBe(3)

      const taskA = schedule.get('A')
      const taskB = schedule.get('B')

      expect(taskA).toBeDefined()
      expect(taskB).toBeDefined()
      expect(taskB!.earlyStart.getTime()).toBeGreaterThanOrEqual(taskA!.earlyFinish.getTime())
    })

    it('should identify critical path', () => {
      const cards = [
        createCard('A'),
        createCard('B', ['A']),
        createCard('C', ['A']), // Parallel path
      ]

      const engine = new DependencyEngine(cards)
      const criticalPath = engine.findCriticalPath()

      expect(criticalPath.cardIds.length).toBeGreaterThan(0)
      expect(criticalPath.duration).toBeGreaterThan(0)
      expect(criticalPath.totalSlack).toBe(0) // Critical path has 0 slack
    })

    it('should calculate float correctly', () => {
      const cards = [
        createCard('A'),
        createCard('B', ['A']),
        createCard('C', ['A']), // Parallel path - might have float
      ]

      const engine = new DependencyEngine(cards)
      const schedule = engine.calculateSchedule()

      const taskA = schedule.get('A')
      expect(taskA).toBeDefined()
      expect(taskA!.isCritical).toBe(true) // First task is always on critical path
    })
  })

  describe('Dependency Management', () => {
    it('should get predecessors and successors', () => {
      const cards = [
        createCard('A'),
        createCard('B', ['A']),
        createCard('C', ['B']),
      ]

      const engine = new DependencyEngine(cards)

      const predecessorsB = engine.getPredecessors('B')
      const successorsA = engine.getSuccessors('A')

      expect(predecessorsB).toContain('A')
      expect(successorsA).toContain('B')
    })

    it('should add dependency without creating cycle', () => {
      const cards = [
        createCard('A'),
        createCard('B'),
        createCard('C'),
      ]

      const engine = new DependencyEngine(cards)

      // Add valid dependency
      const result1 = engine.addDependency('A', 'B')
      expect(result1).toBe(true)

      // Try to create cycle (should fail)
      engine.addDependency('B', 'C')
      const result2 = engine.addDependency('C', 'A')
      expect(result2).toBe(false) // Would create cycle
    })

    it('should remove dependency', () => {
      const cards = [
        createCard('A'),
        createCard('B', ['A']),
      ]

      const engine = new DependencyEngine(cards)

      const removed = engine.removeDependency('A', 'B')
      expect(removed).toBe(true)

      const predecessors = engine.getPredecessors('B')
      expect(predecessors).not.toContain('A')
    })
  })

  describe('Task Start Validation', () => {
    it('should allow task to start when dependencies are met', () => {
      const cards = [
        { ...createCard('A'), progress: 100 }, // Completed
        createCard('B', ['A']),
      ]

      const engine = new DependencyEngine(cards)

      const canStart = engine.canTaskStart('B')
      expect(canStart).toBe(true)
    })

    it('should block task when dependencies are not met', () => {
      const cards = [
        { ...createCard('A'), progress: 50 }, // Not completed
        createCard('B', ['A']),
      ]

      const engine = new DependencyEngine(cards)

      const canStart = engine.canTaskStart('B')
      expect(canStart).toBe(false)
    })
  })
})
