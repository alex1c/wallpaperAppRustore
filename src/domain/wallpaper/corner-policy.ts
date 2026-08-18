import type { Millimeters } from '@/units'

/**
 * Horizontal allowance policy for inside corners — separate from wall dimensions.
 * Quick rectangular rooms use a total allowance added to summed wall widths.
 */
export interface CornerAllowancePolicy {
  /** Extra width (mm) added once to total wall run before strip count. */
  totalCornerAllowanceMm: Millimeters
}

/**
 * Default quick-mode corner policy: 4 inside corners × 20 mm overlap each.
 * Conservative — accounts for slight wrap at internal corners without per-wall magic.
 * Documented in WALLPAPER_PRODUCT_SPEC and DECISIONS.md.
 */
export const DEFAULT_QUICK_CORNER_POLICY: CornerAllowancePolicy = {
  totalCornerAllowanceMm: 80 as Millimeters,
}

/** No corner allowance — for tests or explicit user override. */
export const ZERO_CORNER_POLICY: CornerAllowancePolicy = {
  totalCornerAllowanceMm: 0 as Millimeters,
}

/** Applies corner policy to raw summed wall width. */
export function applyCornerAllowance(
  totalWallWidthMm: Millimeters,
  policy: CornerAllowancePolicy,
): Millimeters {
  return (totalWallWidthMm + policy.totalCornerAllowanceMm) as Millimeters
}
