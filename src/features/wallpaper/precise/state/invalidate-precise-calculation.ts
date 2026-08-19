/** All calculation-derived Precise screen state cleared after draft changes. */
export interface PreciseCalculationInvalidationTargets {
  clearPresentedResult: () => void
  collapseExplanation: () => void
  clearFieldErrors: () => void
  clearDomainError: () => void
  clearUnsupportedPatternMessage: () => void
}

/**
 * Central invalidation contract shared by every committed Precise draft
 * mutation and by conservative modal-draft invalidation.
 */
export function invalidatePreciseCalculation(
  targets: PreciseCalculationInvalidationTargets,
): void {
  targets.clearPresentedResult()
  targets.collapseExplanation()
  targets.clearFieldErrors()
  targets.clearDomainError()
  targets.clearUnsupportedPatternMessage()
}
