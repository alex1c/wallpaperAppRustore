import type {
  PatternFormValues,
  UiPatternMatchId,
} from './pattern-match-types'

/**
 * Updates a pattern draft and invalidates any result calculated from its
 * previous values. Kept pure apart from the explicit invalidation callback so
 * lifecycle transitions remain regression-testable without React rendering.
 */
export function changePatternMatchDraft(
  current: PatternFormValues,
  matchType: UiPatternMatchId,
  invalidateResult: () => void,
): PatternFormValues {
  invalidateResult()
  return { ...current, matchType }
}

export function changePatternRepeatDraft(
  current: PatternFormValues,
  repeatCm: string,
  invalidateResult: () => void,
): PatternFormValues {
  invalidateResult()
  return { ...current, repeatCm }
}
