import { env } from '@/config/env'
import type {
  AnalyticsEventMap,
  AnalyticsEventName,
  AnalyticsScreenName,
} from './event-taxonomy'
import type { AnalyticsService } from './types'

/**
 * Development analytics provider — local structured logs only.
 * Never contacts AppMetrica. Used when no real API key is configured.
 */
export class DevAnalyticsService implements AnalyticsService {
  private enabled = true
  private initialized = false

  initialize(): void {
    this.initialized = true
  }

  track<Name extends AnalyticsEventName>(
    name: Name,
    ...args: AnalyticsEventMap[Name] extends undefined
      ? []
      : [params: AnalyticsEventMap[Name]]
  ): void {
    if (!this.enabled || !env.analyticsDevMode) {
      return
    }

    const params = args[0]
    // Dev-only visibility; production builds use AppMetrica or stay silent.
    console.info('[Analytics:dev]', name, params ?? {})
  }

  screen(name: AnalyticsScreenName): void {
    if (!this.enabled || !env.analyticsDevMode) {
      return
    }

    console.info('[Analytics:dev:screen]', name)
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  isInitialized(): boolean {
    return this.initialized
  }
}
