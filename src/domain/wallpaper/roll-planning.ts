import type { Millimeters } from '@/units'
import type { RollUsageEntry, StripCutEntry } from './types'
import { calculateAlignmentGapMm } from './strip-length'

/**
 * Counts how many physical strips fit on one roll using start positions
 * separated by patternStepMm. The last strip does not require trailing
 * alignment gap — only rawStripLengthMm must fit from its start offset.
 */
export function countMaxStripsOnRoll(
  rollLengthMm: Millimeters,
  rawStripLengthMm: Millimeters,
  patternStepMm: Millimeters,
): number {
  if (rawStripLengthMm > rollLengthMm) {
    return 0
  }

  if (patternStepMm <= 0) {
    return 0
  }

  let count = 0
  let startOffset = 0

  while (startOffset + rawStripLengthMm <= rollLengthMm) {
    count += 1
    startOffset += patternStepMm
  }

  return count
}

/** Minimum rolls to cover all required strips at max capacity per roll. */
export function calculateMinimumRolls(
  requiredStrips: number,
  stripsPerFullRoll: number,
): number {
  if (stripsPerFullRoll <= 0) {
    return Number.POSITIVE_INFINITY
  }
  return Math.ceil(requiredStrips / stripsPerFullRoll)
}

export interface PhysicalRollPlanInput {
  requiredStrips: number
  rollLengthMm: Millimeters
  rawStripLengthMm: Millimeters
  patternStepMm: Millimeters
}

export interface PhysicalRollPlanResult {
  stripsPerFullRoll: number
  minimumRolls: number
  rollUsage: RollUsageEntry[]
}

/**
 * Builds a physically correct multi-roll cut plan.
 * Each new roll starts at pattern phase zero (offset 0).
 */
export function buildPhysicalRollPlan(
  input: PhysicalRollPlanInput,
): PhysicalRollPlanResult {
  const {
    requiredStrips,
    rollLengthMm,
    rawStripLengthMm,
    patternStepMm,
  } = input

  const stripsPerFullRoll = countMaxStripsOnRoll(
    rollLengthMm,
    rawStripLengthMm,
    patternStepMm,
  )

  if (stripsPerFullRoll < 1) {
    return {
      stripsPerFullRoll: 0,
      minimumRolls: 0,
      rollUsage: [],
    }
  }

  const minimumRolls = calculateMinimumRolls(requiredStrips, stripsPerFullRoll)
  const alignmentGapMm = calculateAlignmentGapMm(patternStepMm, rawStripLengthMm)

  const rollUsage: RollUsageEntry[] = []
  let stripsRemaining = requiredStrips
  let globalStripIndex = 1

  for (let rollIndex = 1; rollIndex <= minimumRolls; rollIndex += 1) {
    const maxOnRoll = countMaxStripsOnRoll(
      rollLengthMm,
      rawStripLengthMm,
      patternStepMm,
    )
    const stripsCut = Math.min(maxOnRoll, stripsRemaining)

    if (stripsCut <= 0) {
      break
    }

    const stripCuts: StripCutEntry[] = []

    for (let i = 0; i < stripsCut; i += 1) {
      const startOffsetMm = (i * patternStepMm) as Millimeters
      const physicalEndMm = (startOffsetMm + rawStripLengthMm) as Millimeters

      stripCuts.push({
        stripIndex: globalStripIndex,
        rollIndex,
        startOffsetMm,
        physicalEndMm,
        physicalCutLengthMm: rawStripLengthMm,
      })

      globalStripIndex += 1
    }

    const rollLengthConsumedMm = stripCuts.length > 0
      ? stripCuts[stripCuts.length - 1].physicalEndMm
      : (0 as Millimeters)
    const alignmentLossMm = (
      Math.max(0, stripsCut - 1) * alignmentGapMm
    ) as Millimeters
    const remainingUsableLengthMm = (
      rollLengthMm - rollLengthConsumedMm
    ) as Millimeters

    rollUsage.push({
      rollIndex,
      stripsCut,
      stripCuts,
      rollLengthConsumedMm,
      alignmentLossMm,
      remainingUsableLengthMm,
    })

    stripsRemaining -= stripsCut
  }

  return {
    stripsPerFullRoll,
    minimumRolls,
    rollUsage,
  }
}
