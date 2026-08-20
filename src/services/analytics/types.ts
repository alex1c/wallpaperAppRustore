import type {
  AnalyticsEventMap,
  AnalyticsEventName,
  AnalyticsScreenName,
} from './event-taxonomy'

/**
 * Provider-independent analytics boundary.
 * UI depends on this interface — never on AppMetrica types.
 */
export interface AnalyticsService {
  /** One-time provider activation. Safe to call multiple times. */
  initialize(): void

  /**
   * Track a typed product event. Params must already be privacy-safe
   * categorical values from the event taxonomy.
   */
  track<Name extends AnalyticsEventName>(
    name: Name,
    ...args: AnalyticsEventMap[Name] extends undefined
      ? []
      : [params: AnalyticsEventMap[Name]]
  ): void

  /** Track a meaningful product screen once per navigation. */
  screen(name: AnalyticsScreenName): void

  /** Enables/disables outbound statistics when the provider supports it. */
  setEnabled(enabled: boolean): void
}

/** Legacy event envelope kept for transitional typing in exports. */
export type AnalyticsEvent = {
  [Name in AnalyticsEventName]: AnalyticsEventMap[Name] extends undefined
    ? { name: Name; params?: undefined }
    : { name: Name; params: AnalyticsEventMap[Name] }
}[AnalyticsEventName]
