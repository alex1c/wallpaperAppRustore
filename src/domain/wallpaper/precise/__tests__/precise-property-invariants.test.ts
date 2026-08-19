import { calculatePreciseWallpaper } from '../calculate-precise'
import {
  P1_INPUT,
  P2_INPUT,
  P5_INPUT,
  P9_INPUT,
} from '../fixtures/precise-reference-scenarios'

const mm = (value: number) => value as import('@/units').Millimeters

describe('precise property invariants', () => {
  it('small-grid segment union equals wall minus opening across column boundaries', () => {
    for (let wallWidth = 1; wallWidth <= 6; wallWidth += 1) {
      for (let wallHeight = 2; wallHeight <= 5; wallHeight += 1) {
        for (let rollWidth = 1; rollWidth <= 3; rollWidth += 1) {
          for (let ox = 0; ox < wallWidth; ox += 1) {
            for (let openingWidth = 1; ox + openingWidth <= wallWidth; openingWidth += 1) {
              for (let oy = 0; oy < wallHeight; oy += 1) {
                for (let openingHeight = 1; oy + openingHeight <= wallHeight; openingHeight += 1) {
                  const outcome = calculatePreciseWallpaper({
                    walls: [{ id: 'wall', widthMm: mm(wallWidth), heightMm: mm(wallHeight) }],
                    openings: [{
                      id: 'opening',
                      wallId: 'wall',
                      offsetXMm: mm(ox),
                      offsetFromFloorMm: mm(oy),
                      widthMm: mm(openingWidth),
                      heightMm: mm(openingHeight),
                    }],
                    roll: { widthMm: mm(rollWidth), lengthMm: mm(100) },
                    trim: { topMm: mm(0), bottomMm: mm(0) },
                  })

                  expect(outcome.ok).toBe(true)
                  if (!outcome.ok) continue

                  const covered = new Set<string>()
                  for (const segment of outcome.result.requiredSegments) {
                    expect(segment.xEndMm).toBeGreaterThan(segment.xStartMm)
                    expect(segment.yEndMm).toBeGreaterThan(segment.yStartMm)
                    expect(segment.columnWidthMm).toBe(segment.xEndMm - segment.xStartMm)

                    for (let x: number = segment.xStartMm; x < segment.xEndMm; x += 1) {
                      for (let y: number = segment.yStartMm; y < segment.yEndMm; y += 1) {
                        const key = `${x}:${y}`
                        expect(covered.has(key)).toBe(false)
                        covered.add(key)
                      }
                    }
                  }

                  for (let x = 0; x < wallWidth; x += 1) {
                    for (let y = 0; y < wallHeight; y += 1) {
                      const insideOpening = (
                        x >= ox && x < ox + openingWidth
                        && y >= oy && y < oy + openingHeight
                      )
                      expect(covered.has(`${x}:${y}`)).toBe(!insideOpening)
                    }
                  }

                  expect(outcome.result.openingSavings.coverageAreaSavedMm2).toBe(
                    openingWidth * openingHeight,
                  )
                }
              }
            }
          }
        }
      }
    }
  })

  it('documents that per-segment trim fragmentation can increase planned rolls', () => {
    const baseline = calculatePreciseWallpaper({
      walls: [{ id: 'wall', widthMm: mm(1), heightMm: mm(10) }],
      roll: { widthMm: mm(1), lengthMm: mm(12) },
      trim: { topMm: mm(1), bottomMm: mm(1) },
    })
    const fragmented = calculatePreciseWallpaper({
      walls: [{ id: 'wall', widthMm: mm(1), heightMm: mm(10) }],
      openings: [{
        id: 'opening',
        wallId: 'wall',
        offsetXMm: mm(0),
        offsetFromFloorMm: mm(4),
        widthMm: mm(1),
        heightMm: mm(1),
      }],
      roll: { widthMm: mm(1), lengthMm: mm(12) },
      trim: { topMm: mm(1), bottomMm: mm(1) },
    })

    expect(baseline.ok && fragmented.ok).toBe(true)
    if (!baseline.ok || !fragmented.ok) return

    expect(fragmented.result.openingSavings.coverageAreaSavedMm2).toBe(1)
    expect(fragmented.result.openingSavings.physicalCutLengthSavedMm).toBe(-1)
    expect(baseline.result.plannedRolls).toBe(1)
    expect(fragmented.result.plannedRolls).toBe(2)
  })

  it('adding an opening never increases wall coverage area in free match', () => {
    const baseline = calculatePreciseWallpaper(P1_INPUT)
    const withDoor = calculatePreciseWallpaper(P2_INPUT)

    expect(baseline.ok && withDoor.ok).toBe(true)
    if (!baseline.ok || !withDoor.ok) return

    const baselineArea = baseline.result.walls.reduce(
      (sum, wall) => sum + wall.baselineCoverageAreaMm2,
      0,
    )
    const actualArea = withDoor.result.walls.reduce(
      (sum, wall) => sum + wall.actualCoverageAreaMm2,
      0,
    )

    expect(actualArea).toBeLessThanOrEqual(baselineArea)
    expect(withDoor.result.openingSavings.coverageAreaSavedMm2).toBeGreaterThan(0)
  })

  it('increasing wall width never decreases strip columns', () => {
    const base = calculatePreciseWallpaper(P9_INPUT)
    const wider = calculatePreciseWallpaper({
      ...P9_INPUT,
      walls: [{ id: 'wall-a', widthMm: mm(5301), heightMm: mm(2700) }],
    })

    expect(base.ok && wider.ok).toBe(true)
    if (!base.ok || !wider.ok) return

    expect(wider.result.totalStripColumns).toBeGreaterThanOrEqual(
      base.result.totalStripColumns,
    )
  })

  it('increasing wall height never decreases physical material', () => {
    const low = calculatePreciseWallpaper({
      ...P1_INPUT,
      walls: [{ id: 'wall-a', widthMm: mm(4000), heightMm: mm(2500) }],
    })
    const high = calculatePreciseWallpaper(P1_INPUT)

    expect(low.ok && high.ok).toBe(true)
    if (!low.ok || !high.ok) return

    expect(high.result.material.totalPhysicalCutLengthMm).toBeGreaterThanOrEqual(
      low.result.material.totalPhysicalCutLengthMm,
    )
  })

  it('every physical cut length is positive and fits on roll', () => {
    const outcome = calculatePreciseWallpaper(P5_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    for (const cut of outcome.result.physicalCuts) {
      expect(cut.physicalLengthMm).toBeGreaterThan(0)
      expect(cut.endOffsetOnRollMm).toBeLessThanOrEqual(P5_INPUT.roll.lengthMm)
    }
  })

  it('roll remainder is never negative', () => {
    const cases = [P1_INPUT, P2_INPUT, P5_INPUT]

    for (const input of cases) {
      const outcome = calculatePreciseWallpaper(input)
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return

      for (const roll of outcome.result.rollUsage) {
        expect(roll.remainingUsableLengthMm).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('total assigned cut length does not exceed purchased roll length', () => {
    const outcome = calculatePreciseWallpaper(P2_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    const purchased = outcome.result.plannedRolls * P2_INPUT.roll.lengthMm
    const consumed = outcome.result.material.totalRollLengthConsumedMm

    expect(consumed).toBeLessThanOrEqual(purchased)
  })

  it('assigns every required segment exactly once with coverage plus trim length', () => {
    const outcome = calculatePreciseWallpaper(P2_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.physicalCuts).toHaveLength(
      outcome.result.requiredSegments.length,
    )

    const assigned = new Set<string>()
    for (const cut of outcome.result.physicalCuts) {
      const key = `${cut.wallId}:${cut.columnIndex}:${cut.segmentIndex}`
      expect(assigned.has(key)).toBe(false)
      assigned.add(key)
      expect(cut.physicalLengthMm).toBe(
        cut.wallCoverageLengthMm
        + P2_INPUT.trim.topMm
        + P2_INPUT.trim.bottomMm,
      )
    }
  })

  it('rejects straight pattern with openings', () => {
    const outcome = calculatePreciseWallpaper({
      ...P2_INPUT,
      pattern: { match: 'straight', repeatMm: mm(640) },
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('UNSUPPORTED_PRECISE_PATTERN_CONFIGURATION')
  })

  it('supports straight pattern without openings', () => {
    const outcome = calculatePreciseWallpaper({
      ...P1_INPUT,
      pattern: { match: 'straight', repeatMm: mm(640) },
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.result.patternApplied).toBe(true)
    expect(outcome.result.plannedRolls).toBeGreaterThan(0)
  })
})
