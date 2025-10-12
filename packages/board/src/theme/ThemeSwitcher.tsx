/**
 * Theme Switcher Component
 * ASAKAA v0.5.0
 */

import { useTheme } from './ThemeProvider'
import type { ThemeName } from './types'
import './theme-switcher.css'

export interface ThemeSwitcherProps {
  /** Show labels for each theme */
  showLabels?: boolean
  /** Compact mode (icon-only) */
  compact?: boolean
  /** Custom class name */
  className?: string
}

export function ThemeSwitcher({ showLabels = true, compact = false, className = '' }: ThemeSwitcherProps) {
  const { theme: currentTheme, setTheme, themes } = useTheme()

  const themeIcons: Record<ThemeName, string> = {
    dark: '🌙',
    light: '☀️',
    neutral: '⚪',
  }

  return (
    <div className={`theme-switcher ${compact ? 'theme-switcher--compact' : ''} ${className}`}>
      {Object.entries(themes).map(([key, themeData]) => {
        const themeName = key as ThemeName
        const isActive = themeName === currentTheme

        return (
          <button
            key={themeName}
            onClick={() => setTheme(themeName)}
            className={`theme-switcher__button ${isActive ? 'theme-switcher__button--active' : ''}`}
            aria-label={`Switch to ${themeData.displayName} theme`}
            aria-pressed={isActive}
            title={themeData.displayName}
          >
            <span className="theme-switcher__icon" aria-hidden="true">
              {themeIcons[themeName]}
            </span>
            {showLabels && !compact && <span className="theme-switcher__label">{themeData.displayName}</span>}
          </button>
        )
      })}
    </div>
  )
}
