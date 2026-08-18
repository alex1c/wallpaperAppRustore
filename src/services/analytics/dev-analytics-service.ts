import { env } from '@/config/env'
import type { AnalyticsEvent, AnalyticsService } from './types'

/**
 * Development/no-op analytics provider.
 * Logs structured events locally until AppMetrica is integrated.
 */
export class DevAnalyticsService implements AnalyticsService {
  private userProperties: Record<string, string> = {}

  track(event: AnalyticsEvent): void {
    if (!env.analyticsDevMode) {
      return
    }

    console.info('[Analytics:dev]', event.name, {
      ...event.params,
      ...this.userProperties,
    })
  }

  setUserProperty(key: string, value: string): void {
    this.userProperties[key] = value
  }
}
