/**
 * useKeyboardShortcuts Hook Tests
 * Tests for v0.3.0 Keyboard Shortcuts feature
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from '../useKeyboardShortcuts'
import type { KeyboardShortcut } from '../../../types'

/**
 * Helper to create keyboard event with proper target
 */
function createKeyboardEvent(options: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent('keydown', options)
  // Set target to body if not specified
  if (!options.bubbles) {
    Object.defineProperty(event, 'target', { value: document.body, enumerable: true })
  }
  return event
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Hook initialization', () => {
    it('initializes with default shortcuts', () => {
      const { result } = renderHook(() => useKeyboardShortcuts())

      expect(result.current.isEnabled).toBe(true)
      expect(result.current.registerShortcut).toBeInstanceOf(Function)
      expect(result.current.unregisterShortcut).toBeInstanceOf(Function)
    })

    it('initializes with custom shortcuts', () => {
      const customShortcuts: KeyboardShortcut[] = [
        {
          keys: 'F1',
          action: 'help',
          description: 'Open help',
        },
      ]

      const { result } = renderHook(() =>
        useKeyboardShortcuts({ shortcuts: customShortcuts })
      )

      expect(result.current.isEnabled).toBe(true)
    })

    it('initializes in disabled state', () => {
      const { result } = renderHook(() =>
        useKeyboardShortcuts({ enabled: false })
      )

      expect(result.current.isEnabled).toBe(false)
    })
  })

  describe('Keyboard event handling', () => {
    it('triggers action on matching key press', () => {
      const handleKeyboardAction = vi.fn()
      window.addEventListener('keyboard-action', handleKeyboardAction)

      renderHook(() => useKeyboardShortcuts())

      // Simulate ArrowUp key press
      const event = createKeyboardEvent({ key: 'ArrowUp' })
      window.dispatchEvent(event)

      expect(handleKeyboardAction).toHaveBeenCalledTimes(1)
      expect(handleKeyboardAction.mock.calls[0][0].detail).toBe('navigate_up')

      window.removeEventListener('keyboard-action', handleKeyboardAction)
    })

    it('triggers action with Ctrl modifier', () => {
      const handleKeyboardAction = vi.fn()
      window.addEventListener('keyboard-action', handleKeyboardAction)

      renderHook(() => useKeyboardShortcuts())

      // Simulate Ctrl+N key press
      const event = createKeyboardEvent({ key: 'n', ctrlKey: true })
      window.dispatchEvent(event)

      expect(handleKeyboardAction).toHaveBeenCalledTimes(1)
      expect(handleKeyboardAction.mock.calls[0][0].detail).toBe('new_card')

      window.removeEventListener('keyboard-action', handleKeyboardAction)
    })

    it('triggers action with Shift modifier', () => {
      const handleKeyboardAction = vi.fn()
      window.addEventListener('keyboard-action', handleKeyboardAction)

      renderHook(() => useKeyboardShortcuts())

      // Simulate Shift+Delete key press
      const event = createKeyboardEvent({ key: 'Delete', shiftKey: true })
      window.dispatchEvent(event)

      expect(handleKeyboardAction).toHaveBeenCalledTimes(1)
      expect(handleKeyboardAction.mock.calls[0][0].detail).toBe('delete_card')

      window.removeEventListener('keyboard-action', handleKeyboardAction)
    })

    it('does not trigger when disabled', () => {
      const handleKeyboardAction = vi.fn()
      window.addEventListener('keyboard-action', handleKeyboardAction)

      renderHook(() => useKeyboardShortcuts({ enabled: false }))

      // Simulate key press
      const event = createKeyboardEvent({ key: 'ArrowUp' })
      window.dispatchEvent(event)

      expect(handleKeyboardAction).not.toHaveBeenCalled()

      window.removeEventListener('keyboard-action', handleKeyboardAction)
    })
  })

  describe('Input element handling', () => {
    it('ignores shortcuts when typing in input', () => {
      const handleKeyboardAction = vi.fn()
      window.addEventListener('keyboard-action', handleKeyboardAction)

      renderHook(() => useKeyboardShortcuts())

      // Simulate typing in input field
      const input = document.createElement('input')
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', {
        key: 'n',
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })

      window.dispatchEvent(event)

      expect(handleKeyboardAction).not.toHaveBeenCalled()

      document.body.removeChild(input)
      window.removeEventListener('keyboard-action', handleKeyboardAction)
    })

    it('ignores shortcuts when typing in textarea', () => {
      const handleKeyboardAction = vi.fn()
      window.addEventListener('keyboard-action', handleKeyboardAction)

      renderHook(() => useKeyboardShortcuts())

      // Simulate typing in textarea
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)

      const event = new KeyboardEvent('keydown', {
        key: 'n',
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: textarea, enumerable: true })

      window.dispatchEvent(event)

      expect(handleKeyboardAction).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
      window.removeEventListener('keyboard-action', handleKeyboardAction)
    })

    it('allows Escape key in input fields', () => {
      const handleKeyboardAction = vi.fn()
      window.addEventListener('keyboard-action', handleKeyboardAction)

      renderHook(() => useKeyboardShortcuts())

      // Simulate Escape in input field
      const input = document.createElement('input')
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })

      window.dispatchEvent(event)

      expect(handleKeyboardAction).toHaveBeenCalled()

      document.body.removeChild(input)
      window.removeEventListener('keyboard-action', handleKeyboardAction)
    })

    it('allows Ctrl shortcuts in input fields', () => {
      const handleKeyboardAction = vi.fn()
      window.addEventListener('keyboard-action', handleKeyboardAction)

      renderHook(() => useKeyboardShortcuts())

      // Simulate Ctrl+S in input field
      const input = document.createElement('input')
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })

      window.dispatchEvent(event)

      expect(handleKeyboardAction).toHaveBeenCalled()

      document.body.removeChild(input)
      window.removeEventListener('keyboard-action', handleKeyboardAction)
    })
  })

  describe('Dynamic shortcut registration', () => {
    it('registers new shortcut dynamically', () => {
      const handleKeyboardAction = vi.fn()
      window.addEventListener('keyboard-action', handleKeyboardAction)

      const { result } = renderHook(() => useKeyboardShortcuts())

      // Register custom shortcut
      act(() => {
        result.current.registerShortcut({
          keys: 'F1',
          action: 'help',
          description: 'Open help',
        })
      })

      // Trigger the new shortcut
      const event = createKeyboardEvent({ key: 'F1' })
      window.dispatchEvent(event)

      expect(handleKeyboardAction).toHaveBeenCalledTimes(1)
      expect(handleKeyboardAction.mock.calls[0][0].detail).toBe('help')

      window.removeEventListener('keyboard-action', handleKeyboardAction)
    })

    it('unregisters shortcut dynamically', () => {
      const handleKeyboardAction = vi.fn()
      window.addEventListener('keyboard-action', handleKeyboardAction)

      const { result } = renderHook(() => useKeyboardShortcuts())

      // Unregister existing shortcut
      act(() => {
        result.current.unregisterShortcut('navigate_up')
      })

      // Try to trigger unregistered shortcut
      const event = createKeyboardEvent({ key: 'ArrowUp' })
      window.dispatchEvent(event)

      expect(handleKeyboardAction).not.toHaveBeenCalled()

      window.removeEventListener('keyboard-action', handleKeyboardAction)
    })
  })

  describe('Default shortcuts', () => {
    it('includes navigation shortcuts', () => {
      const navigationShortcuts = DEFAULT_SHORTCUTS.filter((s) =>
        s.action.includes('navigate')
      )

      expect(navigationShortcuts.length).toBeGreaterThan(0)
      expect(navigationShortcuts.some((s) => s.keys === 'ArrowUp')).toBe(true)
      expect(navigationShortcuts.some((s) => s.keys === 'ArrowDown')).toBe(true)
      expect(navigationShortcuts.some((s) => s.keys === 'ArrowLeft')).toBe(true)
      expect(navigationShortcuts.some((s) => s.keys === 'ArrowRight')).toBe(true)
    })

    it('includes action shortcuts', () => {
      expect(DEFAULT_SHORTCUTS.some((s) => s.action === 'open_card')).toBe(true)
      expect(DEFAULT_SHORTCUTS.some((s) => s.action === 'new_card')).toBe(true)
      expect(DEFAULT_SHORTCUTS.some((s) => s.action === 'delete_card')).toBe(true)
    })

    it('includes editing shortcuts', () => {
      expect(DEFAULT_SHORTCUTS.some((s) => s.action === 'undo')).toBe(true)
      expect(DEFAULT_SHORTCUTS.some((s) => s.action === 'redo')).toBe(true)
      expect(DEFAULT_SHORTCUTS.some((s) => s.action === 'save')).toBe(true)
    })

    it('includes selection shortcuts', () => {
      expect(DEFAULT_SHORTCUTS.some((s) => s.action === 'select_all')).toBe(true)
      expect(DEFAULT_SHORTCUTS.some((s) => s.action === 'deselect_all')).toBe(true)
    })
  })

  describe('preventDefault option', () => {
    it('prevents default when preventDefault is true', () => {
      renderHook(() => useKeyboardShortcuts({ preventDefault: true }))

      const event = createKeyboardEvent({ key: 'ArrowUp' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      window.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('does not prevent default when preventDefault is false', () => {
      renderHook(() => useKeyboardShortcuts({ preventDefault: false }))

      const event = createKeyboardEvent({ key: 'ArrowUp' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      window.dispatchEvent(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('removes event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useKeyboardShortcuts())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })
})
