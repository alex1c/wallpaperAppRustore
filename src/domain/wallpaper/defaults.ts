import type { Millimeters } from '@/units'
import type { TrimAllowance } from './types'

/**
 * Conservative default trim for quick calculations when the user does not
 * specify allowances. Documented in WALLPAPER_PRODUCT_SPEC and DECISIONS.md.
 */
export const DEFAULT_TOP_TRIM_MM = 50 as Millimeters
export const DEFAULT_BOTTOM_TRIM_MM = 50 as Millimeters

/** Default trim allowance applied in quick mode unless overridden. */
export const DEFAULT_TRIM_ALLOWANCE: TrimAllowance = {
  topMm: DEFAULT_TOP_TRIM_MM,
  bottomMm: DEFAULT_BOTTOM_TRIM_MM,
}

/**
 * Upper bound for any single length input in millimeters (100 m).
 * Protects against overflow and nonsensical values in integer math.
 */
export const MAX_LENGTH_MM = 100_000 as Millimeters
