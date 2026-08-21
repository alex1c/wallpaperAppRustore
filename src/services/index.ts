import { getAdService } from './ads'
import { getAnalyticsService } from './analytics'
import { getPersistenceService } from './persistence'
import { getShareService } from './sharing'

let initialized = false

/**
 * Bootstraps cross-cutting services once at app entry.
 * Analytics and ads activation are fail-safe and never block calculation UX.
 */
export function initializeAppServices(): void {
	if (initialized) {
		return
	}

	const analytics = getAnalyticsService()
	analytics.initialize()
	analytics.track('app_open')

	// Ads initialize asynchronously — interstitial preload stays a no-op in Phase 5C.
	void getAdService().initialize()
	void getAdService().preloadInterstitial()
	void getPersistenceService()
	void getShareService()

	initialized = true
}

/** Test helper — allows re-running bootstrap after replacing services. */
export function resetAppServicesInitializationForTests(): void {
	initialized = false
}

export { getAdService, setAdService } from './ads'
export { getAnalyticsService, setAnalyticsService } from './analytics'
export { getPersistenceService, setPersistenceService } from './persistence'
export { getShareService, setShareService } from './sharing'

export type {
	AdService,
	AdShowResult,
	RewardedAdResult,
} from './ads'
export type {
	AnalyticsEvent,
	AnalyticsEventName,
	AnalyticsService,
} from './analytics'
export type { PersistenceService } from './persistence'
export type { ShareService, ShareOutcome, PdfGenerationOutcome } from './sharing'
