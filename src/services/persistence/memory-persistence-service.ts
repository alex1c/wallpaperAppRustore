import type { PersistenceService } from './types'

/**
 * In-memory persistence for Phase 0–1.
 * Data is lost on app restart — sufficient until saved projects ship.
 */
export class MemoryPersistenceService implements PersistenceService {
  private store = new Map<string, string>()

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value)
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key)
  }
}
