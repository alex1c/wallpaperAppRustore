import type { Millimeters } from './length'

/** Matches domain `MAX_LENGTH_MM` — kept here to avoid units → domain imports. */
const MAX_INPUT_LENGTH_MM = 100_000

/** UI-layer parse failure codes — mapped to i18n in the feature presenter. */
export type ParseDecimalInputErrorCode =
  | 'EMPTY'
  | 'INVALID_FORMAT'
  | 'NOT_POSITIVE'
  | 'NOT_FINITE'
  | 'TOO_LARGE'

export type ParseDecimalInputResult =
  | { ok: true; valueMm: Millimeters }
  | { ok: false; code: ParseDecimalInputErrorCode }

/**
 * Maximum decimal places accepted in user meter input before silent mm rounding.
 * Example: "2,7001" m rounds to 2701 mm (nearest integer millimeter).
 */
export const METER_INPUT_MAX_DECIMAL_PLACES = 3

/**
 * Normalizes locale decimal text: trims whitespace, converts comma to dot.
 * Does not validate numeric range — use {@link parseMetersInputToMillimeters}.
 */
export function normalizeDecimalInput(raw: string): string {
  return raw.trim().replace(',', '.')
}

/**
 * Parses a user decimal string in meters and converts to canonical integer mm.
 *
 * Rounding rule (documented in DECISIONS.md):
 * 1. Trim whitespace; accept comma or dot as decimal separator.
 * 2. Parse to a finite number; reject empty, non-numeric, zero, and negative values.
 * 3. Convert via `Math.round(meters * 1000)` — nearest millimeter, no fractional mm.
 * 4. More than {@link METER_INPUT_MAX_DECIMAL_PLACES} decimal places are rounded,
 *    not rejected — the user sees the rounded canonical value only in results.
 */
export function parseMetersInputToMillimeters(raw: string): ParseDecimalInputResult {
  const trimmed = raw.trim()

  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY' }
  }

  const normalized = normalizeDecimalInput(trimmed)

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { ok: false, code: 'INVALID_FORMAT' }
  }

  const meters = Number(normalized)

  if (!Number.isFinite(meters)) {
    return { ok: false, code: 'NOT_FINITE' }
  }

  if (meters <= 0) {
    return { ok: false, code: 'NOT_POSITIVE' }
  }

  const valueMm = Math.round(meters * 1000) as Millimeters

  if (valueMm <= 0 || valueMm > MAX_INPUT_LENGTH_MM) {
    return { ok: false, code: 'TOO_LARGE' }
  }

  return { ok: true, valueMm }
}

/**
 * Parses a meter offset where zero is a valid position (for example, an
 * opening touching the left wall edge or the floor). Dimensions must continue
 * to use {@link parseMetersInputToMillimeters}, which rejects zero.
 */
export function parseMetersInputToNonNegativeMillimeters(
  raw: string,
): ParseDecimalInputResult {
  const trimmed = raw.trim()

  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY' }
  }

  const normalized = normalizeDecimalInput(trimmed)

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { ok: false, code: 'INVALID_FORMAT' }
  }

  const meters = Number(normalized)

  if (!Number.isFinite(meters)) {
    return { ok: false, code: 'NOT_FINITE' }
  }

  const valueMm = Math.round(meters * 1000) as Millimeters

  if (valueMm < 0 || valueMm > MAX_INPUT_LENGTH_MM) {
    return { ok: false, code: 'TOO_LARGE' }
  }

  return { ok: true, valueMm }
}

/**
 * Parses a user decimal string in centimeters and converts to canonical integer mm.
 * Example: "106" cm → 1060 mm; "53,5" cm → 535 mm (rounded to nearest mm).
 */
export function parseCentimetersInputToMillimeters(raw: string): ParseDecimalInputResult {
  const trimmed = raw.trim()

  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY' }
  }

  const normalized = normalizeDecimalInput(trimmed)

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { ok: false, code: 'INVALID_FORMAT' }
  }

  const centimeters = Number(normalized)

  if (!Number.isFinite(centimeters)) {
    return { ok: false, code: 'NOT_FINITE' }
  }

  if (centimeters <= 0) {
    return { ok: false, code: 'NOT_POSITIVE' }
  }

  const valueMm = Math.round(centimeters * 10) as Millimeters

  if (valueMm <= 0 || valueMm > MAX_INPUT_LENGTH_MM) {
    return { ok: false, code: 'TOO_LARGE' }
  }

  return { ok: true, valueMm }
}
