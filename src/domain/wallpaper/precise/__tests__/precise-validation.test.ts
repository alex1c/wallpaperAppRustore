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
})
