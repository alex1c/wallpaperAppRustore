import {
  calculateQuickWallpaper,
  calculateWallpaper,
  ZERO_CORNER_POLICY,
} from '@/domain/wallpaper'
import {
  REFERENCE_ROLL_WIDE,
  REFERENCE_ROOM_4X3,
} from '../fixtures/reference-scenarios'

const mm = (value: number) => value as import('@/units').Millimeters

function baseQuickInput(overrides: Record<string, unknown> = {}) {
  return {
    room: REFERENCE_ROOM_4X3,
    roll: REFERENCE_ROLL_WIDE,
    cornerAllowance: ZERO_CORNER_POLICY,
    ...overrides,
  }
}

describe('property and invariant tests', () => {
  it('increasing adjusted wall width never decreases required strips', () => {
    const base = calculateQuickWallpaper(baseQuickInput())
    const wider = calculateQuickWallpaper(baseQuickInput({
      room: {
        ...REFERENCE_ROOM_4X3,
        lengthMm: mm(4100),
      },
    }))

    expect(base.ok && wider.ok).toBe(true)
    if (!base.ok || !wider.ok) return
    expect(wider.result.requiredStrips).toBeGreaterThanOrEqual(base.result.requiredStrips)
  })

  it('decreasing roll width never decreases required strips', () => {
    const base = calculateQuickWallpaper(baseQuickInput())
    const narrow = calculateQuickWallpaper(baseQuickInput({
      roll: { ...REFERENCE_ROLL_WIDE, widthMm: mm(530) },
    }))

    expect(base.ok && narrow.ok).toBe(true)
    if (!base.ok || !narrow.ok) return
    expect(narrow.result.requiredStrips).toBeGreaterThanOrEqual(base.result.requiredStrips)
  })

  it('increasing trim never decreases raw strip length or roll consumption', () => {
    const lowTrim = calculateQuickWallpaper(baseQuickInput({
      trim: { topMm: mm(0), bottomMm: mm(0) },
    }))
    const highTrim = calculateQuickWallpaper(baseQuickInput({
      trim: { topMm: mm(100), bottomMm: mm(100) },
    }))

    expect(lowTrim.ok && highTrim.ok).toBe(true)
    if (!lowTrim.ok || !highTrim.ok) return
    expect(highTrim.result.rawStripLengthMm).toBeGreaterThanOrEqual(
      lowTrim.result.rawStripLengthMm,
    )
    expect(highTrim.result.material.totalRollLengthConsumedMm).toBeGreaterThanOrEqual(
      lowTrim.result.material.totalRollLengthConsumedMm,
    )
  })

  it('decreasing roll length never increases strips per full roll', () => {
    const longRoll = calculateQuickWallpaper(baseQuickInput())
    const shortRoll = calculateQuickWallpaper(baseQuickInput({
      roll: { ...REFERENCE_ROLL_WIDE, lengthMm: mm(5600) },
    }))

    expect(longRoll.ok && shortRoll.ok).toBe(true)
    if (!longRoll.ok || !shortRoll.ok) return
    expect(shortRoll.result.stripsPerFullRoll).toBeLessThanOrEqual(
      longRoll.result.stripsPerFullRoll,
    )
  })

  it('total strips cut equals required strips', () => {
    const outcome = calculateQuickWallpaper(baseQuickInput())
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    const cutTotal = outcome.result.rollUsage.reduce(
      (sum, entry) => sum + entry.stripsCut,
      0,
    )
    expect(cutTotal).toBe(outcome.result.requiredStrips)
  })

  it('remaining usable length is never negative', () => {
    const cases = [
      baseQuickInput(),
      baseQuickInput({ pattern: { match: 'straight' as const, repeatMm: mm(640) } }),
    ]

    for (const input of cases) {
      const outcome = calculateQuickWallpaper(input)
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return
      for (const roll of outcome.result.rollUsage) {
        expect(roll.remainingUsableLengthMm).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('physical cut plan never exceeds roll length', () => {
    const outcome = calculateQuickWallpaper(baseQuickInput({
      pattern: { match: 'straight', repeatMm: mm(640) },
    }))
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    for (const roll of outcome.result.rollUsage) {
      for (const cut of roll.stripCuts) {
        expect(cut.physicalEndMm).toBeLessThanOrEqual(outcome.result.trace.rollLengthMm)
      }
    }
  })

  it('exact boundary width does not add extra strip; +1 mm does when at limit', () => {
    const walls = [
      { id: 'w1', widthMm: mm(5300), heightMm: mm(2700) },
      { id: 'w2', widthMm: mm(5300), heightMm: mm(2700) },
    ]
    const exact = calculateWallpaper({
      walls,
      roll: { widthMm: mm(1060), lengthMm: mm(10050) },
      trim: { topMm: mm(50), bottomMm: mm(50) },
      cornerAllowance: ZERO_CORNER_POLICY,
    })
    const wallsPlusOne = [
      { id: 'w1', widthMm: mm(5301), heightMm: mm(2700) },
      { id: 'w2', widthMm: mm(5300), heightMm: mm(2700) },
    ]
    const plusOne = calculateWallpaper({
      walls: wallsPlusOne,
      roll: { widthMm: mm(1060), lengthMm: mm(10050) },
      trim: { topMm: mm(50), bottomMm: mm(50) },
      cornerAllowance: ZERO_CORNER_POLICY,
    })

    expect(exact.ok && plusOne.ok).toBe(true)
    if (!exact.ok || !plusOne.ok) return
    expect(exact.result.requiredStrips).toBe(10)
    expect(plusOne.result.requiredStrips).toBe(11)
  })

  it('generated loop: safe integer inputs produce valid outcomes', () => {
    for (let length = 2000; length <= 6000; length += 500) {
      const outcome = calculateQuickWallpaper({
        room: {
          lengthMm: mm(length),
          widthMm: mm(3000),
          heightMm: mm(2700),
        },
        roll: { widthMm: mm(530), lengthMm: mm(10050) },
        cornerAllowance: ZERO_CORNER_POLICY,
      })
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return
      expect(outcome.result.requiredStrips).toBeGreaterThan(0)
      expect(outcome.result.minimumRolls).toBeGreaterThan(0)
    }
  })
})
