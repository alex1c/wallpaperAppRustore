import { calculatePreciseWallpaper } from '../calculate-precise'

const mm = (value: number) => value as import('@/units').Millimeters

const baseRoll = { widthMm: mm(10), lengthMm: mm(100) }
const noTrim = { topMm: mm(0), bottomMm: mm(0) }

describe('precise adversarial regressions', () => {
  it('rejects instead of silently dropping a required cut longer than the roll', () => {
    const outcome = calculatePreciseWallpaper({
      walls: [{ id: 'wall', widthMm: mm(10), heightMm: mm(101) }],
      roll: baseRoll,
      trim: noTrim,
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('STRIP_LONGER_THAN_ROLL')
  })

  it('packs the same cut multiset identically regardless of wall input order', () => {
    const walls = [6, 6, 4, 4].map((height, index) => ({
      id: `wall-${index}`,
      widthMm: mm(1),
      heightMm: mm(height),
    }))
    const input = {
      walls,
      roll: { widthMm: mm(1), lengthMm: mm(10) },
      trim: noTrim,
    }

    const forward = calculatePreciseWallpaper(input)
    const reversed = calculatePreciseWallpaper({ ...input, walls: [...walls].reverse() })

    expect(forward.ok && reversed.ok).toBe(true)
    if (!forward.ok || !reversed.ok) return

    expect(forward.result.plannedRolls).toBe(2)
    expect(reversed.result.plannedRolls).toBe(2)
    expect(forward.result.physicalCuts).toHaveLength(4)
    expect(reversed.result.physicalCuts).toHaveLength(4)
  })

  it('labels an FFD counterexample as a conservative plan, not a strict minimum', () => {
    const heights = [6, 5, 3, 2, 2, 2]
    const outcome = calculatePreciseWallpaper({
      walls: heights.map((height, index) => ({
        id: `wall-${index}`,
        widthMm: mm(1),
        heightMm: mm(height),
      })),
      roll: { widthMm: mm(1), lengthMm: mm(10) },
      trim: noTrim,
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    // FFD uses 3 bins; an exact packing exists in 2: [6,2,2] + [5,3,2].
    expect(outcome.result.plannedRolls).toBe(3)
    expect('minimumRolls' in outcome.result).toBe(false)
  })

  it('stores the actual rectilinear segment width inside a partially covered column', () => {
    const outcome = calculatePreciseWallpaper({
      walls: [{ id: 'wall', widthMm: mm(20), heightMm: mm(20) }],
      openings: [{
        id: 'opening',
        wallId: 'wall',
        offsetXMm: mm(4),
        offsetFromFloorMm: mm(5),
        widthMm: mm(2),
        heightMm: mm(10),
      }],
      roll: baseRoll,
      trim: noTrim,
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    const narrowSegments = outcome.result.requiredSegments.filter(
      (segment) => segment.xEndMm - segment.xStartMm < 10,
    )
    expect(narrowSegments.length).toBeGreaterThan(0)
    for (const segment of narrowSegments) {
      expect(segment.columnWidthMm).toBe(segment.xEndMm - segment.xStartMm)
    }
  })

  it('supports a straight repeat step longer than the roll when the physical cut fits', () => {
    const outcome = calculatePreciseWallpaper({
      walls: [{ id: 'wall', widthMm: mm(2), heightMm: mm(3) }],
      roll: { widthMm: mm(1), lengthMm: mm(5) },
      trim: noTrim,
      pattern: { match: 'straight', repeatMm: mm(6) },
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.result.physicalCuts.every((cut) => cut.physicalLengthMm === 3)).toBe(true)
    expect(outcome.result.plannedRolls).toBe(2)
  })

  it('compares straight no-opening baseline under the same pattern policy', () => {
    const outcome = calculatePreciseWallpaper({
      walls: [{ id: 'wall', widthMm: mm(2), heightMm: mm(2700) }],
      roll: { widthMm: mm(1), lengthMm: mm(5900) },
      trim: { topMm: mm(50), bottomMm: mm(50) },
      pattern: { match: 'straight', repeatMm: mm(640) },
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    // Free packing would fit 2 × 2800 on one roll; straight starts are 3200 apart.
    expect(outcome.result.plannedRolls).toBe(2)
    expect(outcome.result.openingSavings.baselinePlannedRolls).toBe(2)
    expect(outcome.result.openingSavings.actualPlannedRolls).toBe(2)
  })

  it.each([
    [9199, 2],
    [9200, 1],
    [9201, 1],
  ])('keeps the Phase 2 physical-end boundary at roll length %i', (
    rollLength,
    expectedRolls,
  ) => {
    const outcome = calculatePreciseWallpaper({
      walls: [{ id: 'wall', widthMm: mm(3180), heightMm: mm(2700) }],
      roll: { widthMm: mm(1060), lengthMm: mm(rollLength) },
      trim: { topMm: mm(50), bottomMm: mm(50) },
      pattern: { match: 'straight', repeatMm: mm(640) },
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.result.physicalCuts).toHaveLength(3)
    expect(outcome.result.plannedRolls).toBe(expectedRolls)
  })

  it('supports repeat greater than raw strip length when physical ends fit', () => {
    const outcome = calculatePreciseWallpaper({
      walls: [{ id: 'wall', widthMm: mm(2), heightMm: mm(2800) }],
      roll: { widthMm: mm(1), lengthMm: mm(5800) },
      trim: noTrim,
      pattern: { match: 'straight', repeatMm: mm(3000) },
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.result.plannedRolls).toBe(1)
    expect(outcome.result.physicalCuts.map((cut) => cut.endOffsetOnRollMm)).toEqual([
      2800,
      5800,
    ])
  })
})
