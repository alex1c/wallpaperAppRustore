import { DEFAULT_QUICK_CORNER_POLICY } from './corner-policy'
import { DEFAULT_TRIM_ALLOWANCE } from './defaults'
import { normalizeQuickRoomToWalls } from './geometry'
import { calculateWallpaper } from './calculate'
import type {
  QuickWallpaperCalculationInput,
  QuickWallpaperCalculationOutcome,
} from './types'
import { validateQuickCalculationInput } from './validation'

/**
 * Quick-mode entry: rectangular room → normalized walls → shared engine.
 * Applies default trim and corner policies when omitted.
 */
export function calculateQuickWallpaper(
  input: QuickWallpaperCalculationInput | unknown,
): QuickWallpaperCalculationOutcome {
  const trim = (input !== null && typeof input === 'object' && 'trim' in input
    ? (input as QuickWallpaperCalculationInput).trim
    : undefined) ?? DEFAULT_TRIM_ALLOWANCE
  const cornerAllowance = (input !== null && typeof input === 'object' && 'cornerAllowance' in input
    ? (input as QuickWallpaperCalculationInput).cornerAllowance
    : undefined) ?? DEFAULT_QUICK_CORNER_POLICY

  const inputValidation = validateQuickCalculationInput(
    input,
    trim,
    cornerAllowance,
  )
  if (!inputValidation.ok) {
    return inputValidation
  }

  const validated = inputValidation.input
  const walls = normalizeQuickRoomToWalls(validated.room)

  return calculateWallpaper({
    walls,
    roll: validated.roll,
    trim: validated.trim ?? trim,
    pattern: validated.pattern,
    cornerAllowance: validated.cornerAllowance ?? cornerAllowance,
  })
}

/**
 * @deprecated Phase 0–1 area-based placeholder removed in Phase 2.
 * Use calculateQuickWallpaper for strip-based results.
 */
export function calculateQuickWallpaperRolls(
  input: QuickWallpaperCalculationInput,
): QuickWallpaperCalculationOutcome {
  return calculateQuickWallpaper(input)
}
