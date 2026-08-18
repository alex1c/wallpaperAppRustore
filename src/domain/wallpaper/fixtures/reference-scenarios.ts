import type { QuickWallpaperCalculationInput } from '@/domain/wallpaper'
import { ZERO_CORNER_POLICY } from '../corner-policy'
import { metersToMillimeters } from '@/units'

/**
 * Reference room for scenarios A, B, C — 4.0 × 3.0 m, height 2.7 m.
 * Default corner allowance (80 mm) does not change strip count for this room.
 */
export const REFERENCE_ROOM_4X3: QuickWallpaperCalculationInput['room'] = {
  lengthMm: metersToMillimeters(4),
  widthMm: metersToMillimeters(3),
  heightMm: metersToMillimeters(2.7),
}

/** Wide roll 1.06 × 10.05 m — scenarios A and B. */
export const REFERENCE_ROLL_WIDE: QuickWallpaperCalculationInput['roll'] = {
  widthMm: metersToMillimeters(1.06),
  lengthMm: metersToMillimeters(10.05),
}

/** Narrow roll 0.53 × 10.05 m — scenario C. */
export const REFERENCE_ROLL_NARROW: QuickWallpaperCalculationInput['roll'] = {
  widthMm: metersToMillimeters(0.53),
  lengthMm: metersToMillimeters(10.05),
}

/** Straight match with 640 mm vertical repeat — scenario B. */
export const REFERENCE_PATTERN_STRAIGHT_640 = {
  match: 'straight' as const,
  repeatMm: 640 as import('@/units').Millimeters,
}

/**
 * Scenario E — exact boundary; zero corner to avoid disturbing width math.
 * totalWallWidth = 12 000 → 12 strips; raw strip = 2800 → 4/roll → 3 rolls.
 */
export const SCENARIO_E_INPUT: QuickWallpaperCalculationInput = {
  room: {
    lengthMm: metersToMillimeters(3),
    widthMm: metersToMillimeters(3),
    heightMm: metersToMillimeters(2.7),
  },
  roll: {
    widthMm: metersToMillimeters(1),
    lengthMm: metersToMillimeters(11.2),
  },
  cornerAllowance: ZERO_CORNER_POLICY,
}

/** Scenario D — physical strip longer than roll. */
export const SCENARIO_D_INPUT: QuickWallpaperCalculationInput = {
  room: {
    lengthMm: metersToMillimeters(4),
    widthMm: metersToMillimeters(3),
    heightMm: metersToMillimeters(10),
  },
  roll: {
    widthMm: metersToMillimeters(1.06),
    lengthMm: metersToMillimeters(10.05),
  },
}

/**
 * Scenario A expected (hand-calculated, default 80 mm corner):
 * totalWallWidth = 14 000; adjusted = 14 080; strips = ceil(14080/1060) = 14
 * raw = 2800; patternStep = 2800; 3/roll; min 5 rolls
 */
export const SCENARIO_A_EXPECTED = {
  totalWallWidthMm: 14_000,
  cornerAllowanceMm: 80,
  adjustedWallWidthMm: 14_080,
  requiredStrips: 14,
  rawStripLengthMm: 2_800,
  patternStepMm: 2_800,
  stripsPerFullRoll: 3,
  minimumRolls: 5,
  lastRollStrips: 2,
  totalPhysicalCutLengthMm: 39_200,
}

/**
 * Scenario B expected (physical planner, not patternStep × count):
 * patternStep = 3200; 3 strips/roll on 10050 (ends at 9200); min 5 rolls
 * physical wall material = 14 × 2800 = 39200
 * alignment loss = 4×800 + 400 = 3600
 */
export const SCENARIO_B_EXPECTED = {
  patternStepMm: 3_200,
  stripsPerFullRoll: 3,
  minimumRolls: 5,
  totalPhysicalCutLengthMm: 39_200,
  totalPatternAlignmentLossMm: 3_600,
}

/** Scenario C: adjusted 14080 / 530 = 27 strips; min 9 rolls */
export const SCENARIO_C_EXPECTED = {
  requiredStrips: 27,
  minimumRolls: 9,
}

/** Scenario E with zero corner */
export const SCENARIO_E_EXPECTED = {
  requiredStrips: 12,
  stripsPerFullRoll: 4,
  minimumRolls: 3,
}

/** Codex straight-match physical regression */
export const STRAIGHT_PHYSICAL_REGRESSION = {
  rawStripLengthMm: 2_800,
  repeatMm: 640,
  patternStepMm: 3_200,
  rollLength9200: 9_200,
  expectedStripsOn9200: 3,
  expectedLastEnd9200: 9_200,
  expectedStarts9200: [0, 3_200, 6_400],
}
