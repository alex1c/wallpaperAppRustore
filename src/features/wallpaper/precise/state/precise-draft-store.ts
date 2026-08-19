import type { PreciseDraft } from './precise-draft-types'
import { DEFAULT_PRECISE_DRAFT } from './precise-draft-types'

/**
 * In-memory handoff from Quick Mode to Precise Mode.
 * No persistence — cleared when overwritten or on cold start.
 */
let pendingPreciseDraft: PreciseDraft | null = null

/** Stores a draft before navigating to `/precise`. */
export function setPendingPreciseDraft(draft: PreciseDraft): void {
  pendingPreciseDraft = draft
}

/** Consumes the pending draft once; returns default when none was set. */
export function consumePendingPreciseDraft(): PreciseDraft {
  const draft = pendingPreciseDraft ?? DEFAULT_PRECISE_DRAFT
  pendingPreciseDraft = null
  return structuredClone(draft)
}

/** Test-only reset — avoids cross-test leakage. */
export function resetPendingPreciseDraftForTests(): void {
  pendingPreciseDraft = null
}
