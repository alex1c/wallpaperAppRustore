/**
 * Static product configuration shared across the app shell.
 * Calculator-specific values live under feature/domain modules.
 */
export const appConfig = {
  /** Primary locale for the first RuStore release. */
  defaultLocale: 'ru' as const,

  /** Supported locales — EN is structurally ready, not fully translated yet. */
  supportedLocales: ['ru', 'en'] as const,

  /** Android application id used in app.json. */
  androidPackage: 'com.calculatorplatform.wallpaper',

  /** Product identifier inside the Calculator Platform portfolio. */
  productId: 'wallpaper-calculator',
} as const

export type SupportedLocale = (typeof appConfig.supportedLocales)[number]
