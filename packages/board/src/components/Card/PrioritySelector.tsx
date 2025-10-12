/**
 * Priority Selector Component
 * Configurable priority selector with flag icon and contextual menu
 */

import { useState, useRef, useEffect } from 'react'
import { Portal } from '../Portal'
import type { Priority } from '../../types'

export interface PrioritySelectorProps {
  priority?: Priority
  onChange: (priority?: Priority) => void
  className?: string
}

const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', emoji: '🟥', color: '#E74C3C' },
  HIGH: { label: 'High', emoji: '🟧', color: '#E67E22' },
  MEDIUM: { label: 'Normal', emoji: '🟨', color: '#F1C40F' },
  LOW: { label: 'Low', emoji: '🟩', color: '#2ECC71' },
} as const

const CLEAR_COLOR = '#BDC3C7'

export function PrioritySelector({
  priority,
  onChange,
  className,
}: PrioritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Update menu position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      })
    }
  }, [isOpen])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    return undefined
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
    return undefined
  }, [isOpen])

  const handleSelect = (newPriority?: Priority) => {
    onChange(newPriority)
    setIsOpen(false)
  }

  const currentConfig = priority ? PRIORITY_CONFIG[priority] : null
  const flagColor = currentConfig?.color || CLEAR_COLOR

  return (
    <div className={`relative ${className || ''}`}>
      {/* Flag button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-white/15 hover:scale-110 active:scale-95"
        title={currentConfig?.label || 'Set priority'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 2L3 14M3 2L13 6L3 8V2Z"
            stroke={flagColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={flagColor}
            fillOpacity="0.4"
          />
        </svg>
      </button>

      {/* Priority menu - Using Portal to escape stacking context */}
      {isOpen && (
        <Portal>
          <div
            ref={menuRef}
            className="fixed rounded-xl shadow-2xl border min-w-[240px]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              background: 'linear-gradient(135deg, #1f1f1f 0%, #1a1a1a 100%)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              zIndex: 99999,
            }}
          >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10">
            <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
              Task Priority
            </span>
          </div>

          {/* Options */}
          <div className="py-2">
            {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(
              ([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-all hover:bg-white/15 active:scale-[0.98]"
                  style={{ color: config.color }}
                >
                  <span className="text-2xl leading-none">{config.emoji}</span>
                  <span className="font-semibold text-base">{config.label}</span>
                  {priority === key && (
                    <span className="ml-auto text-blue-400 text-lg">✓</span>
                  )}
                </button>
              )
            )}

            {/* Clear option */}
            <div className="mt-1 pt-1 border-t border-white/10">
              <button
                onClick={() => handleSelect(undefined)}
                className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-all hover:bg-white/15 active:scale-[0.98]"
                style={{ color: '#e5e5e5' }}
              >
                <span className="text-2xl leading-none">⚪</span>
                <span className="font-semibold text-base">Clear</span>
                {!priority && (
                  <span className="ml-auto text-blue-400 text-lg">✓</span>
                )}
              </button>
            </div>
          </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
