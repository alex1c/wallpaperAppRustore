/** Result of attempting to show an interstitial ad. */
export type AdShowResult =
  | { shown: true }
  | { shown: false; reason: 'not_ready' | 'skipped' | 'error' }

/** Result of a rewarded ad flow. */
export type RewardedAdResult =
  | { completed: true; rewardGranted: true }
  | { completed: true; rewardGranted: false }
  | { completed: false; reason: 'not_ready' | 'dismissed' | 'error' }

/**
 * Advertising boundary — UI depends on this interface, not on Yandex SDK types.
 * Production implementation will wrap Yandex Mobile Ads + mediation in Phase 5.
 */
export interface AdService {
  preloadInterstitial(): Promise<void>
  showInterstitial(): Promise<AdShowResult>
  showRewarded(): Promise<RewardedAdResult>
}
