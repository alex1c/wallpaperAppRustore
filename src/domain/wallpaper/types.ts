import type { Millimeters, SquareMillimeters } from '@/units'

/** Rectangular room dimensions in canonical millimeters. */
export interface RoomDimensions {
  widthMm: Millimeters
  lengthMm: Millimeters
  heightMm: Millimeters
}

/** Wallpaper roll dimensions in canonical millimeters. */
export interface RollDimensions {
  widthMm: Millimeters
  lengthMm: Millimeters
}

/** Input for the Phase 0–1 quick placeholder calculation. */
export interface QuickWallpaperCalculationInput {
  room: RoomDimensions
  roll: RollDimensions
  /** Waste allowance as a percentage, e.g. 10 means +10%. */
  wastePercent: number
}

/** Typed output from the calculation domain. */
export interface QuickWallpaperCalculationResult {
  /** Total wall surface area excluding openings (placeholder model). */
  wallAreaMm2: SquareMillimeters
  /** Single roll surface area. */
  rollAreaMm2: SquareMillimeters
  /** Required roll count rounded up. */
  rollsRequired: number
  /** Waste multiplier applied to wall area before dividing by roll area. */
  wasteMultiplier: number
}

export interface QuickWallpaperCalculationError {
  code: 'INVALID_DIMENSION' | 'INVALID_WASTE'
  message: string
}

export type QuickWallpaperCalculationOutcome =
  | { ok: true; result: QuickWallpaperCalculationResult }
  | { ok: false; error: QuickWallpaperCalculationError }
