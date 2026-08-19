import type { PatternConfig } from '@/domain/wallpaper'
import type { Millimeters } from '@/units'
import { parseCentimetersInputToMillimeters } from '@/units/parse-decimal-input'
import type { ParseDecimalInputErrorCode } from '@/units/parse-decimal-input'
import {
  buildDomainPatternConfig,
  DEFAULT_PATTERN_FORM_VALUES,
  type PatternFormValues,
  type UiPatternMatchId,
} from '@/features/wallpaper/pattern/pattern-match-types'

export type PatternFormFieldKey = 'repeatCm'

export type ParsePatternFormOutcome =
  | { ok: true; pattern: PatternConfig | undefined }
  | { ok: false; fieldErrors: Partial<Record<PatternFormFieldKey, ParseDecimalInputErrorCode>> }
  | { ok: false; halfDropDeferred: true }

/**
 * Parses pattern UI form into domain-ready pattern config.
 * Half-drop is intentionally blocked — domain does not support it yet.
 */
export function parsePatternForm(values: PatternFormValues): ParsePatternFormOutcome {
  if (values.matchType === 'half-drop') {
    return { ok: false, halfDropDeferred: true }
  }

  if (values.matchType === 'free') {
    return { ok: true, pattern: undefined }
  }

  const repeat = parseCentimetersInputToMillimeters(values.repeatCm)

  if (!repeat.ok) {
    return {
      ok: false,
      fieldErrors: { repeatCm: repeat.code },
    }
  }

  return {
    ok: true,
    pattern: buildDomainPatternConfig(
      values.matchType,
      repeat.valueMm as Millimeters,
    ),
  }
}

/** Merges parsed quick input with optional pattern for domain calculation. */
export function withPatternInput(
  input: import('@/domain/wallpaper').QuickWallpaperCalculationInput,
  pattern: PatternConfig | undefined,
): import('@/domain/wallpaper').QuickWallpaperCalculationInput {
  if (pattern === undefined) {
    return input
  }

  return {
    ...input,
    pattern,
  }
}

export type { PatternFormValues, UiPatternMatchId }
export { DEFAULT_PATTERN_FORM_VALUES }
