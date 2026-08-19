import type { PatternConfig, PatternMatch } from '@/domain/wallpaper'

/** UI-facing pattern match identifiers — human labels live in i18n. */
export type UiPatternMatchId = PatternMatch

export interface PatternFormValues {
  matchType: UiPatternMatchId
  /** Repeat size in centimeters — required for straight match. */
  repeatCm: string
}

export const DEFAULT_PATTERN_FORM_VALUES: PatternFormValues = {
  matchType: 'straight',
  repeatCm: '64',
}

/** Whether the UI allows submitting a domain calculation for this match type. */
export function isPatternMatchCalculable(matchType: UiPatternMatchId): boolean {
  return matchType === 'free' || matchType === 'straight'
}

/**
 * Builds domain pattern config from validated repeat mm.
 * Returns undefined for free match (domain default).
 */
export function buildDomainPatternConfig(
  matchType: UiPatternMatchId,
  repeatMm: import('@/units').Millimeters | null,
): PatternConfig | undefined {
  if (matchType === 'free') {
    return undefined
  }

  if (matchType === 'straight' && repeatMm !== null) {
    return {
      match: 'straight',
      repeatMm,
    }
  }

  return undefined
}
