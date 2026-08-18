import { appConfig, type SupportedLocale } from '@/config/app-config'
import { en } from './locales/en'
import { ru } from './locales/ru'
import type { TranslationTree } from './types'

const catalogs: Record<SupportedLocale, TranslationTree> = {
  ru,
  en,
}

let activeLocale: SupportedLocale = appConfig.defaultLocale

/** Returns the active translation catalog. */
export function getTranslations(): TranslationTree {
  return catalogs[activeLocale]
}

/** Short alias used by UI components. */
export function t(): TranslationTree {
  return getTranslations()
}

/** Switches active locale at runtime (settings screen will use this later). */
export function setLocale(locale: SupportedLocale): void {
  activeLocale = locale
}

/** Exposes active locale for formatters and analytics context. */
export function getLocale(): SupportedLocale {
  return activeLocale
}

/** Locale-aware number formatting — UI concern, not domain math. */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  const locale = activeLocale === 'ru' ? 'ru-RU' : 'en-US'
  return new Intl.NumberFormat(locale, options).format(value)
}

/** Formats square meters from square millimeters for presentation. */
export function formatSquareMetersFromMm(areaMm2: number): string {
  const squareMeters = areaMm2 / 1_000_000
  return `${formatNumber(squareMeters, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })} m²`
}

export type { TranslationTree }
