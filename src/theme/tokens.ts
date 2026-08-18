/**
 * Design tokens for the foundation UI.
 * Final visual design will be applied in later product phases.
 */
export const colors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  textPrimary: '#1A1D26',
  textSecondary: '#5C6370',
  border: '#E2E5EB',
  accent: '#2563EB',
  accentPressed: '#1D4ED8',
  success: '#15803D',
  warning: '#B45309',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
} as const

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
} as const

export const theme = {
  colors,
  spacing,
  typography,
  radii,
} as const

export type Theme = typeof theme
