import type {
  AnalyticsEventMap,
  AnalyticsEventName,
  AnalyticsScreenName,
} from './event-taxonomy'
import type { AnalyticsService } from './types'

/**
 * Wraps any analytics provider so failures never break calculation or navigation.
 */
export class SafeAnalyticsService implements AnalyticsService {
  constructor(private readonly inner: AnalyticsService) {}

  initialize(): void {
    try {
      this.inner.initialize()
    } catch {
      // Analytics must never block app startup.
    }
  }

  track<Name extends AnalyticsEventName>(
    name: Name,
    ...args: AnalyticsEventMap[Name] extends undefined
      ? []
      : [params: AnalyticsEventMap[Name]]
  ): void {
    try {
      // TypeScript rest tuple requires a cast through the inner call site.
      ;(this.inner.track as (
        eventName: Name,
        ...eventArgs: AnalyticsEventMap[Name] extends undefined
          ? []
          : [params: AnalyticsEventMap[Name]]
      ) => void)(name, ...args)
    } catch {
      // Swallow provider errors — product UX continues.
    }
  }

  screen(name: AnalyticsScreenName): void {
    try {
      this.inner.screen(name)
    } catch {
      // Swallow provider errors.
    }
  }

  setEnabled(enabled: boolean): void {
    try {
      this.inner.setEnabled(enabled)
    } catch {
      // Swallow provider errors.
    }
  }
}
