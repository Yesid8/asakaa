import { describe, it, expect } from 'vitest'
import {
  calculatePosition,
  generateInitialPositions,
  needsRebalancing,
  calculateDropPosition,
} from '../positioning'

describe('positioning utilities', () => {
  describe('calculatePosition', () => {
    it('returns 1000 for first item', () => {
      expect(calculatePosition(null, null)).toBe(1000)
    })

    it('calculates position before first item', () => {
      expect(calculatePosition(null, 1000)).toBe(500)
    })

    it('calculates position after last item', () => {
      expect(calculatePosition(1000, null)).toBe(2000)
    })

    it('calculates position between two items', () => {
      expect(calculatePosition(1000, 2000)).toBe(1500)
    })
  })

  describe('generateInitialPositions', () => {
    it('generates positions spaced 1000 apart', () => {
      const positions = generateInitialPositions(3)
      expect(positions).toEqual([1000, 2000, 3000])
    })

    it('handles empty array', () => {
      const positions = generateInitialPositions(0)
      expect(positions).toEqual([])
    })
  })

  describe('needsRebalancing', () => {
    it('returns false for well-spaced positions', () => {
      expect(needsRebalancing([1000, 2000, 3000])).toBe(false)
    })

    it('returns true for close positions', () => {
      expect(needsRebalancing([1000, 1000.5, 2000])).toBe(true)
    })

    it('handles empty array', () => {
      expect(needsRebalancing([])).toBe(false)
    })
  })

  describe('calculateDropPosition', () => {
    const cards = [
      { position: 1000 },
      { position: 2000 },
      { position: 3000 },
    ]

    it('calculates position for empty column', () => {
      expect(calculateDropPosition([], 0)).toBe(1000)
    })

    it('calculates position at beginning', () => {
      const pos = calculateDropPosition(cards, 0)
      expect(pos).toBeLessThan(1000)
    })

    it('calculates position at end', () => {
      const pos = calculateDropPosition(cards, 3)
      expect(pos).toBeGreaterThan(3000)
    })

    it('calculates position in middle', () => {
      const pos = calculateDropPosition(cards, 1)
      expect(pos).toBeGreaterThan(1000)
      expect(pos).toBeLessThan(2000)
    })
  })
})
