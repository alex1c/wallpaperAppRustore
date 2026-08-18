import type { Millimeters } from '@/units'
import type { MaterialBreakdown, RollUsageEntry } from './types'

/** Aggregates decomposed material metrics from a physical roll plan. */
export function calculateMaterialBreakdown(
  rollUsage: RollUsageEntry[],
  rollLengthMm: Millimeters,
  rawStripLengthMm: Millimeters,
  requiredStrips: number,
): MaterialBreakdown {
  const totalPhysicalCutLengthMm = (
    requiredStrips * rawStripLengthMm
  ) as Millimeters
  const totalPatternAlignmentLossMm = rollUsage.reduce(
    (sum, entry) => sum + entry.alignmentLossMm,
    0,
  ) as Millimeters
  const totalRollLengthConsumedMm = rollUsage.reduce(
    (sum, entry) => sum + entry.rollLengthConsumedMm,
    0,
  ) as Millimeters
  const totalPurchasedLengthMm = (
    rollUsage.length * rollLengthMm
  ) as Millimeters
  const totalRemainingUsableLengthMm = (
    totalPurchasedLengthMm - totalRollLengthConsumedMm
  ) as Millimeters

  return {
    totalPhysicalCutLengthMm,
    totalPatternAlignmentLossMm,
    totalRollLengthConsumedMm,
    totalPurchasedLengthMm,
    totalRemainingUsableLengthMm,
  }
}
