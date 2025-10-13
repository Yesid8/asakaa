/**
 * Theme System Types
 * ASAKAA v0.5.0
 */

export type ThemeName = 'dark' | 'light' | 'neutral'

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string

  // Text
  textPrimary: string
  textSecondary: string
  textTertiary: string

  // Accent
  accentPrimary: string
  accentHover: string

  // Borders
  borderPrimary: string
  borderSecondary: string

  // States
  success?: string
  warning?: string
  error?: string
  info?: string
}

export interface Theme {
  name: ThemeName
  displayName: string
  emoji: string
  colors: ThemeColors

  // Additional theme properties
  shadows: {
    sm: string
    md: string
    lg: string
  }

  radii: {
    sm: string
    md: string
    lg: string
    full: string
  }

  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

export interface ThemeContextValue {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  themes: Record<ThemeName, Theme>
}
