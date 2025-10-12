/**
 * Theme Provider
 * ASAKAA v0.5.0
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { ThemeName, ThemeContextValue } from './types'
import { themes, defaultTheme } from './themes'
import './theme-overrides.css'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'asakaa-theme'

export interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: ThemeName
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme: initialTheme = defaultTheme,
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored && (stored === 'dark' || stored === 'light' || stored === 'neutral')) {
        return stored as ThemeName
      }
    }
    return initialTheme
  })

  const setTheme = useCallback(
    (newTheme: ThemeName) => {
      setThemeState(newTheme)
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme)
      }
    },
    [storageKey]
  )

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const currentTheme = themes[theme]

    // Set CSS variables
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--theme-${camelToKebab(key)}`, value)
      }
    })

    Object.entries(currentTheme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--theme-shadow-${key}`, value)
    })

    Object.entries(currentTheme.radii).forEach(([key, value]) => {
      root.style.setProperty(`--theme-radius-${key}`, value)
    })

    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--theme-spacing-${key}`, value)
    })

    // Set data attribute for theme-specific styles
    root.setAttribute('data-theme', theme)

    // Set class for backward compatibility
    root.classList.remove('theme-dark', 'theme-light', 'theme-neutral')
    root.classList.add(`theme-${theme}`)
  }, [theme])

  const value: ThemeContextValue = {
    theme,
    setTheme,
    themes,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

/**
 * Utility: Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}
