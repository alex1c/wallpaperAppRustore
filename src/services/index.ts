import { getAdService } from './ads'
import { getAnalyticsService } from './analytics'
import { getPersistenceService } from './persistence'

let initialized = false

/**
 * Bootstraps cross-cutting services once at app entry.
 * Analytics activation is fail-safe and never blocks calculation UX.
 */
export function initializeAppServices(): void {
  if (initialized) {
    return
  }

  const analytics = getAnalyticsService()
  analytics.initialize()
  analytics.track('app_open')

  // Ads remain noop in Phase 5A — preload stays a no-op call for API stability.
  void getAdService().preloadInterstitial()
  void getPersistenceService()

  initialized = true
}

/** Test helper — allows re-running bootstrap after replacing services. */
export function resetAppServicesInitializationForTests(): void {
  initialized = false
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
