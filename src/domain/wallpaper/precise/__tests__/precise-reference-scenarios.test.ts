import { calculatePreciseWallpaper } from '../calculate-precise'
import { calculateWallpaper } from '../../calculate'
import { ZERO_CORNER_POLICY } from '../../corner-policy'
import {
  P1_EXPECTED,
  P1_INPUT,
  P10_EXPECTED,
  P10_INPUT,
  P2_EXPECTED,
  P2_INPUT,
  P3_INPUT,
  P4_EXPECTED,
  P5_EXPECTED,
  P5_INPUT,
  P6_EXPECTED,
  P6_INPUT,
  P7_INPUT,
  P8_INPUT,
  P9_EXPECTED,
  P9_INPUT,
} from '../fixtures/precise-reference-scenarios'

const mm = (value: number) => value as import('@/units').Millimeters

describe('precise reference scenarios', () => {
  it('P1 — single wall without openings', () => {
    const outcome = calculatePreciseWallpaper(P1_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.totalStripColumns).toBe(P1_EXPECTED.stripColumnCount)
    expect(outcome.result.totalRequiredSegments).toBe(P1_EXPECTED.requiredSegmentCount)
    expect(outcome.result.plannedRolls).toBe(P1_EXPECTED.plannedRolls)
    expect(outcome.result.material.totalPhysicalCutLengthMm).toBe(P1_EXPECTED.totalMaterialMm)
    expect(outcome.result.stripColumns[3].columnWidthMm).toBe(P1_EXPECTED.lastColumnWidthMm)

    for (const cut of outcome.result.physicalCuts) {
      expect(cut.physicalLengthMm).toBe(P1_EXPECTED.physicalCutLengthMm)
    }
  })

  it('P2 — floor door creates partial segments', () => {
    const outcome = calculatePreciseWallpaper(P2_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.totalRequiredSegments).toBe(P2_EXPECTED.requiredSegmentCount)
    expect(outcome.result.material.totalPhysicalCutLengthMm).toBe(P2_EXPECTED.totalMaterialMm)
    expect(outcome.result.openingSavings.coverageAreaSavedMm2).toBeGreaterThanOrEqual(
      P2_EXPECTED.coverageAreaSavedMm2,
    )
    expect(outcome.result.openingSavings.physicalCutLengthSavedMm).toBe(
      P2_EXPECTED.physicalCutLengthSavedMm,
    )
    expect(outcome.result.plannedRolls).toBe(P2_EXPECTED.plannedRolls)
    expect(outcome.result.openingSavings.baselinePlannedRolls).toBe(P2_EXPECTED.baselinePlannedRolls)
    expect(outcome.result.openingImpacts).toEqual([{
      openingId: 'door-1',
      wallId: 'wall-a',
      coverageAreaRemovedMm2: 1_890_000,
      affectedColumnIndices: [1, 2],
    }])
  })

  it('P3 — window creates upper and lower segments', () => {
    const outcome = calculatePreciseWallpaper(P3_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.totalRequiredSegments).toBeGreaterThan(P1_EXPECTED.requiredSegmentCount)
    expect(outcome.result.openingSavings.coverageAreaSavedMm2).toBeGreaterThan(0)

    const partialCuts = outcome.result.physicalCuts.filter(
      (cut) => cut.wallCoverageLengthMm < mm(2700),
    )
    expect(partialCuts.length).toBeGreaterThan(0)
  })

  it('P4 — opening saves material but not roll count', () => {
    const outcome = calculatePreciseWallpaper(P2_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.openingSavings.coverageAreaSavedMm2).toBeGreaterThanOrEqual(
      P4_EXPECTED.coverageAreaSavedMm2,
    )
    expect(outcome.result.plannedRolls).toBe(P4_EXPECTED.plannedRolls)
    expect(outcome.result.openingSavings.baselinePlannedRolls).toBe(P4_EXPECTED.baselinePlannedRolls)
  })

  it('P5 — opening reduces planned rolls', () => {
    const outcome = calculatePreciseWallpaper(P5_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.totalStripColumns).toBe(P5_EXPECTED.stripColumnCount)
    expect(outcome.result.totalRequiredSegments).toBe(P5_EXPECTED.requiredSegmentCount)
    expect(outcome.result.plannedRolls).toBe(P5_EXPECTED.plannedRolls)
    expect(outcome.result.openingSavings.baselinePlannedRolls).toBe(P5_EXPECTED.baselinePlannedRolls)

    for (const cut of outcome.result.physicalCuts) {
      expect(cut.wallCoverageLengthMm).toBe(P5_EXPECTED.segmentHeightMm)
    }
  })

  it('P6 — mixed wall heights planned independently', () => {
    const outcome = calculatePreciseWallpaper(P6_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.totalStripColumns).toBe(P6_EXPECTED.stripColumnCount)

    const w1Cuts = outcome.result.physicalCuts.filter((cut) => cut.wallId === 'w1')
    const w2Cuts = outcome.result.physicalCuts.filter((cut) => cut.wallId === 'w2')

    expect(w1Cuts.length).toBe(P6_EXPECTED.w1Columns)
    expect(w2Cuts.length).toBe(P6_EXPECTED.w2Columns)
    expect(w1Cuts.every((cut) => cut.physicalLengthMm === P6_EXPECTED.w1CutLengthMm)).toBe(true)
    expect(w2Cuts[0].physicalLengthMm).toBe(P6_EXPECTED.w2CutLengthMm)
  })

  it('P6 — legacy quick engine still rejects mixed heights', () => {
    const outcome = calculateWallpaper({
      walls: P6_INPUT.walls,
      roll: P6_INPUT.roll,
      trim: P6_INPUT.trim,
      cornerAllowance: ZERO_CORNER_POLICY,
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('UNSUPPORTED_DIFFERENT_WALL_HEIGHTS')
  })

  it('P7 — opening outside wall is rejected', () => {
    const outcome = calculatePreciseWallpaper(P7_INPUT)
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('OPENING_OUTSIDE_WALL')
  })

  it('P8 — overlapping openings are rejected', () => {
    const outcome = calculatePreciseWallpaper(P8_INPUT)
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('OVERLAPPING_OPENINGS_UNSUPPORTED')
  })

  it('P9 — exact strip-width boundary', () => {
    const outcome = calculatePreciseWallpaper(P9_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.result.totalStripColumns).toBe(P9_EXPECTED.stripColumnCount)
  })

  it('P10 — +1 mm adds a column', () => {
    const exact = calculatePreciseWallpaper(P9_INPUT)
    const plusOne = calculatePreciseWallpaper(P10_INPUT)

    expect(exact.ok && plusOne.ok).toBe(true)
    if (!exact.ok || !plusOne.ok) return

    expect(exact.result.totalStripColumns).toBe(P9_EXPECTED.stripColumnCount)
    expect(plusOne.result.totalStripColumns).toBe(P10_EXPECTED.stripColumnCount)
  })
})
