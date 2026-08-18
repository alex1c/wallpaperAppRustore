import { rectangleAreaMm } from '@/units'
import type { SquareMillimeters } from '@/units'
import {
  applyCornerAllowance,
  DEFAULT_QUICK_CORNER_POLICY,
} from './corner-policy'
import {
  calculateRequiredStrips,
  calculateTotalWallWidthMm,
} from './geometry'
import { calculateMaterialBreakdown } from './material-breakdown'
import { buildPhysicalRollPlan, countMaxStripsOnRoll } from './roll-planning'
import {
  calculatePatternStepMm,
  calculateRawStripLengthMm,
} from './strip-length'
import type {
  PatternPhaseMetadata,
  WallpaperCalculationInput,
  WallpaperCalculationResult,
  WallpaperCalculationTrace,
} from './types'
import type { WallpaperCalculationOutcome } from './errors'
import {
  validateCalculationInput,
  validateStripFitsOnRoll,
} from './validation'

/**
 * Core strip-based wallpaper calculation engine.
 * Phase 2.1: physical roll planner, corner policy, uniform wall heights only.
 */
export function calculateWallpaper(
  input: WallpaperCalculationInput | unknown,
): WallpaperCalculationOutcome<WallpaperCalculationResult> {
  const validated = validateCalculationInput(input)
  if (!validated.ok) {
    return validated
  }

  const normalized = validated.input
  const cornerPolicy = normalized.cornerAllowance ?? DEFAULT_QUICK_CORNER_POLICY
  const totalWallWidthMm = calculateTotalWallWidthMm(normalized.walls)
  const adjustedWallWidthMm = applyCornerAllowance(totalWallWidthMm, cornerPolicy)
  const requiredStrips = calculateRequiredStrips(
    adjustedWallWidthMm,
    normalized.roll.widthMm,
  )

  const wallHeightMm = normalized.walls[0].heightMm
  const rawStripLengthMm = calculateRawStripLengthMm(
    wallHeightMm,
    normalized.trim.topMm,
    normalized.trim.bottomMm,
  )

  const {
    patternStepMm,
    patternApplied,
    patternMatch,
    patternRepeatMm,
  } = calculatePatternStepMm(rawStripLengthMm, normalized.pattern)

  const stripsPerFullRoll = countMaxStripsOnRoll(
    normalized.roll.lengthMm,
    rawStripLengthMm,
    patternStepMm,
  )

  const stripValidation = validateStripFitsOnRoll(
    stripsPerFullRoll,
    rawStripLengthMm,
    normalized.roll.lengthMm,
  )
  if (!stripValidation.ok) {
    return stripValidation
  }

  const rollPlan = buildPhysicalRollPlan({
    requiredStrips,
    rollLengthMm: normalized.roll.lengthMm,
    rawStripLengthMm,
    patternStepMm,
  })

  const patternPhase: PatternPhaseMetadata = {
    assumesNewRollStartsAtPhaseZero: true,
    minimumRollsDependsOnPhaseAssumption: patternApplied,
  }

  const trace: WallpaperCalculationTrace = {
    totalWallWidthMm,
    cornerAllowanceMm: cornerPolicy.totalCornerAllowanceMm,
    adjustedWallWidthMm,
    requiredStrips,
    wallHeightMm,
    topTrimMm: normalized.trim.topMm,
    bottomTrimMm: normalized.trim.bottomMm,
    rawStripLengthMm,
    patternMatch,
    patternRepeatMm,
    patternStepMm,
    rollWidthMm: normalized.roll.widthMm,
    rollLengthMm: normalized.roll.lengthMm,
    stripsPerFullRoll: rollPlan.stripsPerFullRoll,
    minimumRolls: rollPlan.minimumRolls,
    rollUsage: rollPlan.rollUsage,
    patternPhase,
  }

  const material = calculateMaterialBreakdown(
    rollPlan.rollUsage,
    normalized.roll.lengthMm,
    rawStripLengthMm,
    requiredStrips,
  )

  const informationalWallAreaMm2 = normalized.walls.reduce(
    (sum, wall) => sum + rectangleAreaMm(wall.widthMm, wall.heightMm),
    0,
  ) as SquareMillimeters

  return {
    ok: true,
    result: {
      trace,
      material,
      requiredStrips,
      rawStripLengthMm,
      patternStepMm,
      stripsPerFullRoll: rollPlan.stripsPerFullRoll,
      minimumRolls: rollPlan.minimumRolls,
      rollUsage: rollPlan.rollUsage,
      patternApplied,
      patternMatch,
      informationalWallAreaMm2,
    },
  }
}
