import type { Millimeters } from '@/units'
import type {
  MaterialBreakdown,
  PatternMatch,
  RollSpec,
  TrimAllowance,
  Wall,
} from '../types'

/** Rectangular opening on a wall — precise geometry input. */
export interface PreciseOpening {
  id: string
  wallId: string
  /** Distance from the wall's left edge to the opening's left edge. */
  offsetXMm: Millimeters
  /** Distance from the floor to the opening's bottom edge. */
  offsetFromFloorMm: Millimeters
  widthMm: Millimeters
  heightMm: Millimeters
}

/** One vertical strip column on a wall (partial width allowed on last column). */
export interface WallStripColumn {
  wallId: string
  /** 0-based column index left-to-right on the wall. */
  columnIndex: number
  xStartMm: Millimeters
  xEndMm: Millimeters
  columnWidthMm: Millimeters
}

/**
 * Rectangular wallpaper coverage required on a wall sub-region.
 * Coordinates are wall-local: X from left edge, Y from floor.
 */
export interface RequiredVerticalSegment {
  wallId: string
  columnIndex: number
  /** 0-based index within the column after rectilinear decomposition. */
  segmentIndex: number
  xStartMm: Millimeters
  xEndMm: Millimeters
  yStartMm: Millimeters
  yEndMm: Millimeters
  /** Wall coverage height (yEnd − yStart) before trim. */
  wallCoverageLengthMm: Millimeters
  columnWidthMm: Millimeters
}

/** One physical cut from a roll assigned to a required segment. */
export interface PrecisePhysicalCut {
  cutIndex: number
  wallId: string
  columnIndex: number
  segmentIndex: number
  /** Length including top and bottom trim. */
  physicalLengthMm: Millimeters
  wallCoverageLengthMm: Millimeters
  rollIndex: number
  startOffsetOnRollMm: Millimeters
  endOffsetOnRollMm: Millimeters
}

/** Per-roll summary for precise free-match packing. */
export interface PreciseRollUsageEntry {
  rollIndex: number
  cutsCount: number
  cutIndices: number[]
  rollLengthConsumedMm: Millimeters
  remainingUsableLengthMm: Millimeters
}

/** Per-wall planning facts for explainability. */
export interface WallPlanningSummary {
  wallId: string
  widthMm: Millimeters
  heightMm: Millimeters
  stripColumnCount: number
  requiredSegmentCount: number
  baselineSegmentCountWithoutOpenings: number
  baselineMaterialMm: Millimeters
  actualMaterialMm: Millimeters
  materialSavedMm: Millimeters
  baselineCoverageAreaMm2: number
  actualCoverageAreaMm2: number
}

/** Opening impact metrics — not area subtraction. */
export interface OpeningSavingsMetrics {
  baselineTotalMaterialMm: Millimeters
  actualTotalMaterialMm: Millimeters
  physicalCutLengthSavedMm: Millimeters
  /** Columns still required; openings rarely remove a full column. */
  stripColumnsEliminated: number
  partialSegmentsCreated: number
  /** Width-weighted wall coverage area saved vs no-opening baseline. */
  coverageAreaSavedMm2: number
  baselinePlannedRolls: number | null
  actualPlannedRolls: number
}

/** Per-opening geometry facts for presenter explainability; no UI strings. */
export interface PreciseOpeningImpact {
  openingId: string
  wallId: string
  coverageAreaRemovedMm2: number
  affectedColumnIndices: number[]
}

export interface PreciseWallpaperCalculationInput {
  walls: Wall[]
  openings?: PreciseOpening[]
  roll: RollSpec
  trim: TrimAllowance
  pattern?: import('../types').PatternConfig
}

export interface PreciseWallpaperCalculationResult {
  walls: WallPlanningSummary[]
  stripColumns: WallStripColumn[]
  requiredSegments: RequiredVerticalSegment[]
  physicalCuts: PrecisePhysicalCut[]
  rollUsage: PreciseRollUsageEntry[]
  /** Conservative deterministic FFD plan; not a proven bin-packing minimum. */
  plannedRolls: number
  openingSavings: OpeningSavingsMetrics
  openingImpacts: PreciseOpeningImpact[]
  material: MaterialBreakdown
  patternApplied: boolean
  patternMatch: PatternMatch
  totalStripColumns: number
  totalRequiredSegments: number
}
