/**
 * Canonical length unit for the calculation domain.
 * All domain math uses millimeters to avoid floating-point drift across inputs.
 */
export type Millimeters = number & { readonly __brand: 'Millimeters' }

/** Converts centimeters (UI-friendly in RU market) to canonical millimeters. */
export function centimetersToMillimeters(value: number): Millimeters {
  return (value * 10) as Millimeters
}

/** Converts meters to canonical millimeters. */
export function metersToMillimeters(value: number): Millimeters {
  return (value * 1000) as Millimeters
}

/** Converts millimeters back to centimeters for display. */
export function millimetersToCentimeters(value: Millimeters): number {
  return value / 10
}

/** Converts millimeters back to meters for display. */
export function millimetersToMeters(value: Millimeters): number {
  return value / 1000
}

/** Square millimeters — area canonical unit derived from length. */
export type SquareMillimeters = number & { readonly __brand: 'SquareMillimeters' }

/** Computes rectangular area in square millimeters. */
export function rectangleAreaMm(
  widthMm: Millimeters,
  heightMm: Millimeters,
): SquareMillimeters {
  return (widthMm * heightMm) as SquareMillimeters
}
