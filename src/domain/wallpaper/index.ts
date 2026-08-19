export { calculateWallpaper } from './calculate'
export {
  calculateQuickWallpaper,
  calculateQuickWallpaperRolls,
} from './quick-calculation'
export { calculatePreciseWallpaper } from './precise/calculate-precise'
export {
  DEFAULT_TRIM_ALLOWANCE,
  DEFAULT_TOP_TRIM_MM,
  DEFAULT_BOTTOM_TRIM_MM,
} from './defaults'
export {
  DEFAULT_QUICK_CORNER_POLICY,
  ZERO_CORNER_POLICY,
  applyCornerAllowance,
} from './corner-policy'
export {
  normalizeQuickRoomToWalls,
  calculateTotalWallWidthMm,
} from './geometry'
export {
  calculatePatternStepMm,
  calculateRawStripLengthMm,
} from './strip-length'
export {
  recommendRollPurchase,
  recommendRollPurchaseFromResult,
  recommendRolls,
} from './recommend-rolls'
export type { RollPurchaseRecommendationOutcome } from './recommend-rolls'
export {
  assessOwnedFullRolls,
  assessOwnedFullRollsFromCalculation,
  assessExistingRolls,
  assessExistingRollsFromCalculation,
} from './existing-rolls'
export type {
  WallpaperCalculationError,
  WallpaperCalculationErrorCode,
  WallpaperCalculationOutcome,
} from './errors'
export type {
  CornerAllowancePolicy,
} from './corner-policy'
export type {
  ExistingFullRollsAssessment,
  ExistingRollsAssessment,
  MaterialBreakdown,
  Opening,
  PatternConfig,
  PatternMatch,
  PatternPhaseMetadata,
  QuickRoomInput,
  QuickWallpaperCalculationInput,
  QuickWallpaperCalculationOutcome,
  RecommendationReasonCode,
  RollPurchaseRecommendation,
  RollRecommendation,
  RollSpec,
  RollUsageEntry,
  StripCutEntry,
  TrimAllowance,
  Wall,
  WallpaperCalculationInput,
  WallpaperCalculationResult,
  WallpaperCalculationTrace,
  WasteMetrics,
} from './types'
export type {
  OpeningSavingsMetrics,
  PreciseOpeningImpact,
  PreciseOpening,
  PrecisePhysicalCut,
  PreciseRollUsageEntry,
  PreciseWallpaperCalculationInput,
  PreciseWallpaperCalculationResult,
  RequiredVerticalSegment,
  WallPlanningSummary,
  WallStripColumn,
} from './precise/types'
export { isPatternMatch } from './types'
