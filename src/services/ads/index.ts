import type { AdService } from './types'
import { NoopAdService } from './noop-ad-service'

let adService: AdService = new NoopAdService()

/** Returns the process-wide ad service instance. */
export function getAdService(): AdService {
  return adService
}

/** Allows tests or future DI to replace the ad provider. */
export function setAdService(service: AdService): void {
  adService = service
}

export type { AdService, AdShowResult, RewardedAdResult } from './types'
export { NoopAdService } from './noop-ad-service'
