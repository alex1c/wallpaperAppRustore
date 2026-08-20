import type {
  AnalyticsEventMap,
  AnalyticsEventName,
  AnalyticsScreenName,
} from './event-taxonomy'
import type { AnalyticsService } from './types'

/**
 * Silent analytics provider for Jest and disabled modes.
 * Never touches network or native modules.
 */
export class NoopAnalyticsService implements AnalyticsService {
  private enabled = true

  initialize(): void {
    // Intentionally empty.
  }

  track<Name extends AnalyticsEventName>(
    _name: Name,
    ..._args: AnalyticsEventMap[Name] extends undefined
      ? []
      : [params: AnalyticsEventMap[Name]]
  ): void {
    // Intentionally empty.
  }

  screen(_name: AnalyticsScreenName): void {
    // Intentionally empty.
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /** Test helper — exposed for diagnostics only. */
  isEnabled(): boolean {
    return this.enabled
  }
}
