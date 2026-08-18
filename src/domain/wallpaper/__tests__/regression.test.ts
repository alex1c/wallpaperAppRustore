import {
  buildPhysicalRollPlan,
  countMaxStripsOnRoll,
} from '../roll-planning'
import {
  DEFAULT_QUICK_CORNER_POLICY,
  ZERO_CORNER_POLICY,
} from '../corner-policy'
import {
  calculateQuickWallpaper,
  calculateWallpaper,
} from '@/domain/wallpaper'
import { STRAIGHT_PHYSICAL_REGRESSION } from '../fixtures/reference-scenarios'

describe('straight-match physical roll planner regression', () => {
  const { rawStripLengthMm, patternStepMm } = STRAIGHT_PHYSICAL_REGRESSION

  it('fits 3 strips on 9200 mm roll with starts 0, 3200, 6400 ending at 9200', () => {
    const count = countMaxStripsOnRoll(
      9200 as import('@/units').Millimeters,
      rawStripLengthMm as import('@/units').Millimeters,
      patternStepMm as import('@/units').Millimeters,
    )
    expect(count).toBe(3)

    const plan = buildPhysicalRollPlan({
      requiredStrips: 3,
      rollLengthMm: 9200 as import('@/units').Millimeters,
      rawStripLengthMm: rawStripLengthMm as import('@/units').Millimeters,
      patternStepMm: patternStepMm as import('@/units').Millimeters,
    })

    const cuts = plan.rollUsage[0].stripCuts
    expect(cuts.map((c) => c.startOffsetMm)).toEqual([0, 3200, 6400])
    expect(cuts[2].physicalEndMm).toBe(9200)
    expect(plan.rollUsage[0].rollLengthConsumedMm).toBe(9200)
    expect(plan.rollUsage[0].remainingUsableLengthMm).toBe(0)
  })

  it('9199 mm roll fits 2 strips; 9201 mm still fits 3', () => {
    const mm = (v: number) => v as import('@/units').Millimeters
    expect(countMaxStripsOnRoll(mm(9199), mm(rawStripLengthMm), mm(patternStepMm))).toBe(2)
    expect(countMaxStripsOnRoll(mm(9200), mm(rawStripLengthMm), mm(patternStepMm))).toBe(3)
    expect(countMaxStripsOnRoll(mm(9201), mm(rawStripLengthMm), mm(patternStepMm))).toBe(3)
  })

  it('does not count trailing alignment gap as consumed material', () => {
    const plan = buildPhysicalRollPlan({
      requiredStrips: 3,
      rollLengthMm: 9200 as import('@/units').Millimeters,
      rawStripLengthMm: rawStripLengthMm as import('@/units').Millimeters,
      patternStepMm: patternStepMm as import('@/units').Millimeters,
    })

    const alignmentLoss = plan.rollUsage[0].alignmentLossMm
    expect(alignmentLoss).toBe(800)
    expect(plan.rollUsage[0].rollLengthConsumedMm).toBe(9200)
    expect(plan.rollUsage[0].rollLengthConsumedMm).not.toBe(3 * patternStepMm)
  })
})

describe('corner allowance boundary regression', () => {
  const mm = (v: number) => v as import('@/units').Millimeters

  const walls = [
    { id: 'w1', widthMm: mm(5000), heightMm: mm(2700) },
    { id: 'w2', widthMm: mm(300), heightMm: mm(2700) },
    { id: 'w3', widthMm: mm(5000), heightMm: mm(2700) },
    { id: 'w4', widthMm: mm(300), heightMm: mm(2700) },
  ]

  it('requires one extra strip when corner allowance breaks exact fit', () => {
    const withoutCorner = calculateWallpaper({
      walls,
      roll: { widthMm: mm(1060), lengthMm: mm(10050) },
      trim: { topMm: mm(50), bottomMm: mm(50) },
      cornerAllowance: ZERO_CORNER_POLICY,
    })
    const withCorner = calculateWallpaper({
      walls,
      roll: { widthMm: mm(1060), lengthMm: mm(10050) },
      trim: { topMm: mm(50), bottomMm: mm(50) },
      cornerAllowance: DEFAULT_QUICK_CORNER_POLICY,
    })

    expect(withoutCorner.ok).toBe(true)
    expect(withCorner.ok).toBe(true)
    if (!withoutCorner.ok || !withCorner.ok) return

    expect(withoutCorner.result.requiredStrips).toBe(10)
    expect(withCorner.result.requiredStrips).toBe(11)
    expect(withCorner.result.trace.cornerAllowanceMm).toBe(80)
  })
})

describe('different wall heights regression', () => {
  it('returns UNSUPPORTED_DIFFERENT_WALL_HEIGHTS for Codex counterexample', () => {
    const mm = (v: number) => v as import('@/units').Millimeters
    const outcome = calculateWallpaper({
      walls: [
        { id: 'w1', widthMm: mm(10000), heightMm: mm(2500) },
        { id: 'w2', widthMm: mm(1000), heightMm: mm(5000) },
      ],
      roll: { widthMm: mm(1060), lengthMm: mm(10050) },
      trim: { topMm: mm(50), bottomMm: mm(50) },
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('UNSUPPORTED_DIFFERENT_WALL_HEIGHTS')
  })
})

describe('duplicate wall ids', () => {
  it('returns INVALID_INPUT_STRUCTURE for duplicate wall.id', () => {
    const mm = (v: number) => v as import('@/units').Millimeters
    const outcome = calculateWallpaper({
      walls: [
        { id: 'north', widthMm: mm(4000), heightMm: mm(2700) },
        { id: 'north', widthMm: mm(3000), heightMm: mm(2700) },
      ],
      roll: { widthMm: mm(1060), lengthMm: mm(10050) },
      trim: { topMm: mm(50), bottomMm: mm(50) },
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('INVALID_INPUT_STRUCTURE')
  })
})

describe('scenario E default corner vs zero-corner fixture', () => {
  it('requires 4 rolls with default corner policy', () => {
    const mm = (v: number) => v as import('@/units').Millimeters
    const outcome = calculateQuickWallpaper({
      room: {
        lengthMm: mm(3000),
        widthMm: mm(3000),
        heightMm: mm(2700),
      },
      roll: { widthMm: mm(1000), lengthMm: mm(11200) },
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.result.requiredStrips).toBe(13)
    expect(outcome.result.minimumRolls).toBe(4)
  })
})

describe('repeat greater than raw strip length', () => {
  it('allows calculation when physical cut fits even if repeat exceeds raw', () => {
    const mm = (v: number) => v as import('@/units').Millimeters
    const outcome = calculateQuickWallpaper({
      room: { lengthMm: mm(4000), widthMm: mm(3000), heightMm: mm(2700) },
      roll: { widthMm: mm(1060), lengthMm: mm(10050) },
      pattern: { match: 'straight', repeatMm: mm(3000) },
      cornerAllowance: ZERO_CORNER_POLICY,
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.result.patternStepMm).toBe(3000)
    expect(outcome.result.rawStripLengthMm).toBe(2800)
    expect(outcome.result.stripsPerFullRoll).toBeGreaterThan(0)
  })
})

describe('zero trim regression', () => {
  it('accepts topTrim=0 and bottomTrim=0', () => {
    const mm = (v: number) => v as import('@/units').Millimeters
    const outcome = calculateQuickWallpaper({
      room: { lengthMm: mm(4000), widthMm: mm(3000), heightMm: mm(2700) },
      roll: { widthMm: mm(1060), lengthMm: mm(10050) },
      trim: { topMm: mm(0), bottomMm: mm(0) },
      cornerAllowance: ZERO_CORNER_POLICY,
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.result.rawStripLengthMm).toBe(2700)
  })
})

describe('runtime validation regression', () => {
  it('rejects unknown pattern match', () => {
    const outcome = calculateQuickWallpaper({
      room: {
        lengthMm: 4000 as import('@/units').Millimeters,
        widthMm: 3000 as import('@/units').Millimeters,
        heightMm: 2700 as import('@/units').Millimeters,
      },
      roll: {
        widthMm: 1060 as import('@/units').Millimeters,
        lengthMm: 10050 as import('@/units').Millimeters,
      },
      pattern: { match: 'diagonal' as 'free' },
    })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('INVALID_PATTERN_MATCH')
  })

  it('rejects straight match with non-zero offset', () => {
    const mm = (v: number) => v as import('@/units').Millimeters
    const outcome = calculateQuickWallpaper({
      room: { lengthMm: mm(4000), widthMm: mm(3000), heightMm: mm(2700) },
      roll: { widthMm: mm(1060), lengthMm: mm(10050) },
      pattern: { match: 'straight', repeatMm: mm(640), offsetMm: mm(320) },
    })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('INCONSISTENT_PATTERN_CONFIG')
  })

  it('rejects fractional millimeters', () => {
    const outcome = calculateQuickWallpaper({
      room: {
        lengthMm: 4000.5 as import('@/units').Millimeters,
        widthMm: 3000 as import('@/units').Millimeters,
        heightMm: 2700 as import('@/units').Millimeters,
      },
      roll: {
        widthMm: 1060 as import('@/units').Millimeters,
        lengthMm: 10050 as import('@/units').Millimeters,
      },
    })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('INVALID_DIMENSION')
  })

  it('rejects null input structures', () => {
    expect(calculateQuickWallpaper(null).ok).toBe(false)
    expect(calculateWallpaper(null).ok).toBe(false)
  })
})
