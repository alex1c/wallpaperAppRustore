import { getAdService } from './ads'
import { getAnalyticsService } from './analytics'
import { getPersistenceService } from './persistence'

let initialized = false

/**
 * Bootstraps cross-cutting services once at app entry.
 * Native SDK activation will extend this function in Phase 5.
 */
export function initializeAppServices(): void {
  if (initialized) {
    return
  }

  getAnalyticsService().track({ name: 'app_open' })
  void getAdService().preloadInterstitial()
  void getPersistenceService()

  initialized = true
}

export { getAdService, setAdService } from './ads'
export { getAnalyticsService, setAnalyticsService } from './analytics'
export { getPersistenceService, setPersistenceService } from './persistence'

export type { AdService, AdShowResult, RewardedAdResult } from './ads'
export type {
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsService,
} from './analytics'
export type { PersistenceService } from './persistence'
