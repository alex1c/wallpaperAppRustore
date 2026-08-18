import type { WallpaperCalculationError } from './errors'
import type {
  RecommendationReasonCode,
  RollPurchaseRecommendation,
  WallpaperCalculationResult,
} from './types'
import { validateMinimumRollsForRecommendation } from './validation'

/** Reason codes when a spare roll is suggested — domain enums, not UI copy. */
const SPARE_ROLL_REASON_CODES: RecommendationReasonCode[] = [
  'GENERAL_INSTALLATION_RESERVE',
  'PATTERN_MATCHING_RISK',
  'BATCH_DYE_LOT_REPAIR',
  'DAMAGE_OR_MISCUT_BUFFER',
]

export type RollPurchaseRecommendationOutcome =
  | { ok: true; result: RollPurchaseRecommendation }
  | { ok: false; error: WallpaperCalculationError }

/**
 * Product purchase recommendation — explicitly separate from minimumRolls math.
 *
 * Phase 2.1 policy (documented in WALLPAPER_PRODUCT_SPEC):
 * - minimumRolls === 1 → no spare suggested
 * - minimumRolls >= 2 → suggest 1 spare roll with reason codes
 */
export function recommendRollPurchase(
  minimumRolls: number,
  options?: { patternApplied?: boolean },
): RollPurchaseRecommendationOutcome {
  const validated = validateMinimumRollsForRecommendation(minimumRolls)
  if (!validated.ok) {
    return validated
  }

  const safeMinimumRolls = validated.minimumRolls

  if (safeMinimumRolls <= 1) {
    return {
      ok: true,
      result: {
        minimumRolls: safeMinimumRolls,
        suggestedSpareRolls: 0,
        suggestedTotalRolls: safeMinimumRolls,
        reasonCodes: [],
      },
    }
  }

  const reasonCodes = [...SPARE_ROLL_REASON_CODES]
  if (options?.patternApplied === false) {
    // Pattern risk still listed as general guidance; no code removal needed.
  }

  return {
    ok: true,
    result: {
      minimumRolls: safeMinimumRolls,
      suggestedSpareRolls: 1,
      suggestedTotalRolls: safeMinimumRolls + 1,
      reasonCodes,
    },
  }
}

/** Convenience wrapper using a full calculation result. */
export function recommendRollPurchaseFromResult(
  result: WallpaperCalculationResult,
): RollPurchaseRecommendationOutcome {
  return recommendRollPurchase(result.minimumRolls, {
    patternApplied: result.patternApplied,
  })
}

/** @deprecated Use recommendRollPurchase */
export function recommendRolls(minimumRolls: number) {
  const recommendation = recommendRollPurchase(minimumRolls)
  if (!recommendation.ok) {
    return {
      minimumRolls: 0,
      recommendedRolls: 0,
      spareRollCount: 0,
      reasonCodes: [] as RecommendationReasonCode[],
    }
  }

  return {
    minimumRolls: recommendation.result.minimumRolls,
    recommendedRolls: recommendation.result.suggestedTotalRolls,
    spareRollCount: recommendation.result.suggestedSpareRolls,
    reasonCodes: recommendation.result.reasonCodes,
  }
}
