/**
 * Privacy-first product analytics taxonomy for Wallpaper Calculator.
 *
 * Custom event parameters are categorical / boolean / count-buckets only.
 * Never attach exact dimensions, coordinates, free text, or calculation contents.
 */

/** Product screens tracked via `screen()`. Pattern sheet is an event, not a screen. */
export type AnalyticsScreenName = 'quick_calculator' | 'precise_calculator'

export type PatternAnalyticsValue = 'free' | 'straight' | 'half_drop'
export type RollAnalyticsValue = 'preset_106' | 'preset_053' | 'custom'
export type ModeAnalyticsValue = 'quick' | 'precise'
export type OpeningTypeAnalyticsValue = 'door' | 'window'
export type WallCountBucket = '1_2' | '3_4' | '5_plus'
export type OpeningCountBucket = '0' | '1' | '2' | '3_plus'
export type ResultRollBucket = '1' | '2' | '3_5' | '6_10' | '11_plus'
export type AnalyticsErrorCategory =
	| 'validation'
	| 'unsupported'
	| 'calculation'
	| 'technical'
export type PatternBlockReason = 'half_drop' | 'straight_with_openings' | 'validation'

/** Ad placement ids used in product analytics (not Yandex adUnitId strings). */
export type AdPlacementAnalyticsValue =
  | 'result_banner'
  | 'footer_banner'
  | 'dev_rewarded_test'
  | 'future_pdf_reward'

export type AdFormatAnalyticsValue = 'banner' | 'rewarded'
export type AdErrorCategoryAnalyticsValue = 'load' | 'show' | 'sdk' | 'unavailable'

/**
 * Typed event → params map. Params use only safe categorical values.
 */
export interface AnalyticsEventMap {
  app_open: undefined
  quick_calculation_completed: {
    pattern: PatternAnalyticsValue
    roll: RollAnalyticsValue
    result_roll_bucket: ResultRollBucket
  }
  quick_calculation_failed: {
    error_category: AnalyticsErrorCategory
  }
  precise_opened: {
    source: 'quick_entry' | 'direct'
    wall_count_bucket: WallCountBucket
  }
  precise_calculation_completed: {
    pattern: PatternAnalyticsValue
    roll: RollAnalyticsValue
    has_openings: boolean
    wall_count_bucket: WallCountBucket
    opening_count_bucket: OpeningCountBucket
    result_roll_bucket: ResultRollBucket
  }
  precise_calculation_failed: {
    error_category: AnalyticsErrorCategory
    has_openings: boolean
  }
  pattern_refinement_opened: {
    mode: ModeAnalyticsValue
  }
  pattern_calculation_completed: {
    mode: ModeAnalyticsValue
    pattern: PatternAnalyticsValue
    result_roll_bucket: ResultRollBucket
  }
  pattern_calculation_blocked: {
    mode: ModeAnalyticsValue
    pattern: PatternAnalyticsValue
    block_reason: PatternBlockReason
  }
  opening_added: {
    opening_type: OpeningTypeAnalyticsValue
    opening_count_bucket: OpeningCountBucket
  }
  opening_removed: {
    opening_type: OpeningTypeAnalyticsValue
    opening_count_bucket: OpeningCountBucket
  }
  explanation_opened: {
    mode: ModeAnalyticsValue
  }
  quick_to_precise: {
    wall_count_bucket: WallCountBucket
  }
  precise_to_quick: undefined
  /** User opened the share action sheet after a valid calculation. */
  share_opened: {
    mode: ModeAnalyticsValue
    pattern: PatternAnalyticsValue
    has_openings: boolean
  }
  /** System text share sheet was presented. */
  text_share_sheet_opened: {
    mode: ModeAnalyticsValue
    pattern: PatternAnalyticsValue
  }
  pdf_generation_started: {
    mode: ModeAnalyticsValue
    pattern: PatternAnalyticsValue
    has_openings: boolean
  }
  pdf_generation_completed: {
    mode: ModeAnalyticsValue
    pattern: PatternAnalyticsValue
    has_openings: boolean
  }
  pdf_generation_failed: {
    mode: ModeAnalyticsValue
    pattern: PatternAnalyticsValue
    error_category: AnalyticsErrorCategory
  }
  /** System PDF share sheet was presented — not proof of send completion. */
  pdf_share_sheet_opened: {
    mode: ModeAnalyticsValue
    pattern: PatternAnalyticsValue
  }
  /** Product banner load requested for a placement. */
  ad_banner_load_requested: {
    placement: AdPlacementAnalyticsValue
    format: AdFormatAnalyticsValue
    mode: ModeAnalyticsValue
  }
  ad_banner_loaded: {
    placement: AdPlacementAnalyticsValue
    format: AdFormatAnalyticsValue
    mode: ModeAnalyticsValue
  }
  ad_banner_failed: {
    placement: AdPlacementAnalyticsValue
    format: AdFormatAnalyticsValue
    mode: ModeAnalyticsValue
    error_category: AdErrorCategoryAnalyticsValue
  }
  ad_banner_impression: {
    placement: AdPlacementAnalyticsValue
    format: AdFormatAnalyticsValue
    mode: ModeAnalyticsValue
  }
  rewarded_load_requested: {
    placement: AdPlacementAnalyticsValue
    format: AdFormatAnalyticsValue
    mode: ModeAnalyticsValue
  }
  rewarded_loaded: {
    placement: AdPlacementAnalyticsValue
    format: AdFormatAnalyticsValue
    mode: ModeAnalyticsValue
  }
  rewarded_failed: {
    placement: AdPlacementAnalyticsValue
    format: AdFormatAnalyticsValue
    mode: ModeAnalyticsValue
    error_category: AdErrorCategoryAnalyticsValue
  }
  rewarded_opened: {
    placement: AdPlacementAnalyticsValue
    format: AdFormatAnalyticsValue
    mode: ModeAnalyticsValue
  }
  rewarded_reward_earned: {
    placement: AdPlacementAnalyticsValue
    format: AdFormatAnalyticsValue
    mode: ModeAnalyticsValue
  }
  rewarded_closed: {
    placement: AdPlacementAnalyticsValue
    format: AdFormatAnalyticsValue
    mode: ModeAnalyticsValue
    reward_granted: boolean
  }
}

export type AnalyticsEventName = keyof AnalyticsEventMap

export type AnalyticsPrimitive = string | number | boolean

/**
 * Flattened params object sent to providers — values already privacy-scrubbed.
 */
export type AnalyticsParams = Record<string, AnalyticsPrimitive>

/**
 * Share / PDF events are implemented in Phase 5B.
 *
 * Do NOT fire `share_completed`: Android system Share Sheet usually cannot
 * prove the user actually sent the message/file to a destination.
 */

/**
 * Phase 5C ad product events — categorical only.
 * SDK may also report low-level impression/revenue telemetry to AppMetrica
 * automatically when both SDKs are present; custom events stay product-level.
 */
