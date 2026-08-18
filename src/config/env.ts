/**
 * Typed access to public environment variables.
 * Production ad/analytics IDs must never be committed to the repository.
 */
export const env = {
  /**
   * When true, analytics events are logged to the console instead of a SDK.
   * Set via EXPO_PUBLIC_ANALYTICS_DEV_MODE=true in local .env files.
   */
  analyticsDevMode:
    process.env.EXPO_PUBLIC_ANALYTICS_DEV_MODE === 'true' ||
    __DEV__,

  /**
   * Placeholder AppMetrica API key — replace only in local .env, never in git.
   * Real integration is deferred to Phase 5.
   */
  appMetricaApiKey: process.env.EXPO_PUBLIC_APPMETRICA_API_KEY ?? '',

  /**
   * Placeholder Yandex ad block ids — replace only in local .env, never in git.
   * Real integration is deferred to Phase 5.
   */
  yandexBannerBlockId: process.env.EXPO_PUBLIC_YANDEX_BANNER_BLOCK_ID ?? '',
  yandexInterstitialBlockId:
    process.env.EXPO_PUBLIC_YANDEX_INTERSTITIAL_BLOCK_ID ?? '',
  yandexRewardedBlockId: process.env.EXPO_PUBLIC_YANDEX_REWARDED_BLOCK_ID ?? '',
} as const
