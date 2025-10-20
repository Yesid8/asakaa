/**
 * Tests for useMultiSelect hook
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useMultiSelect } from '../useMultiSelect'

describe('useMultiSelect', () => {
  let selection: ReturnType<typeof useMultiSelect>

  beforeEach(() => {
    selection = useMultiSelect()
  })

  describe('Selection State', () => {
    it('should start with empty selection', () => {
      expect(selection.getCount()).toBe(0)
      expect(selection.hasSelection()).toBe(false)
      expect(selection.getSelectedCardIds()).toEqual([])
    })

    it('should get selection state', () => {
      const state = selection.getSelectionState()

      expect(state).toHaveProperty('selectedCardIds')
      expect(state).toHaveProperty('lastSelectedCardId')
      expect(state.selectedCardIds).toEqual([])
      expect(state.lastSelectedCardId).toBeNull()
    })
  })

  describe('Single Selection', () => {
    it('should select a card', () => {
      selection.select('card-1')

      expect(selection.isSelected('card-1')).toBe(true)
      expect(selection.getCount()).toBe(1)
      expect(selection.hasSelection()).toBe(true)
    })

    it('should replace selection when selecting new card', () => {
      selection.select('card-1')
      selection.select('card-2')

      expect(selection.isSelected('card-1')).toBe(false)
      expect(selection.isSelected('card-2')).toBe(true)
      expect(selection.getCount()).toBe(1)
    })

    it('should add card to selection', () => {
      selection.select('card-1')
      selection.add('card-2')

      expect(selection.isSelected('card-1')).toBe(true)
      expect(selection.isSelected('card-2')).toBe(true)
      expect(selection.getCount()).toBe(2)
    })

    it('should remove card from selection', () => {
      selection.select('card-1')
      selection.add('card-2')
      selection.remove('card-1')

      expect(selection.isSelected('card-1')).toBe(false)
      expect(selection.isSelected('card-2')).toBe(true)
      expect(selection.getCount()).toBe(1)
    })

    it('should toggle card selection', () => {
      selection.toggle('card-1')
      expect(selection.isSelected('card-1')).toBe(true)

      selection.toggle('card-1')
      expect(selection.isSelected('card-1')).toBe(false)
    })
  })

  describe('Multiple Selection', () => {
    it('should select multiple cards at once', () => {
      selection.selectMultiple(['card-1', 'card-2', 'card-3'])

      expect(selection.getCount()).toBe(3)
      expect(selection.isSelected('card-1')).toBe(true)
      expect(selection.isSelected('card-2')).toBe(true)
      expect(selection.isSelected('card-3')).toBe(true)
    })

    it('should add multiple cards to selection', () => {
      selection.select('card-1')
      selection.addMultiple(['card-2', 'card-3'])

      expect(selection.getCount()).toBe(3)
      expect(selection.isSelected('card-1')).toBe(true)
      expect(selection.isSelected('card-2')).toBe(true)
      expect(selection.isSelected('card-3')).toBe(true)
    })

    it('should clear all selection', () => {
      selection.selectMultiple(['card-1', 'card-2', 'card-3'])
      selection.clear()

      expect(selection.getCount()).toBe(0)
      expect(selection.hasSelection()).toBe(false)
    })
  })

  describe('Last Selected Card', () => {
    it('should track last selected card', () => {
      selection.select('card-1')
      expect(selection.getLastSelectedCardId()).toBe('card-1')

      selection.add('card-2')
      expect(selection.getLastSelectedCardId()).toBe('card-2')
    })
  })

  describe('Event Callbacks', () => {
    it('should call onSelectionChange callback', () => {
      let callbackIds: string[] = []

      const selectionWithCallback = useMultiSelect({
        onSelectionChange: (ids) => {
          callbackIds = ids
        }
      })

      selectionWithCallback.select('card-1')
      expect(callbackIds).toEqual(['card-1'])

      selectionWithCallback.add('card-2')
      expect(callbackIds).toEqual(['card-1', 'card-2'])
    })

    it('should call onCardSelect callback', () => {
      let selectedId: string | null = null

      const selectionWithCallback = useMultiSelect({
        onCardSelect: (id) => {
          selectedId = id
        }
      })

      selectionWithCallback.select('card-1')
      expect(selectedId).toBe('card-1')
    })

    it('should call onCardDeselect callback', () => {
      let deselectedId: string | null = null

      const selectionWithCallback = useMultiSelect({
        onCardDeselect: (id) => {
          deselectedId = id
        }
      })

      selectionWithCallback.select('card-1')
      selectionWithCallback.remove('card-1')
      expect(deselectedId).toBe('card-1')
    })
  })

  describe('Subscribe to Changes', () => {
    it('should subscribe to selection changes', () => {
      let changeCount = 0
      let lastState: any = null

      const unsubscribe = selection.subscribe((state) => {
        changeCount++
        lastState = state
      })

      // Initial state
      expect(changeCount).toBe(0)

      selection.select('card-1')
      expect(changeCount).toBeGreaterThan(0)
      expect(lastState.selectedCardIds).toContain('card-1')

      unsubscribe()
    })
  })
})
