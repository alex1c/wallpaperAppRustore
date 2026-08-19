import type { Millimeters } from '@/units'
import type { MaterialBreakdown, TrimAllowance, Wall } from '../types'
import type { WallpaperCalculationOutcome } from '../errors'
import type {
  OpeningSavingsMetrics,
  PreciseOpeningImpact,
  PreciseWallpaperCalculationInput,
  PreciseWallpaperCalculationResult,
  RequiredVerticalSegment,
  WallPlanningSummary,
  WallStripColumn,
} from './types'
import {
  buildBaselineSegmentForColumn,
  buildRequiredSegmentsForColumn,
  totalCoverageAreaMm2,
  totalPhysicalMaterialMm,
} from './segment-builder'
import {
  planFreeMatchPreciseRolls,
  planStraightPreciseRolls,
} from './precise-roll-planner'
import { buildAllWallStripColumns } from './wall-columns'
import { validatePreciseCalculationInput } from './validate-precise'

function buildWallSummaries(
  walls: Wall[],
  columns: WallStripColumn[],
  segments: RequiredVerticalSegment[],
  baselineSegments: RequiredVerticalSegment[],
  trim: TrimAllowance,
): WallPlanningSummary[] {
  return walls.map((wall) => {
    const wallColumns = columns.filter((column) => column.wallId === wall.id)
    const wallSegments = segments.filter((segment) => segment.wallId === wall.id)
    const wallBaseline = baselineSegments.filter((segment) => segment.wallId === wall.id)
    const baselineMaterialMm = totalPhysicalMaterialMm(wallBaseline, trim.topMm, trim.bottomMm)
    const actualMaterialMm = totalPhysicalMaterialMm(wallSegments, trim.topMm, trim.bottomMm)

    const baselineCoverageAreaMm2 = totalCoverageAreaMm2(wallBaseline)
    const actualCoverageAreaMm2 = totalCoverageAreaMm2(wallSegments)

    return {
      wallId: wall.id,
      widthMm: wall.widthMm,
      heightMm: wall.heightMm,
      stripColumnCount: wallColumns.length,
      requiredSegmentCount: wallSegments.length,
      baselineSegmentCountWithoutOpenings: wallBaseline.length,
      baselineMaterialMm,
      actualMaterialMm,
      materialSavedMm: (baselineMaterialMm - actualMaterialMm) as Millimeters,
      baselineCoverageAreaMm2,
      actualCoverageAreaMm2,
    }
  })
}

function buildOpeningSavings(
  baselineSegments: RequiredVerticalSegment[],
  actualSegments: RequiredVerticalSegment[],
  baselineRolls: number | null,
  actualRolls: number,
  trim: TrimAllowance,
): OpeningSavingsMetrics {
  const baselineTotalMaterialMm = totalPhysicalMaterialMm(
    baselineSegments,
    trim.topMm,
    trim.bottomMm,
  )
  const actualTotalMaterialMm = totalPhysicalMaterialMm(
    actualSegments,
    trim.topMm,
    trim.bottomMm,
  )

  const baselineColumnKeys = new Set(
    baselineSegments.map((segment) => `${segment.wallId}:${segment.columnIndex}`),
  )
  const actualColumnKeys = new Set(
    actualSegments.map((segment) => `${segment.wallId}:${segment.columnIndex}`),
  )

  let stripColumnsEliminated = 0

  for (const key of baselineColumnKeys) {
    if (!actualColumnKeys.has(key)) {
      stripColumnsEliminated += 1
    }
  }

  const baselineCoverageAreaMm2 = totalCoverageAreaMm2(baselineSegments)
  const actualCoverageAreaMm2 = totalCoverageAreaMm2(actualSegments)

  const partialSegmentsCreated = Math.max(
    0,
    actualSegments.length - baselineSegments.length,
  )

  return {
    baselineTotalMaterialMm,
    actualTotalMaterialMm,
    physicalCutLengthSavedMm: (
      baselineTotalMaterialMm - actualTotalMaterialMm
    ) as Millimeters,
    stripColumnsEliminated,
    partialSegmentsCreated,
    coverageAreaSavedMm2: baselineCoverageAreaMm2 - actualCoverageAreaMm2,
    baselinePlannedRolls: baselineRolls,
    actualPlannedRolls: actualRolls,
  }
}

function buildMaterialBreakdown(
  physicalCutTotalMm: Millimeters,
  rollLengthMm: Millimeters,
  plannedRolls: number,
  totalRollLengthConsumedMm: Millimeters,
  totalRemainingUsableLengthMm: Millimeters,
  alignmentLossMm: Millimeters,
): MaterialBreakdown {
  const totalPurchasedLengthMm = (plannedRolls * rollLengthMm) as Millimeters

  return {
    totalPhysicalCutLengthMm: physicalCutTotalMm,
    totalPatternAlignmentLossMm: alignmentLossMm,
    totalRollLengthConsumedMm,
    totalPurchasedLengthMm,
    totalRemainingUsableLengthMm,
  }
}

function buildOpeningImpacts(
  openings: PreciseWallpaperCalculationInput['openings'],
  columns: WallStripColumn[],
): PreciseOpeningImpact[] {
  return (openings ?? []).map((opening) => ({
    openingId: opening.id,
    wallId: opening.wallId,
    coverageAreaRemovedMm2: opening.widthMm * opening.heightMm,
    affectedColumnIndices: columns
      .filter((column) => (
        column.wallId === opening.wallId
        && column.xStartMm < opening.offsetXMm + opening.widthMm
        && opening.offsetXMm < column.xEndMm
      ))
      .map((column) => column.columnIndex),
  }))
}

/** Stable geometry ordering before the roll planner applies deterministic FFD. */
function orderSegments(
  walls: Wall[],
  segments: RequiredVerticalSegment[],
): RequiredVerticalSegment[] {
  const wallOrder = new Map(walls.map((wall, index) => [wall.id, index]))

  return [...segments].sort((a, b) => {
    const wallDiff = (wallOrder.get(a.wallId) ?? 0) - (wallOrder.get(b.wallId) ?? 0)

    if (wallDiff !== 0) return wallDiff
    if (a.columnIndex !== b.columnIndex) return a.columnIndex - b.columnIndex
    return a.segmentIndex - b.segmentIndex
  })
}

/**
 * Precise wallpaper calculation — per-wall strip columns, opening geometry,
 * conservative roll planner (Policy A). Free match fully supported; straight
 * match only without openings in Phase 4B1.
 */
export function calculatePreciseWallpaper(
  input: PreciseWallpaperCalculationInput | unknown,
): WallpaperCalculationOutcome<PreciseWallpaperCalculationResult> {
  const validated = validatePreciseCalculationInput(input)

  if (!validated.ok) {
    return validated
  }

  const { walls, openings = [], roll, trim, pattern } = validated.input
  const openingsByWall = new Map<string, typeof openings>()

  for (const opening of openings) {
    const list = openingsByWall.get(opening.wallId) ?? []
    list.push(opening)
    openingsByWall.set(opening.wallId, list)
  }

  const columns = buildAllWallStripColumns(walls, roll.widthMm)
  const segments: RequiredVerticalSegment[] = []
  const baselineSegments: RequiredVerticalSegment[] = []

  for (const wall of walls) {
    const wallColumns = columns.filter((column) => column.wallId === wall.id)
    const wallOpenings = openingsByWall.get(wall.id) ?? []

    for (const column of wallColumns) {
      baselineSegments.push(buildBaselineSegmentForColumn(wall, column))

      const columnSegments = buildRequiredSegmentsForColumn(
        wall,
        column,
        wallOpenings,
      )

      segments.push(...columnSegments)
    }
  }

  const orderedSegments = orderSegments(walls, segments)
  const orderedBaseline = orderSegments(walls, baselineSegments)

  const patternMatch = pattern?.match ?? 'free'
  const patternApplied = patternMatch === 'straight'

  const baselinePlanOutcome = planFreeMatchPreciseRolls(
    orderedBaseline,
    roll.lengthMm,
    trim,
  )

  let rollPlan: import('./precise-roll-planner').PlannedPreciseRolls

  if (patternApplied && pattern) {
    const wallHeights = new Map(walls.map((wall) => [wall.id, wall.heightMm]))
    const straightPlan = planStraightPreciseRolls(
      orderedSegments,
      wallHeights,
      roll.lengthMm,
      trim,
      pattern,
    )

    if (!straightPlan.ok) {
      return {
        ok: false,
        error: {
          code: 'STRIP_LONGER_THAN_ROLL',
          message: 'Pattern-adjusted strip length exceeds roll length.',
        },
      }
    }

    rollPlan = straightPlan.plan
  } else {
    const freePlan = planFreeMatchPreciseRolls(
      orderedSegments,
      roll.lengthMm,
      trim,
    )

    if (!freePlan.ok) {
      return {
        ok: false,
        error: {
          code: 'STRIP_LONGER_THAN_ROLL',
          message: 'A required physical cut exceeds roll length.',
        },
      }
    }

    rollPlan = freePlan.plan
  }

  for (const cut of rollPlan.physicalCuts) {
    if (cut.physicalLengthMm > roll.lengthMm) {
      return {
        ok: false,
        error: {
          code: 'STRIP_LONGER_THAN_ROLL',
          message: `Physical cut ${cut.cutIndex} exceeds roll length.`,
        },
      }
    }
  }

  const actualMaterialMm = totalPhysicalMaterialMm(orderedSegments, trim.topMm, trim.bottomMm)
  const alignmentLossMm = (
    rollPlan.totalRollLengthConsumedMm - actualMaterialMm
  ) as Millimeters

  const material = buildMaterialBreakdown(
    actualMaterialMm,
    roll.lengthMm,
    rollPlan.plannedRolls,
    rollPlan.totalRollLengthConsumedMm,
    rollPlan.totalRemainingUsableLengthMm,
    alignmentLossMm > 0 ? alignmentLossMm : (0 as Millimeters),
  )

  const wallSummaries = buildWallSummaries(
    walls,
    columns,
    orderedSegments,
    orderedBaseline,
    trim,
  )

  const openingSavings = buildOpeningSavings(
    orderedBaseline,
    orderedSegments,
    patternApplied
      ? rollPlan.plannedRolls
      : baselinePlanOutcome.ok ? baselinePlanOutcome.plan.plannedRolls : null,
    rollPlan.plannedRolls,
    trim,
  )

  return {
    ok: true,
    result: {
      walls: wallSummaries,
      stripColumns: columns,
      requiredSegments: orderedSegments,
      physicalCuts: rollPlan.physicalCuts,
      rollUsage: rollPlan.rollUsage,
      plannedRolls: rollPlan.plannedRolls,
      openingSavings,
      openingImpacts: buildOpeningImpacts(openings, columns),
      material,
      patternApplied,
      patternMatch,
      totalStripColumns: columns.length,
      totalRequiredSegments: orderedSegments.length,
    },
  }
}
