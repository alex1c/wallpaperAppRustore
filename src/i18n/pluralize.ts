import type { SupportedLocale } from '@/config/app-config'

/**
 * Minimal Russian plural helper — no external i18n dependency.
 * Handles 11–14 exception (always "many" form).
 */
export function pluralizeRu(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return one
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return few
  }

  return many
}

/** Returns a count + correctly pluralized RU noun, e.g. "14 полотен". */
export function formatRuCountNoun(
  count: number,
  one: string,
  few: string,
  many: string,
  locale: SupportedLocale,
): string {
  const formatted = new Intl.NumberFormat(
    locale === 'ru' ? 'ru-RU' : 'en-US',
    { maximumFractionDigits: 0 },
  ).format(count)

  if (locale === 'ru') {
    return `${formatted} ${pluralizeRu(count, one, few, many)}`
  }

  const enNoun = count === 1 ? one : many
  return `${formatted} ${enNoun}`
}
