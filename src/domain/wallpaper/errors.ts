/** Typed error codes returned by the wallpaper calculation domain. */
export type WallpaperCalculationErrorCode =
  | 'INVALID_DIMENSION'
  | 'INVALID_REPEAT'
  | 'INVALID_INPUT_STRUCTURE'
  | 'INVALID_PATTERN_MATCH'
  | 'INCONSISTENT_PATTERN_CONFIG'
  | 'STRIP_LONGER_THAN_ROLL'
  | 'UNSUPPORTED_PATTERN_MATCH'
  | 'UNSUPPORTED_DIFFERENT_WALL_HEIGHTS'
  | 'INVALID_OPENING_GEOMETRY'
  | 'DUPLICATE_OPENING_ID'
  | 'OPENING_OUTSIDE_WALL'
  | 'OVERLAPPING_OPENINGS_UNSUPPORTED'
  | 'UNSUPPORTED_PRECISE_PATTERN_CONFIGURATION'
  | 'INPUT_OVERFLOW'

/** Structured calculation error — message is for developers/logs, not UI copy. */
export interface WallpaperCalculationError {
  code: WallpaperCalculationErrorCode
  message: string
}

/** Discriminated union for calculation outcomes. */
export type WallpaperCalculationOutcome<T> =
  | { ok: true; result: T }
  | { ok: false; error: WallpaperCalculationError }
