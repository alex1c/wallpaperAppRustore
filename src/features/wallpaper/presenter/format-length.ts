import type { SupportedLocale } from '@/config/app-config'
import type { Millimeters } from '@/units'
import { millimetersToMeters } from '@/units'

/** Intl locale tag used for length/number display. */
function resolveIntlLocale(locale: SupportedLocale): string {
  return locale === 'ru' ? 'ru-RU' : 'en-US'
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
  const meters = millimetersToMeters(valueMm)
  const formatted = new Intl.NumberFormat(resolveIntlLocale(locale), {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(meters)

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

/** Replaces `{key}` placeholders in i18n templates with pre-formatted values. */
export function interpolateTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')
}
