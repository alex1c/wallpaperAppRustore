import type { SupportedLocale } from '@/config/app-config'
import type { Millimeters } from '@/units'
import { millimetersToMeters } from '@/units'
import {
  parseCentimetersInputToMillimeters,
  parseMetersInputToMillimeters,
} from '@/units/parse-decimal-input'

/** Intl locale tag used for length/number display. */
function resolveIntlLocale(locale: SupportedLocale): string {
  return locale === 'ru' ? 'ru-RU' : 'en-US'
}

/**
 * Formats a meter quantity (from canonical mm) as a locale number without unit.
 * RU uses comma; EN uses dot; integers stay without trailing fraction digits.
 */
export function formatMetersNumberFromMm(
  valueMm: Millimeters,
  locale: SupportedLocale,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const meters = millimetersToMeters(valueMm)
  return new Intl.NumberFormat(resolveIntlLocale(locale), {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 3,
  }).format(meters)
}

/**
 * Formats editable meter text for read-only summaries.
 * Accepts comma or dot input text; does not mutate draft state.
 * Malformed text is left unchanged so the user can still see what they typed.
 */
export function formatDimensionTextForDisplay(
  raw: string,
  locale: SupportedLocale,
): string {
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return trimmed
  }

  const parsed = parseMetersInputToMillimeters(trimmed)
  if (!parsed.ok) {
    return trimmed
  }

  return formatMetersNumberFromMm(parsed.valueMm, locale)
}

/**
 * Formats editable centimeter text (e.g. pattern repeat) for read-only summaries.
 */
export function formatCentimetersTextForDisplay(
  raw: string,
  locale: SupportedLocale,
): string {
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return trimmed
  }

  const parsed = parseCentimetersInputToMillimeters(trimmed)
  if (!parsed.ok) {
    return trimmed
  }

  const centimeters = parsed.valueMm / 10
  return new Intl.NumberFormat(resolveIntlLocale(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(centimeters)
}

/**
 * Formats millimeters as meters for user-facing copy.
 * Example RU: 2700 mm → "2,7 м"; EN: "2.7 m".
 */
export function formatMetersFromMm(
  valueMm: Millimeters,
  locale: SupportedLocale,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const formatted = formatMetersNumberFromMm(valueMm, locale, {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  })

  const unit = locale === 'ru' ? 'м' : 'm'
  return `${formatted} ${unit}`
}

/**
 * Formats millimeters as centimeters — used for small allowances (corner, trim).
 * Example RU: 80 mm → "8 см".
 */
export function formatCentimetersFromMm(
  valueMm: Millimeters,
  locale: SupportedLocale,
): string {
  const centimeters = valueMm / 10
  const formatted = new Intl.NumberFormat(resolveIntlLocale(locale), {
    maximumFractionDigits: 1,
  }).format(centimeters)

  const unit = locale === 'ru' ? 'см' : 'cm'
  return `${formatted} ${unit}`
}

/** Locale-aware integer count (rolls, strips). */
export function formatCount(value: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(resolveIntlLocale(locale), {
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formats square millimeters as square meters for user-facing copy.
 * Example RU: 1_890_000 mm² → "1,89 м²".
 */
export function formatSquareMetersFromMm2(
  valueMm2: number,
  locale: SupportedLocale,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const squareMeters = valueMm2 / 1_000_000
  const formatted = new Intl.NumberFormat(resolveIntlLocale(locale), {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(squareMeters)

  const unit = locale === 'ru' ? 'м²' : 'm²'
  return `${formatted} ${unit}`
}

/** Replaces `{key}` placeholders in i18n templates with pre-formatted values. */
export function interpolateTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')
}
