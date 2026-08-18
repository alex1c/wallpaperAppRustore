import type { WallpaperCalculationOutcome } from './errors'
import type { Millimeters, SquareMillimeters } from '@/units'
import type { CornerAllowancePolicy } from './corner-policy'

/** Vertical strip alignment mode for patterned wallpaper. */
export type PatternMatch = 'free' | 'straight' | 'half-drop'

const PATTERN_MATCH_VALUES: readonly PatternMatch[] = [
  'free',
  'straight',
  'half-drop',
]

/** Runtime guard for pattern.match — rejects unknown string values. */
export function isPatternMatch(value: unknown): value is PatternMatch {
  return (
    typeof value === 'string'
    && (PATTERN_MATCH_VALUES as readonly string[]).includes(value)
  )
}

/** Pattern configuration — repeat is required for straight match. */
export interface PatternConfig {
  match: PatternMatch
  /** Vertical repeat in millimeters; required when match is straight. */
  repeatMm?: Millimeters
  /** Horizontal offset — not supported with straight in Phase 2.1. */
  offsetMm?: Millimeters
}

/** Top and bottom cutting allowance added to wall height per strip (may be zero). */
export interface TrimAllowance {
  topMm: Millimeters
  bottomMm: Millimeters
}

/** Wallpaper roll dimensions in canonical millimeters. */
export interface RollSpec {
  widthMm: Millimeters
  lengthMm: Millimeters
}

/** A single wall segment contributing horizontal coverage to the room. */
export interface Wall {
  id: string
  widthMm: Millimeters
  heightMm: Millimeters
}

/**
 * Opening on a wall — type only; geometry calculation deferred to Phase 4.
 * See WALLPAPER_PRODUCT_SPEC §14–16.
 */
export interface Opening {
  wallId: string
  offsetXMm: Millimeters
  widthMm: Millimeters
  heightMm: Millimeters
  offsetFromFloorMm: Millimeters
}

/** Rectangular room input before normalization to Wall[]. */
export interface QuickRoomInput {
  lengthMm: Millimeters
  widthMm: Millimeters
  heightMm: Millimeters
}

/**
 * Full calculation input after normalization.
 * Phase 2.1 supports uniform wall heights only — see validateUniformWallHeights.
 */
export interface WallpaperCalculationInput {
  walls: Wall[]
  roll: RollSpec
  trim: TrimAllowance
  pattern?: PatternConfig
  cornerAllowance?: CornerAllowancePolicy
}

/** Quick-mode input — room rectangle plus roll; trim/pattern/corner optional. */
export interface QuickWallpaperCalculationInput {
  room: QuickRoomInput
  roll: RollSpec
  trim?: TrimAllowance
  pattern?: PatternConfig
  cornerAllowance?: CornerAllowancePolicy
}

/** Physical cut of one strip on a roll — start/end positions in roll coordinates. */
export interface StripCutEntry {
  /** 1-based global strip index across all rolls. */
  stripIndex: number
  /** 1-based roll index. */
  rollIndex: number
  /** Where the physical cut starts on the roll (mm from roll start). */
  startOffsetMm: Millimeters
  /** Where the physical cut ends on the roll (start + physical cut length). */
  physicalEndMm: Millimeters
  /** Material length actually applied to the wall for this strip. */
  physicalCutLengthMm: Millimeters
}

/** Per-roll cutting plan with physical positions — supports UI visualization. */
export interface RollUsageEntry {
  rollIndex: number
  stripsCut: number
  stripCuts: StripCutEntry[]
  /** Position on roll after the last strip ends (trailing pattern gap excluded). */
  rollLengthConsumedMm: Millimeters
  /** Gaps between consecutive strip starts on this roll (pattern alignment loss). */
  alignmentLossMm: Millimeters
  /** Usable remainder after the last strip ends. */
  remainingUsableLengthMm: Millimeters
}

/**
 * Decomposed material accounting — not a single opaque "waste" bucket.
 * Spare-roll recommendation is separate and NOT included here.
 */
export interface MaterialBreakdown {
  /** Wall coverage: requiredStrips × physical cut length. */
  totalPhysicalCutLengthMm: Millimeters
  /** Roll material lost to pattern phase gaps between strips on rolls. */
  totalPatternAlignmentLossMm: Millimeters
  /** Sum of rollLengthConsumedMm across purchased rolls. */
  totalRollLengthConsumedMm: Millimeters
  /** minimumRolls × roll length. */
  totalPurchasedLengthMm: Millimeters
  /** Purchased length minus consumed roll positions (usable offcuts). */
  totalRemainingUsableLengthMm: Millimeters
}

/**
 * Metadata about pattern phase assumptions when planning roll cuts.
 * Without known starting phase on a new roll, strict global minimum is not guaranteed.
 */
export interface PatternPhaseMetadata {
  /** Each new roll is modelled as starting at repeat phase zero. */
  assumesNewRollStartsAtPhaseZero: true
  /**
   * When true, minimumRolls is valid under assumesNewRollStartsAtPhaseZero only.
   * Actual need may differ if roll phase continues from a previous partial roll.
   */
  minimumRollsDependsOnPhaseAssumption: boolean
}

/**
 * Structured trace for UI explainability — facts only, no localized strings.
 * Presenter/i18n layer builds human copy from this data.
 */
export interface WallpaperCalculationTrace {
  totalWallWidthMm: Millimeters
  cornerAllowanceMm: Millimeters
  adjustedWallWidthMm: Millimeters
  requiredStrips: number
  wallHeightMm: Millimeters
  topTrimMm: Millimeters
  bottomTrimMm: Millimeters
  rawStripLengthMm: Millimeters
  patternMatch: PatternMatch
  patternRepeatMm?: Millimeters
  patternStepMm: Millimeters
  rollWidthMm: Millimeters
  rollLengthMm: Millimeters
  stripsPerFullRoll: number
  minimumRolls: number
  rollUsage: RollUsageEntry[]
  patternPhase: PatternPhaseMetadata
}

/** Core calculation result — trace + material breakdown for explainability. */
export interface WallpaperCalculationResult {
  trace: WallpaperCalculationTrace
  material: MaterialBreakdown
  /** Convenience accessors mirroring trace (stable API for callers). */
  requiredStrips: number
  rawStripLengthMm: Millimeters
  patternStepMm: Millimeters
  stripsPerFullRoll: number
  minimumRolls: number
  rollUsage: RollUsageEntry[]
  patternApplied: boolean
  patternMatch: PatternMatch
  informationalWallAreaMm2: SquareMillimeters
}

/** Product reason codes for spare-roll recommendation — not user-facing copy. */
export type RecommendationReasonCode =
  | 'GENERAL_INSTALLATION_RESERVE'
  | 'PATTERN_MATCHING_RISK'
  | 'BATCH_DYE_LOT_REPAIR'
  | 'DAMAGE_OR_MISCUT_BUFFER'

/** Purchase recommendation — explicitly separate from mathematical minimum. */
export interface RollPurchaseRecommendation {
  minimumRolls: number
  suggestedSpareRolls: number
  suggestedTotalRolls: number
  reasonCodes: RecommendationReasonCode[]
}

/**
 * Assessment for "I already have N full rolls" scenario.
 * Assumes identical unused full rolls matching the calculated roll spec.
 */
export interface ExistingFullRollsAssessment {
  ownedFullRolls: number
  minimumRolls: number
  requiredStrips: number
  stripsPerFullRoll: number
  availableStrips: number
  missingStrips: number
  shortageRolls: number
  surplusRolls: number
  isSufficient: boolean
}

export type QuickWallpaperCalculationOutcome =
  WallpaperCalculationOutcome<WallpaperCalculationResult>

/** @deprecated Use ExistingFullRollsAssessment */
export type ExistingRollsAssessment = ExistingFullRollsAssessment

/** @deprecated Use RollPurchaseRecommendation */
export interface RollRecommendation {
  minimumRolls: number
  recommendedRolls: number
  spareRollCount: number
  reasonCodes: RecommendationReasonCode[]
}

/** @deprecated Use MaterialBreakdown */
export type WasteMetrics = MaterialBreakdown

/** @deprecated Use patternStepMm — kept for migration only */
export type LegacyEffectiveStripLengthAlias = Millimeters
