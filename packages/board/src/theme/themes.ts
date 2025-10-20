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
    // Background colors
    bgPrimary: '#222326',
    bgSecondary: '#2A2B2F',
    bgTertiary: '#33343A',
    bgCard: '#2d2d2d',
    bgHover: '#353535',
    bgActive: '#404040',
    bgInput: '#2a2a2a',

    // Text colors
    textPrimary: '#F4F5F8',
    textSecondary: '#AEB6C0',
    textTertiary: '#7A7F8A',
    textDisabled: '#606060',
    textInverse: '#1a1a1a',

    // Border colors
    borderPrimary: 'rgba(255, 255, 255, 0.1)',
    borderSecondary: 'rgba(255, 255, 255, 0.05)',
    borderDefault: '#404040',
    borderHover: '#505050',
    borderSubtle: '#2a2a2a',

    // Interactive colors
    accentPrimary: '#5E6AD2',
    accentHover: '#7780DD',
    interactivePrimary: '#0ea5e9',
    interactivePrimaryHover: '#0284c7',
    interactivePrimaryBorder: 'rgba(14, 165, 233, 0.3)',
    interactivePrimaryBackground: 'rgba(14, 165, 233, 0.1)',
    interactivePrimaryBackgroundHover: 'rgba(14, 165, 233, 0.2)',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    danger: '#ef4444',
    dangerBorder: 'rgba(239, 68, 68, 0.3)',
    dangerBackground: 'rgba(239, 68, 68, 0.1)',
    dangerBackgroundHover: 'rgba(239, 68, 68, 0.2)',
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
    // Background colors
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F7F7F8',
    bgTertiary: '#EEEFF1',
    bgCard: '#ffffff',
    bgHover: '#f3f4f6',
    bgActive: '#e5e7eb',
    bgInput: '#f9fafb',

    // Text colors
    textPrimary: '#1A1A1A',
    textSecondary: '#5A5A5A',
    textTertiary: '#8A8A8A',
    textDisabled: '#d1d5db',
    textInverse: '#ffffff',

    // Border colors
    borderPrimary: 'rgba(0, 0, 0, 0.1)',
    borderSecondary: 'rgba(0, 0, 0, 0.05)',
    borderDefault: '#e5e7eb',
    borderHover: '#d1d5db',
    borderSubtle: '#f3f4f6',

    // Interactive colors
    accentPrimary: '#5E6AD2',
    accentHover: '#4A56B8',
    interactivePrimary: '#0ea5e9',
    interactivePrimaryHover: '#0284c7',
    interactivePrimaryBorder: 'rgba(14, 165, 233, 0.3)',
    interactivePrimaryBackground: 'rgba(14, 165, 233, 0.08)',
    interactivePrimaryBackgroundHover: 'rgba(14, 165, 233, 0.15)',

    // Status colors
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
    danger: '#dc2626',
    dangerBorder: 'rgba(220, 38, 38, 0.3)',
    dangerBackground: 'rgba(220, 38, 38, 0.08)',
    dangerBackgroundHover: 'rgba(220, 38, 38, 0.15)',
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
    // Background colors
    bgPrimary: '#F5F5F5',
    bgSecondary: '#EBEBEB',
    bgTertiary: '#E0E0E0',
    bgCard: '#27272a',
    bgHover: '#3f3f46',
    bgActive: '#52525b',
    bgInput: '#27272a',

    // Text colors
    textPrimary: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textTertiary: '#7A7A7A',
    textDisabled: '#52525b',
    textInverse: '#18181b',

    // Border colors
    borderPrimary: 'rgba(0, 0, 0, 0.15)',
    borderSecondary: 'rgba(0, 0, 0, 0.08)',
    borderDefault: '#3f3f46',
    borderHover: '#52525b',
    borderSubtle: '#27272a',

    // Interactive colors
    accentPrimary: '#000000',
    accentHover: '#2A2A2A',
    interactivePrimary: '#0ea5e9',
    interactivePrimaryHover: '#0284c7',
    interactivePrimaryBorder: 'rgba(14, 165, 233, 0.3)',
    interactivePrimaryBackground: 'rgba(14, 165, 233, 0.1)',
    interactivePrimaryBackgroundHover: 'rgba(14, 165, 233, 0.2)',

    // Status colors (minimal in Zen mode)
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    danger: '#ef4444',
    dangerBorder: 'rgba(239, 68, 68, 0.3)',
    dangerBackground: 'rgba(239, 68, 68, 0.1)',
    dangerBackgroundHover: 'rgba(239, 68, 68, 0.2)',
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
