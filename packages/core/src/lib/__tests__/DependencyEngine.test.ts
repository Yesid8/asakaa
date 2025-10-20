/**
 * DependencyEngine Tests
 * @module lib/__tests__
 */

import { describe, it, expect } from 'vitest'
import { DependencyEngine, DependencyError } from '../DependencyEngine'
import { Card } from '../../models/Card'
import type { Dependency } from '../../types'

describe('DependencyEngine', () => {
  const engine = new DependencyEngine()

  // Helper to create cards
  const createCard = (
    id: string,
    dependencies?: Dependency[],
    startDate?: Date,
    duration?: number
  ): Card => {
    const start = startDate || new Date('2024-01-01')
    const end = duration ? new Date(start.getTime() + duration * 24 * 60 * 60 * 1000) : undefined

    return new Card({
      id,
      title: `Task ${id}`,
      columnId: 'col-1',
      position: 0,
      dependencies,
      startDate: start,
      endDate: end,
    })
  }

  describe('resolveDependencies()', () => {
    it('should return empty result for no tasks', () => {
      const result = engine.resolveDependencies([])

      expect(result.orderedTasks).toEqual([])
      expect(result.criticalPath).toEqual([])
      expect(result.circularDependencies).toEqual([])
    })

    it('should handle tasks with no dependencies', () => {
      const tasks = [createCard('task-1'), createCard('task-2'), createCard('task-3')]

      const result = engine.resolveDependencies(tasks)

      expect(result.orderedTasks).toHaveLength(3)
      expect(result.circularDependencies).toEqual([])
    })

    it('should order tasks by dependencies', () => {
      const task1 = createCard('task-1')
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])
      const task3 = createCard('task-3', [{ taskId: 'task-2', type: 'finish-to-start' }])

      const result = engine.resolveDependencies([task3, task1, task2])

      expect(result.orderedTasks.map((t) => t.id)).toEqual(['task-1', 'task-2', 'task-3'])
    })

    it('should calculate earliest start dates', () => {
      const task1 = createCard('task-1', undefined, new Date('2024-01-01'), 5)
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }], undefined, 3)

      const result = engine.resolveDependencies([task1, task2])

      const task2Start = result.earliestStarts.get('task-2')
      expect(task2Start).toBeDefined()

      // task2 should start after task1 ends (Jan 1 + 5 days = Jan 6)
      expect(task2Start!.getDate()).toBeGreaterThanOrEqual(6)
    })
  })

  describe('Cycle Detection', () => {
    it('should detect simple circular dependency', () => {
      const task1 = createCard('task-1', [{ taskId: 'task-2', type: 'finish-to-start' }])
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])

      const result = engine.resolveDependencies([task1, task2])

      expect(result.circularDependencies.length).toBeGreaterThan(0)
    })

    it('should detect complex circular dependency chain', () => {
      const task1 = createCard('task-1', [{ taskId: 'task-3', type: 'finish-to-start' }])
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])
      const task3 = createCard('task-3', [{ taskId: 'task-2', type: 'finish-to-start' }])

      const result = engine.resolveDependencies([task1, task2, task3])

      expect(result.circularDependencies.length).toBeGreaterThan(0)
    })

    it('should not detect false cycles', () => {
      const task1 = createCard('task-1')
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])
      const task3 = createCard('task-3', [{ taskId: 'task-1', type: 'finish-to-start' }])
      const task4 = createCard('task-4', [
        { taskId: 'task-2', type: 'finish-to-start' },
        { taskId: 'task-3', type: 'finish-to-start' },
      ])

      const result = engine.resolveDependencies([task1, task2, task3, task4])

      expect(result.circularDependencies).toEqual([])
    })
  })

  describe('Critical Path', () => {
    it('should identify critical path in simple chain', () => {
      const task1 = createCard('task-1', undefined, new Date('2024-01-01'), 5)
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }], undefined, 3)
      const task3 = createCard('task-3', [{ taskId: 'task-2', type: 'finish-to-start' }], undefined, 2)

      const result = engine.resolveDependencies([task1, task2, task3])

      expect(result.criticalPath).toContain('task-1')
      expect(result.criticalPath).toContain('task-2')
      expect(result.criticalPath).toContain('task-3')
    })

    it('should identify longest path as critical', () => {
      const task1 = createCard('task-1', undefined, new Date('2024-01-01'), 10)
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }], undefined, 5)
      const task3 = createCard('task-3', [{ taskId: 'task-1', type: 'finish-to-start' }], undefined, 1)

      const result = engine.resolveDependencies([task1, task2, task3])

      // task-1 -> task-2 is longer path than task-1 -> task-3
      expect(result.criticalPath).toContain('task-1')
      expect(result.criticalPath).toContain('task-2')
    })
  })

  describe('validateDependencies()', () => {
    it('should pass for valid dependencies', () => {
      const task1 = createCard('task-1')
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])

      expect(() => {
        engine.validateDependencies([task1, task2])
      }).not.toThrow()
    })

    it('should throw for missing dependency task', () => {
      const task1 = createCard('task-1', [{ taskId: 'nonexistent', type: 'finish-to-start' }])

      expect(() => {
        engine.validateDependencies([task1])
      }).toThrow(DependencyError)
    })

    it('should throw for circular dependencies', () => {
      const task1 = createCard('task-1', [{ taskId: 'task-2', type: 'finish-to-start' }])
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])

      expect(() => {
        engine.validateDependencies([task1, task2])
      }).toThrow(DependencyError)
    })
  })

  describe('wouldCreateCycle()', () => {
    it('should return false for valid new dependency', () => {
      const task1 = createCard('task-1')
      const task2 = createCard('task-2')

      const wouldCycle = engine.wouldCreateCycle([task1, task2], 'task-2', 'task-1')

      expect(wouldCycle).toBe(false)
    })

    it('should return true for dependency that creates cycle', () => {
      const task1 = createCard('task-1', [{ taskId: 'task-2', type: 'finish-to-start' }])
      const task2 = createCard('task-2')

      // Adding task-2 -> task-1 would create cycle
      const wouldCycle = engine.wouldCreateCycle([task1, task2], 'task-2', 'task-1')

      expect(wouldCycle).toBe(true)
    })

    it('should return true for dependency creating long cycle chain', () => {
      const task1 = createCard('task-1', [{ taskId: 'task-2', type: 'finish-to-start' }])
      const task2 = createCard('task-2', [{ taskId: 'task-3', type: 'finish-to-start' }])
      const task3 = createCard('task-3')

      // Adding task-3 -> task-1 would create cycle: 1->2->3->1
      const wouldCycle = engine.wouldCreateCycle([task1, task2, task3], 'task-3', 'task-1')

      expect(wouldCycle).toBe(true)
    })
  })

  describe('getSuccessors()', () => {
    it('should return tasks that depend on given task', () => {
      const task1 = createCard('task-1')
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])
      const task3 = createCard('task-3', [{ taskId: 'task-1', type: 'finish-to-start' }])
      const task4 = createCard('task-4', [{ taskId: 'task-2', type: 'finish-to-start' }])

      const successors = engine.getSuccessors([task1, task2, task3, task4], 'task-1')

      expect(successors).toHaveLength(2)
      expect(successors.map((t) => t.id)).toContain('task-2')
      expect(successors.map((t) => t.id)).toContain('task-3')
    })

    it('should return empty array for task with no successors', () => {
      const task1 = createCard('task-1')
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])

      const successors = engine.getSuccessors([task1, task2], 'task-2')

      expect(successors).toEqual([])
    })
  })

  describe('getPredecessors()', () => {
    it('should return tasks that given task depends on', () => {
      const task1 = createCard('task-1')
      const task2 = createCard('task-2')
      const task3 = createCard('task-3', [
        { taskId: 'task-1', type: 'finish-to-start' },
        { taskId: 'task-2', type: 'finish-to-start' },
      ])

      const predecessors = engine.getPredecessors([task1, task2, task3], 'task-3')

      expect(predecessors).toHaveLength(2)
      expect(predecessors.map((t) => t.id)).toContain('task-1')
      expect(predecessors.map((t) => t.id)).toContain('task-2')
    })

    it('should return empty array for task with no predecessors', () => {
      const task1 = createCard('task-1')
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])

      const predecessors = engine.getPredecessors([task1, task2], 'task-1')

      expect(predecessors).toEqual([])
    })
  })

  describe('Dependency Types', () => {
    it('should handle finish-to-start dependencies', () => {
      const task1 = createCard('task-1', undefined, new Date('2024-01-01'), 5)
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])

      const result = engine.resolveDependencies([task1, task2])
      const task2Start = result.earliestStarts.get('task-2')

      // task2 should start on or after Jan 6 (Jan 1 + 5 days)
      expect(task2Start!.getDate()).toBeGreaterThanOrEqual(6)
    })

    it('should handle start-to-start dependencies', () => {
      const task1 = createCard('task-1', undefined, new Date('2024-01-01'), 5)
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'start-to-start' }])

      const result = engine.resolveDependencies([task1, task2])
      const task2Start = result.earliestStarts.get('task-2')

      // task2 should start on Jan 1 (same as task1 start)
      expect(task2Start!.getDate()).toBe(1)
    })

    it('should handle lag in dependencies', () => {
      const task1 = createCard('task-1', undefined, new Date('2024-01-01'), 5)
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start', lag: 3 }])

      const result = engine.resolveDependencies([task1, task2])
      const task2Start = result.earliestStarts.get('task-2')

      // task2 should start on Jan 9 (Jan 1 + 5 days + 3 days lag)
      expect(task2Start!.getDate()).toBeGreaterThanOrEqual(9)
    })

    it('should handle negative lag (lead time)', () => {
      const task1 = createCard('task-1', undefined, new Date('2024-01-05'), 5)
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start', lag: -2 }])

      const result = engine.resolveDependencies([task1, task2])
      const task2Start = result.earliestStarts.get('task-2')

      // task2 should start on Jan 8 (Jan 5 + 5 days - 2 days lead)
      expect(task2Start!.getDate()).toBeLessThanOrEqual(10)
    })
  })

  describe('calculateSlack()', () => {
    it('should calculate zero slack for critical tasks', () => {
      const task = createCard('task-1', undefined, new Date('2024-01-01'), 5)
      const earliestStart = new Date('2024-01-01')
      const latestStart = new Date('2024-01-01')

      const slack = engine.calculateSlack(task, earliestStart, latestStart)

      expect(slack).toBe(0)
    })

    it('should calculate positive slack for non-critical tasks', () => {
      const task = createCard('task-1', undefined, new Date('2024-01-01'), 5)
      const earliestStart = new Date('2024-01-01')
      const latestStart = new Date('2024-01-05')

      const slack = engine.calculateSlack(task, earliestStart, latestStart)

      expect(slack).toBe(4)
    })

    it('should handle multi-day slack', () => {
      const task = createCard('task-1', undefined, new Date('2024-01-01'), 5)
      const earliestStart = new Date('2024-01-01')
      const latestStart = new Date('2024-01-10')

      const slack = engine.calculateSlack(task, earliestStart, latestStart)

      expect(slack).toBe(9)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single task', () => {
      const task1 = createCard('task-1')

      const result = engine.resolveDependencies([task1])

      expect(result.orderedTasks).toHaveLength(1)
      expect(result.criticalPath).toContain('task-1')
      expect(result.circularDependencies).toEqual([])
    })

    it('should handle multiple independent chains', () => {
      // Chain 1: task-1 -> task-2
      const task1 = createCard('task-1')
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])

      // Chain 2: task-3 -> task-4
      const task3 = createCard('task-3')
      const task4 = createCard('task-4', [{ taskId: 'task-3', type: 'finish-to-start' }])

      const result = engine.resolveDependencies([task1, task2, task3, task4])

      expect(result.orderedTasks).toHaveLength(4)
      expect(result.circularDependencies).toEqual([])
    })

    it('should handle diamond dependencies', () => {
      //     task-1
      //    /      \
      // task-2  task-3
      //    \      /
      //     task-4
      const task1 = createCard('task-1')
      const task2 = createCard('task-2', [{ taskId: 'task-1', type: 'finish-to-start' }])
      const task3 = createCard('task-3', [{ taskId: 'task-1', type: 'finish-to-start' }])
      const task4 = createCard('task-4', [
        { taskId: 'task-2', type: 'finish-to-start' },
        { taskId: 'task-3', type: 'finish-to-start' },
      ])

      const result = engine.resolveDependencies([task1, task2, task3, task4])

      expect(result.orderedTasks).toHaveLength(4)
      expect(result.circularDependencies).toEqual([])

      // task-1 should be first
      expect(result.orderedTasks[0].id).toBe('task-1')

      // task-4 should be last
      expect(result.orderedTasks[3].id).toBe('task-4')
    })

    it('should handle tasks with no dates', () => {
      const task1 = new Card({
        id: 'task-1',
        title: 'Task 1',
        columnId: 'col-1',
        position: 0,
      })

      const task2 = new Card({
        id: 'task-2',
        title: 'Task 2',
        columnId: 'col-1',
        position: 1,
        dependencies: [{ taskId: 'task-1', type: 'finish-to-start' }],
      })

      const result = engine.resolveDependencies([task1, task2])

      expect(result.orderedTasks).toHaveLength(2)
      expect(result.earliestStarts.get('task-1')).toBeDefined()
      expect(result.earliestStarts.get('task-2')).toBeDefined()
    })
  })
})
