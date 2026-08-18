/** Minimal persistence API for settings and saved calculations (Phase 6+). */
export interface PersistenceService {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

/** Namespaced keys prevent collisions when the platform grows. */
export const persistenceKeys = {
  lastCalculation: 'wallpaper:last-calculation',
  userSettings: 'app:settings',
} as const
