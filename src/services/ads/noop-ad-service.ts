import type { AdService, AdShowResult, RewardedAdResult } from './types'

/**
 * Safe development provider — no SDK, no ad unit IDs, no network calls.
 * Logs intent in __DEV__ so future integration points remain visible.
 */
export class NoopAdService implements AdService {
  async preloadInterstitial(): Promise<void> {
    if (__DEV__) {
      console.info('[AdService:noop] preloadInterstitial skipped')
    }
  }

  async showInterstitial(): Promise<AdShowResult> {
    if (__DEV__) {
      console.info('[AdService:noop] showInterstitial skipped')
    }
    return { shown: false, reason: 'skipped' }
  }

  async showRewarded(): Promise<RewardedAdResult> {
    if (__DEV__) {
      console.info('[AdService:noop] showRewarded skipped')
    }
    return { completed: false, reason: 'not_ready' }
  }
}
