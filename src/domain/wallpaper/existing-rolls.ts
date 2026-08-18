import type { WallpaperCalculationError, WallpaperCalculationOutcome } from './errors'
import type {
  ExistingFullRollsAssessment,
  WallpaperCalculationResult,
} from './types'
import { validateOwnedFullRolls } from './validation'

export type ExistingFullRollsOutcome =
  | { ok: true; result: ExistingFullRollsAssessment }
  | { ok: false; error: WallpaperCalculationError }

/** @deprecated Use ExistingFullRollsOutcome */
export type ExistingRollsOutcome = ExistingFullRollsOutcome

/**
 * Compares owned identical full unused rolls against a completed calculation.
 * Partial rolls and mixed batch sizes are deferred.
 */
export function assessOwnedFullRolls(
  calculation: WallpaperCalculationResult,
  ownedFullRolls: number,
): ExistingFullRollsOutcome {
  const ownedValidation = validateOwnedFullRolls(ownedFullRolls)
  if (!ownedValidation.ok) {
    return ownedValidation
  }

  const {
    minimumRolls,
    requiredStrips,
    stripsPerFullRoll,
  } = calculation

  const availableStrips = ownedFullRolls * stripsPerFullRoll
  const missingStrips = Math.max(0, requiredStrips - availableStrips)
  const shortageRolls = Math.max(0, minimumRolls - ownedFullRolls)
  const surplusRolls = Math.max(0, ownedFullRolls - minimumRolls)

  return {
    ok: true,
    result: {
      ownedFullRolls,
      minimumRolls,
      requiredStrips,
      stripsPerFullRoll,
      availableStrips,
      missingStrips,
      shortageRolls,
      surplusRolls,
      isSufficient: ownedFullRolls >= minimumRolls,
    },
  }
}

/** @deprecated Use assessOwnedFullRolls */
export function assessExistingRolls(
  calculation: WallpaperCalculationResult,
  ownedRolls: number,
) {
  return assessOwnedFullRolls(calculation, ownedRolls)
}

/** Convenience: run calculation then assess owned full rolls. */
export function assessOwnedFullRollsFromCalculation<TInput>(
  calculate: (input: TInput) => WallpaperCalculationOutcome<WallpaperCalculationResult>,
  input: TInput,
  ownedFullRolls: number,
):
  | { ok: true; calculation: WallpaperCalculationResult; assessment: ExistingFullRollsAssessment }
  | { ok: false; error: WallpaperCalculationError } {
  const calculationOutcome = calculate(input)
  if (!calculationOutcome.ok) {
    return calculationOutcome
  }

  const assessmentOutcome = assessOwnedFullRolls(
    calculationOutcome.result,
    ownedFullRolls,
  )
  if (!assessmentOutcome.ok) {
    return assessmentOutcome
  }

  return {
    ok: true,
    calculation: calculationOutcome.result,
    assessment: assessmentOutcome.result,
  }
}

/** @deprecated Use assessOwnedFullRollsFromCalculation */
export function assessExistingRollsFromCalculation<TInput>(
  calculate: (input: TInput) => WallpaperCalculationOutcome<WallpaperCalculationResult>,
  input: TInput,
  ownedRolls: number,
) {
  return assessOwnedFullRollsFromCalculation(calculate, input, ownedRolls)
}
