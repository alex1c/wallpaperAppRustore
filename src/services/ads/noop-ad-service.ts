import type { AdService, AdShowResult, RewardedAdResult } from './types'

function shouldLogDevNoop(): boolean {
  return __DEV__ && process.env.JEST_WORKER_ID === undefined
}

/**
 * Safe development provider — no SDK, no ad unit IDs, no network calls.
 * Logs intent in __DEV__ (outside Jest) so future integration points remain visible.
 */
export class NoopAdService implements AdService {
  async preloadInterstitial(): Promise<void> {
    if (shouldLogDevNoop()) {
      console.info('[AdService:noop] preloadInterstitial skipped')
    }
  }

  async showInterstitial(): Promise<AdShowResult> {
    if (shouldLogDevNoop()) {
      console.info('[AdService:noop] showInterstitial skipped')
    }
    return { shown: false, reason: 'skipped' }
  }

  async showRewarded(): Promise<RewardedAdResult> {
    if (shouldLogDevNoop()) {
      console.info('[AdService:noop] showRewarded skipped')
    }
    return { completed: false, reason: 'not_ready' }
  }
}
