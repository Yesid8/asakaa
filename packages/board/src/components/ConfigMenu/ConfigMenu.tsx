import { useState, useRef, useEffect } from 'react'
import { cn } from '../../utils'

export interface ConfigMenuProps {
  onOpenExport: () => void
  onOpenThemes: () => void
  onOpenShortcuts: () => void
  className?: string
}

export function ConfigMenu({
  onOpenExport,
  onOpenThemes,
  onOpenShortcuts,
  className,
}: ConfigMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleItemClick = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border"
        style={{
          backgroundColor: 'var(--theme-bg-secondary)',
          borderColor: 'var(--theme-border-primary)',
          color: 'var(--theme-text-secondary)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)'
          e.currentTarget.style.color = 'var(--theme-text-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--theme-bg-secondary)'
          e.currentTarget.style.color = 'var(--theme-text-secondary)'
        }}
        aria-label="Configuration Menu"
        aria-expanded={isOpen}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2" />
        </svg>
        <span>Config</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-lg border shadow-lg overflow-hidden z-50"
          style={{
            backgroundColor: 'var(--theme-bg-secondary)',
            borderColor: 'var(--theme-border-primary)',
          }}
        >
          <button
            onClick={() => handleItemClick(onOpenExport)}
            className="w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3"
            style={{ color: 'var(--theme-text-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export
          </button>

          <button
            onClick={() => handleItemClick(onOpenThemes)}
            className="w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3"
            style={{ color: 'var(--theme-text-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v6m0 6v6m8.5-8.5L17 15M7 9L3.5 5.5M7 15l-3.5 3.5M20.5 5.5L17 9m3.5 11.5L17 17" />
            </svg>
            Themes
          </button>

          <button
            onClick={() => handleItemClick(onOpenShortcuts)}
            className="w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3"
            style={{ color: 'var(--theme-text-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
            </svg>
            Shortcuts
          </button>
        </div>
      )}
    </div>
  )
}
