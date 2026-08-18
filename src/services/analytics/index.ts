import type { AnalyticsService } from './types'
import { DevAnalyticsService } from './dev-analytics-service'

let analyticsService: AnalyticsService = new DevAnalyticsService()

/** Returns the process-wide analytics service instance. */
export function getAnalyticsService(): AnalyticsService {
  return analyticsService
}

/** Allows tests or future DI to replace the analytics provider. */
export function setAnalyticsService(service: AnalyticsService): void {
  analyticsService = service
}

export type { AnalyticsEvent, AnalyticsEventName, AnalyticsService } from './types'
export { DevAnalyticsService } from './dev-analytics-service'
