import { calculatePreciseWallpaper } from '../calculate-precise'
import { P1_INPUT, P8_INPUT } from '../fixtures/precise-reference-scenarios'

describe('precise validation', () => {
  const mm = (value: number) => value as import('@/units').Millimeters

  it('rejects duplicate opening ids', () => {
    const outcome = calculatePreciseWallpaper({
      ...P1_INPUT,
      openings: [
        {
          id: 'dup',
          wallId: 'wall-a',
          offsetXMm: 100 as import('@/units').Millimeters,
          offsetFromFloorMm: 0 as import('@/units').Millimeters,
          widthMm: 500 as import('@/units').Millimeters,
          heightMm: 500 as import('@/units').Millimeters,
        },
        {
          id: 'dup',
          wallId: 'wall-a',
          offsetXMm: 2000 as import('@/units').Millimeters,
          offsetFromFloorMm: 0 as import('@/units').Millimeters,
          widthMm: 500 as import('@/units').Millimeters,
          heightMm: 500 as import('@/units').Millimeters,
        },
      ],
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('DUPLICATE_OPENING_ID')
  })

  it('rejects malformed opening dimensions', () => {
    const outcome = calculatePreciseWallpaper({
      ...P1_INPUT,
      openings: [{
        id: 'bad',
        wallId: 'wall-a',
        offsetXMm: -1 as import('@/units').Millimeters,
        offsetFromFloorMm: 0 as import('@/units').Millimeters,
        widthMm: 500 as import('@/units').Millimeters,
        heightMm: 500 as import('@/units').Millimeters,
      }],
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('INVALID_OPENING_GEOMETRY')
  })

  it('rejects overlapping openings on P8 fixture', () => {
    const outcome = calculatePreciseWallpaper(P8_INPUT)
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('OVERLAPPING_OPENINGS_UNSUPPORTED')
  })

  it('allows openings whose edges only touch', () => {
    const outcome = calculatePreciseWallpaper({
      ...P1_INPUT,
      openings: [
        {
          id: 'left', wallId: 'wall-a', offsetXMm: mm(0),
          offsetFromFloorMm: mm(0), widthMm: mm(500), heightMm: mm(500),
        },
        {
          id: 'right', wallId: 'wall-a', offsetXMm: mm(500),
          offsetFromFloorMm: mm(0), widthMm: mm(500), heightMm: mm(500),
        },
      ],
    })

    expect(outcome.ok).toBe(true)
  })

  it('allows openings whose corners only touch', () => {
    const outcome = calculatePreciseWallpaper({
      ...P1_INPUT,
      openings: [
        {
          id: 'lower-left', wallId: 'wall-a', offsetXMm: mm(0),
          offsetFromFloorMm: mm(0), widthMm: mm(500), heightMm: mm(500),
        },
        {
          id: 'upper-right', wallId: 'wall-a', offsetXMm: mm(500),
          offsetFromFloorMm: mm(500), widthMm: mm(500), heightMm: mm(500),
        },
      ],
    })

    expect(outcome.ok).toBe(true)
  })

  it.each([
    [
      { id: 'outer', wallId: 'wall-a', offsetXMm: mm(0), offsetFromFloorMm: mm(0), widthMm: mm(1000), heightMm: mm(1000) },
      { id: 'inner', wallId: 'wall-a', offsetXMm: mm(100), offsetFromFloorMm: mm(100), widthMm: mm(100), heightMm: mm(100) },
    ],
    [
      { id: 'same-a', wallId: 'wall-a', offsetXMm: mm(0), offsetFromFloorMm: mm(0), widthMm: mm(500), heightMm: mm(500) },
      { id: 'same-b', wallId: 'wall-a', offsetXMm: mm(0), offsetFromFloorMm: mm(0), widthMm: mm(500), heightMm: mm(500) },
    ],
  ])('rejects nested or identical opening rectangles', (first, second) => {
    const outcome = calculatePreciseWallpaper({
      ...P1_INPUT,
      openings: [first, second],
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('OVERLAPPING_OPENINGS_UNSUPPORTED')
  })

  it('enforces opening id uniqueness across different walls', () => {
    const outcome = calculatePreciseWallpaper({
      ...P1_INPUT,
      walls: [
        { id: 'wall-a', widthMm: mm(4000), heightMm: mm(2700) },
        { id: 'wall-b', widthMm: mm(4000), heightMm: mm(2700) },
      ],
      openings: [
        {
          id: 'dup', wallId: 'wall-a', offsetXMm: mm(0),
          offsetFromFloorMm: mm(0), widthMm: mm(500), heightMm: mm(500),
        },
        {
          id: 'dup', wallId: 'wall-b', offsetXMm: mm(0),
          offsetFromFloorMm: mm(0), widthMm: mm(500), heightMm: mm(500),
        },
      ],
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('DUPLICATE_OPENING_ID')
  })

  it('reuses shared pattern validation for inconsistent straight offset', () => {
    const outcome = calculatePreciseWallpaper({
      ...P1_INPUT,
      pattern: { match: 'straight', repeatMm: mm(640), offsetMm: mm(320) },
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('INCONSISTENT_PATTERN_CONFIG')
  })

  it('rejects precise roll dimensions beyond the shared domain maximum', () => {
    const outcome = calculatePreciseWallpaper({
      ...P1_INPUT,
      roll: { widthMm: mm(100_001), lengthMm: mm(100_001) },
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('INPUT_OVERFLOW')
  })

  it('accepts a floor door shorter than the wall and keeps wall above it', () => {
    // Manual review case: 4.0 × 2.7 m wall, 0.8 × 2.0 m door from the floor.
    const outcome = calculatePreciseWallpaper({
      walls: [{ id: 'wall-a', widthMm: mm(4000), heightMm: mm(2700) }],
      openings: [{
        id: 'door-short',
        wallId: 'wall-a',
        offsetXMm: mm(500),
        offsetFromFloorMm: mm(0),
        widthMm: mm(800),
        heightMm: mm(2000),
      }],
      roll: P1_INPUT.roll,
      trim: P1_INPUT.trim,
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.openingImpacts[0]?.coverageAreaRemovedMm2).toBe(800 * 2000)

    const segmentsAboveDoor = outcome.result.requiredSegments.filter(
      (segment) => segment.yStartMm === 2000 && segment.yEndMm === 2700,
    )
    expect(segmentsAboveDoor.length).toBeGreaterThan(0)
    expect(
      segmentsAboveDoor.every((segment) => segment.wallCoverageLengthMm === 700),
    ).toBe(true)
  })

  it('accepts a realistic window on a 2.7 m wall and rejects it on 2.0 m', () => {
    const windowOpening = {
      id: 'window-realistic',
      wallId: 'wall-a' as const,
      offsetXMm: mm(1000),
      offsetFromFloorMm: mm(800),
      widthMm: mm(1500),
      heightMm: mm(1500),
    }

    const valid = calculatePreciseWallpaper({
      walls: [{ id: 'wall-a', widthMm: mm(4000), heightMm: mm(2700) }],
      openings: [windowOpening],
      roll: P1_INPUT.roll,
      trim: P1_INPUT.trim,
    })
    expect(valid.ok).toBe(true)
    if (valid.ok) {
      const below = valid.result.requiredSegments.some(
        (segment) => segment.yStartMm === 0 && segment.yEndMm === 800,
      )
      const above = valid.result.requiredSegments.some(
        (segment) => segment.yStartMm === 2300 && segment.yEndMm === 2700,
      )
      expect(below).toBe(true)
      expect(above).toBe(true)
    }

    const invalid = calculatePreciseWallpaper({
      walls: [{ id: 'wall-a', widthMm: mm(4000), heightMm: mm(2000) }],
      openings: [windowOpening],
      roll: P1_INPUT.roll,
      trim: P1_INPUT.trim,
    })
    expect(invalid.ok).toBe(false)
    if (invalid.ok) return
    expect(invalid.error.code).toBe('OPENING_OUTSIDE_WALL')
  })
})
