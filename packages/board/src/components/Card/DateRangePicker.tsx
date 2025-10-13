/**
 * Date Range Picker Component
 * Quick selection buttons + interactive calendar
 */

import { useState, useRef, useEffect } from 'react'
import { Portal } from '../Portal'

export interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onChange: (startDate?: string, endDate?: string) => void
  className?: string
}

const QUICK_OPTIONS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'Next Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '4 Weeks', days: 28 },
  { label: '8 Weeks', days: 56 },
]

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className,
}: DateRangePickerProps) {
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

  const handleQuickSelect = (days: number) => {
    const today = new Date()
    const end = new Date(today)
    end.setDate(end.getDate() + days)

    onChange(
      today.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    )
    setIsOpen(false)
  }

  const formatDateRange = () => {
    if (!startDate || !endDate) return 'Set date'

    // Parse dates as local timezone to avoid UTC conversion issues
    const parseLocalDate = (dateStr: string | Date) => {
      if (dateStr instanceof Date) return dateStr
      // Handle invalid date strings
      if (typeof dateStr !== 'string' || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return null
      }
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    }

    const start = parseLocalDate(startDate)
    const end = parseLocalDate(endDate)

    // Return 'Set date' if parsing failed
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Set date'
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return `${monthNames[start.getMonth()]} ${start.getDate()} – ${monthNames[end.getMonth()]} ${end.getDate()}`
  }

  return (
    <div className={`relative ${className || ''}`}>
      {/* Date button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:bg-white/15 hover:scale-105 active:scale-95"
        style={{ color: startDate ? '#60a5fa' : '#d4d4d4' }}
        title={startDate && endDate ? `${formatDateRange()}` : 'Set date range'}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="3"
            width="12"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M11 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {startDate && endDate && (
          <span className="font-semibold whitespace-nowrap text-sm">{formatDateRange()}</span>
        )}
      </button>

      {/* Date picker menu - Using Portal to escape stacking context */}
      {isOpen && (
        <Portal>
          <div
            ref={menuRef}
            className="fixed rounded-xl shadow-2xl border min-w-[320px]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              background: 'linear-gradient(135deg, #1f1f1f 0%, #1a1a1a 100%)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              zIndex: 99999,
            }}
          >
          {/* Quick selection */}
          <div className="p-4 border-b border-white/10">
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider block mb-3">
              Quick Select
            </span>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleQuickSelect(option.days)}
                  className="px-3 py-2.5 rounded-lg text-xs font-semibold transition-all hover:bg-blue-600/30 active:scale-95 border"
                  style={{
                    color: '#60a5fa',
                    borderColor: 'rgba(96, 165, 250, 0.3)',
                    background: 'rgba(96, 165, 250, 0.08)',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Manual date inputs */}
          <div className="p-4">
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider block mb-3">
              Custom Range
            </span>
            <div className="space-y-3">
              <input
                type="date"
                value={startDate || ''}
                onChange={(e) => onChange(e.target.value, endDate)}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/20 text-white placeholder-white/50 focus:border-blue-500/50 focus:outline-none transition-all"
                style={{ colorScheme: 'dark' }}
              />
              <input
                type="date"
                value={endDate || ''}
                onChange={(e) => onChange(startDate, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/20 text-white placeholder-white/50 focus:border-blue-500/50 focus:outline-none transition-all"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Clear button */}
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  onChange(undefined, undefined)
                  setIsOpen(false)
                }}
                className="mt-4 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-red-600/30 active:scale-95 border"
                style={{
                  color: '#f87171',
                  borderColor: 'rgba(248, 113, 113, 0.3)',
                  background: 'rgba(248, 113, 113, 0.08)',
                }}
              >
                Clear Dates
              </button>
            )}
          </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
