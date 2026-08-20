/**
 * Typed access to public environment variables.
 *
 * AppMetrica API key is an application identifier embedded in the client
 * (not a server-side private secret). Still keep production keys out of git
 * via local `.env` / CI injection — never commit real keys.
 */
export const env = {
  /**
   * When true, the DevAnalyticsService logs events to the console.
   * Defaults to true in `__DEV__`.
   */
  analyticsDevMode:
    process.env.EXPO_PUBLIC_ANALYTICS_DEV_MODE === 'true' ||
    __DEV__,

  /**
   * AppMetrica application API key from the AppMetrica console.
   * Empty / placeholder → DevAnalyticsService (no native activate).
   */
  appMetricaApiKey: process.env.EXPO_PUBLIC_APPMETRICA_API_KEY ?? '',

  /**
   * Placeholder Yandex ad block ids — advertising is NOT part of Phase 5A.
   * Replace only in local `.env` when Phase 6 begins.
   */
  yandexBannerBlockId: process.env.EXPO_PUBLIC_YANDEX_BANNER_BLOCK_ID ?? '',
  yandexInterstitialBlockId:
    process.env.EXPO_PUBLIC_YANDEX_INTERSTITIAL_BLOCK_ID ?? '',
  yandexRewardedBlockId: process.env.EXPO_PUBLIC_YANDEX_REWARDED_BLOCK_ID ?? '',
} as const
