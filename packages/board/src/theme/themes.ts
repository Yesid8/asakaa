/**
 * Theme Definitions
 * ASAKAA v0.5.0 - Elite Theming System
 */

import type { Theme, ThemeName } from './types'

/**
 * DARK THEME (Enhanced) - DEFAULT
 * Philosophy: Speed, efficiency, focus
 * Optimized for developer productivity
 */
export const darkTheme: Theme = {
  name: 'dark',
  displayName: 'Dark (Enhanced)',
  emoji: '🌙',
  colors: {
    bgPrimary: '#222326',
    bgSecondary: '#2A2B2F',
    bgTertiary: '#33343A',
    textPrimary: '#F4F5F8',
    textSecondary: '#AEB6C0',
    textTertiary: '#7A7F8A',
    accentPrimary: '#5E6AD2',
    accentHover: '#7780DD',
    borderPrimary: 'rgba(255, 255, 255, 0.1)',
    borderSecondary: 'rgba(255, 255, 255, 0.05)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.5)',
  },
  radii: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
}

/**
 * LIGHT THEME (Accessible Standard)
 * Philosophy: Clarity, legibility, professionalism
 * WCAG AAA compliant (7:1 contrast)
 */
export const lightTheme: Theme = {
  name: 'light',
  displayName: 'Light (Standard)',
  emoji: '☀️',
  colors: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F7F7F8',
    bgTertiary: '#EEEFF1',
    textPrimary: '#1A1A1A',
    textSecondary: '#5A5A5A',
    textTertiary: '#8A8A8A',
    accentPrimary: '#5E6AD2',
    accentHover: '#4A56B8',
    borderPrimary: 'rgba(0, 0, 0, 0.1)',
    borderSecondary: 'rgba(0, 0, 0, 0.05)',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 12px rgba(0, 0, 0, 0.15)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.2)',
  },
  radii: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
}

/**
 * NEUTRAL THEME (Zen Mode)
 * Philosophy: Minimalism, calm technology, maximum concentration
 * Strictly monochromatic - states communicated via icons/typography
 */
export const neutralTheme: Theme = {
  name: 'neutral',
  emoji: '⚪',
  displayName: 'Neutral (Zen)',
  colors: {
    bgPrimary: '#F5F5F5',
    bgSecondary: '#EBEBEB',
    bgTertiary: '#E0E0E0',
    textPrimary: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textTertiary: '#7A7A7A',
    accentPrimary: '#000000',
    accentHover: '#2A2A2A',
    borderPrimary: 'rgba(0, 0, 0, 0.15)',
    borderSecondary: 'rgba(0, 0, 0, 0.08)',
    // No color states - only monochrome
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 12px rgba(0, 0, 0, 0.12)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.15)',
  },
  radii: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
}

/**
 * All themes registry
 */
export const themes: Record<ThemeName, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  neutral: neutralTheme,
}

/**
 * Default theme
 */
export const defaultTheme: ThemeName = 'dark'
