/** Known analytics events for the wallpaper calculator product. */
export type AnalyticsEventName =
  | 'app_open'
  | 'calculation_start'
  | 'calculation_complete'
  | 'result_view'
  | 'ad_impression'
  | 'rewarded_offer'
  | 'rewarded_complete'

export interface AnalyticsEvent {
  name: AnalyticsEventName
  params?: Record<string, string | number | boolean>
}

/**
 * Analytics boundary — UI/domain emit semantic events here.
 * AppMetrica SDK integration arrives in Phase 5.
 */
export interface AnalyticsService {
  track(event: AnalyticsEvent): void
  setUserProperty(key: string, value: string): void
}
