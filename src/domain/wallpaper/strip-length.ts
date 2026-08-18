import type { Millimeters } from '@/units'
import type { PatternConfig, PatternMatch } from './types'

/**
 * Physical strip length before pattern alignment — wall height plus trim.
 * All walls must share the same height in Phase 2.1.
 */
export function calculateRawStripLengthMm(
  wallHeightMm: Millimeters,
  topTrimMm: Millimeters,
  bottomTrimMm: Millimeters,
): Millimeters {
  return (wallHeightMm + topTrimMm + bottomTrimMm) as Millimeters
}

/**
 * Pattern step — vertical distance between consecutive strip start positions
 * on a roll when matching a straight repeat.
 *
 * For free match, step equals physical cut length (strips abut with no gap).
 */
export function calculatePatternStepMm(
  rawStripLengthMm: Millimeters,
  pattern: PatternConfig | undefined,
): {
  patternStepMm: Millimeters
  patternApplied: boolean
  patternMatch: PatternMatch
  patternRepeatMm?: Millimeters
} {
  const patternMatch = pattern?.match ?? 'free'

  if (patternMatch === 'free') {
    return {
      patternStepMm: rawStripLengthMm,
      patternApplied: false,
      patternMatch: 'free',
    }
  }

  if (patternMatch === 'half-drop') {
    return {
      patternStepMm: rawStripLengthMm,
      patternApplied: false,
      patternMatch: 'half-drop',
    }
  }

  const repeatMm = pattern?.repeatMm
  if (repeatMm === undefined) {
    return {
      patternStepMm: rawStripLengthMm,
      patternApplied: false,
      patternMatch: 'free',
    }
  }

  const repeatCount = Math.ceil(rawStripLengthMm / repeatMm)
  const patternStepMm = (repeatCount * repeatMm) as Millimeters

  return {
    patternStepMm,
    patternApplied: true,
    patternMatch: 'straight',
    patternRepeatMm: repeatMm,
  }
}

/** Alignment gap between consecutive strip starts on one roll. */
export function calculateAlignmentGapMm(
  patternStepMm: Millimeters,
  rawStripLengthMm: Millimeters,
): Millimeters {
  const gap = patternStepMm - rawStripLengthMm
  return (gap > 0 ? gap : 0) as Millimeters
}
