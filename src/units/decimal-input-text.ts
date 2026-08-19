/**
 * Keeps the editable decimal text exactly as entered or pasted.
 * Validation and normalization happen only on submit, so malformed text is
 * never silently transformed into a different valid measurement.
 */
export function filterDecimalInputText(raw: string): string {
  return raw
}

/**
 * Integer-only filter for centimeter width fields (custom roll width).
 */
export function filterIntegerInputText(raw: string): string {
  return raw
}
