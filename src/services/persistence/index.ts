import type { PersistenceService } from './types'
import { MemoryPersistenceService } from './memory-persistence-service'

let persistenceService: PersistenceService = new MemoryPersistenceService()

/** Returns the process-wide persistence service instance. */
export function getPersistenceService(): PersistenceService {
  return persistenceService
}

/** Allows swapping to AsyncStorage/SQLite in a later phase without UI changes. */
export function setPersistenceService(service: PersistenceService): void {
  persistenceService = service
}

export { MemoryPersistenceService } from './memory-persistence-service'
export { persistenceKeys } from './types'
export type { PersistenceService } from './types'
