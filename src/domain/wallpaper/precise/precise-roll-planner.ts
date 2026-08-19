import type { Millimeters } from '@/units'
import type { PatternConfig, TrimAllowance } from '../types'
import { calculatePatternStepMm, calculateRawStripLengthMm } from '../strip-length'
import type {
  PrecisePhysicalCut,
  PreciseRollUsageEntry,
  RequiredVerticalSegment,
} from './types'
import { physicalCutLengthFromCoverage } from './segment-builder'

export interface PlannedPreciseRolls {
  physicalCuts: PrecisePhysicalCut[]
  rollUsage: PreciseRollUsageEntry[]
  plannedRolls: number
  totalRollLengthConsumedMm: Millimeters
  totalRemainingUsableLengthMm: Millimeters
}

interface CutPlanItem {
  segment: RequiredVerticalSegment
  physicalLengthMm: Millimeters
  patternStepMm?: Millimeters
}

export type PreciseRollPlanOutcome =
  | { ok: true; plan: PlannedPreciseRolls }
  | { ok: false; code: 'STRIP_LONGER_THAN_ROLL' }

/**
 * Policy A — one required segment per physical cut; cut pieces are not reused.
 * Uncut roll tails are packed with deterministic first-fit-decreasing.
 */
export function planFreeMatchPreciseRolls(
  segments: RequiredVerticalSegment[],
  rollLengthMm: Millimeters,
  trim: TrimAllowance,
): PreciseRollPlanOutcome {
  const items: CutPlanItem[] = segments.map((segment) => ({
    segment,
    physicalLengthMm: physicalCutLengthFromCoverage(
      segment.wallCoverageLengthMm,
      trim.topMm,
      trim.bottomMm,
    ),
  }))

  return packCutItems(items, rollLengthMm)
}

/**
 * Straight match without openings: per-segment pattern step based on wall height.
 * Uses pattern step spacing on roll (same model as Phase 2 physical planner).
 */
export function planStraightPreciseRolls(
  segments: RequiredVerticalSegment[],
  wallHeightsByWallId: Map<string, Millimeters>,
  rollLengthMm: Millimeters,
  trim: TrimAllowance,
  pattern: PatternConfig,
): PreciseRollPlanOutcome {
  const items: CutPlanItem[] = []

  for (const segment of segments) {
    const wallHeight = wallHeightsByWallId.get(segment.wallId)

    if (wallHeight === undefined) {
      continue
    }

    const rawStripLengthMm = calculateRawStripLengthMm(
      wallHeight,
      trim.topMm,
      trim.bottomMm,
    )
    const { patternStepMm } = calculatePatternStepMm(rawStripLengthMm, pattern)

    if (rawStripLengthMm > rollLengthMm) {
      return { ok: false, code: 'STRIP_LONGER_THAN_ROLL' }
    }

    items.push({
      segment,
      physicalLengthMm: rawStripLengthMm,
      patternStepMm,
    })
  }

  return packCutItems(items, rollLengthMm)
}

function packCutItems(
  items: CutPlanItem[],
  rollLengthMm: Millimeters,
): PreciseRollPlanOutcome {
  if (items.some((item) => item.physicalLengthMm > rollLengthMm)) {
    return { ok: false, code: 'STRIP_LONGER_THAN_ROLL' }
  }

  const orderedItems = [...items].sort((a, b) => {
    const aSpacing = a.patternStepMm ?? a.physicalLengthMm
    const bSpacing = b.patternStepMm ?? b.physicalLengthMm

    if (aSpacing !== bSpacing) return bSpacing - aSpacing
    if (a.physicalLengthMm !== b.physicalLengthMm) {
      return b.physicalLengthMm - a.physicalLengthMm
    }

    const wallDiff = a.segment.wallId.localeCompare(b.segment.wallId)
    if (wallDiff !== 0) return wallDiff
    if (a.segment.columnIndex !== b.segment.columnIndex) {
      return a.segment.columnIndex - b.segment.columnIndex
    }
    return a.segment.segmentIndex - b.segment.segmentIndex
  })

  const physicalCuts: PrecisePhysicalCut[] = []
  const bins: {
    offsetMm: number
    maxConsumedMm: number
    cutIndices: number[]
  }[] = []

  for (const item of orderedItems) {
    const spacing = item.patternStepMm ?? item.physicalLengthMm
    let binIndex = bins.findIndex(
      (bin) => bin.offsetMm + item.physicalLengthMm <= rollLengthMm,
    )

    if (binIndex < 0) {
      bins.push({ offsetMm: 0, maxConsumedMm: 0, cutIndices: [] })
      binIndex = bins.length - 1
    }

    const bin = bins[binIndex]
    const startOffsetOnRoll = bin.offsetMm as Millimeters
    const endOffsetOnRoll = (bin.offsetMm + item.physicalLengthMm) as Millimeters

    physicalCuts.push({
      cutIndex: physicalCuts.length + 1,
      wallId: item.segment.wallId,
      columnIndex: item.segment.columnIndex,
      segmentIndex: item.segment.segmentIndex,
      physicalLengthMm: item.physicalLengthMm,
      wallCoverageLengthMm: item.segment.wallCoverageLengthMm,
      rollIndex: binIndex + 1,
      startOffsetOnRollMm: startOffsetOnRoll,
      endOffsetOnRollMm: endOffsetOnRoll,
    })

    bin.cutIndices.push(physicalCuts.length)
    bin.maxConsumedMm = Math.max(bin.maxConsumedMm, endOffsetOnRoll)
    bin.offsetMm += spacing
  }

  const rollUsage: PreciseRollUsageEntry[] = bins.map((bin, index) => ({
    rollIndex: index + 1,
    cutsCount: bin.cutIndices.length,
    cutIndices: bin.cutIndices,
    rollLengthConsumedMm: bin.maxConsumedMm as Millimeters,
    remainingUsableLengthMm: (rollLengthMm - bin.maxConsumedMm) as Millimeters,
  }))

  const totalRollLengthConsumedMm = rollUsage.reduce(
    (sum, entry) => sum + entry.rollLengthConsumedMm,
    0,
  ) as Millimeters

  const totalRemainingUsableLengthMm = rollUsage.reduce(
    (sum, entry) => sum + entry.remainingUsableLengthMm,
    0,
  ) as Millimeters

  return {
    ok: true,
    plan: {
      physicalCuts,
      rollUsage,
      plannedRolls: rollUsage.length,
      totalRollLengthConsumedMm,
      totalRemainingUsableLengthMm,
    },
  }
}
