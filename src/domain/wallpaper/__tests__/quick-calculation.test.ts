import {
  assessOwnedFullRolls,
  calculateQuickWallpaper,
  recommendRollPurchase,
  ZERO_CORNER_POLICY,
} from '@/domain/wallpaper'
import { centimetersToMillimeters, metersToMillimeters } from '@/units'
import {
  REFERENCE_ROLL_WIDE,
  REFERENCE_ROOM_4X3,
  SCENARIO_A_EXPECTED,
} from '../fixtures/reference-scenarios'

const mm = (value: number) => value as import('@/units').Millimeters

function baseInput(overrides: Record<string, unknown> = {}) {
  return {
    room: REFERENCE_ROOM_4X3,
    roll: REFERENCE_ROLL_WIDE,
    cornerAllowance: ZERO_CORNER_POLICY,
    ...overrides,
  }
}

describe('calculateQuickWallpaper', () => {
  describe('basic geometry', () => {
    const cases = [
      {
        name: 'standard rectangular room (reference A, zero corner)',
        input: baseInput(),
        expectedStrips: 14,
        expectedRolls: 5,
      },
      {
        name: 'narrow room increases strip count',
        input: baseInput({
          room: {
            lengthMm: metersToMillimeters(2),
            widthMm: metersToMillimeters(2),
            heightMm: metersToMillimeters(2.7),
          },
          roll: { widthMm: metersToMillimeters(0.53), lengthMm: metersToMillimeters(10.05) },
        }),
        expectedStrips: 16,
        expectedRolls: 6,
      },
      {
        name: 'large room',
        input: baseInput({
          room: {
            lengthMm: metersToMillimeters(8),
            widthMm: metersToMillimeters(6),
            heightMm: metersToMillimeters(3),
          },
        }),
        expectedStrips: 27,
        expectedRolls: 9,
      },
      {
        name: 'exact division by roll width',
        input: baseInput({
          room: {
            lengthMm: metersToMillimeters(5),
            widthMm: metersToMillimeters(5),
            heightMm: metersToMillimeters(2.7),
          },
          roll: { widthMm: metersToMillimeters(1), lengthMm: metersToMillimeters(10.05) },
        }),
        expectedStrips: 20,
        expectedRolls: 7,
      },
      {
        name: 'one extra strip due to rounding',
        input: baseInput({
          room: {
            lengthMm: metersToMillimeters(4.5),
            widthMm: metersToMillimeters(3),
            heightMm: metersToMillimeters(2.7),
          },
        }),
        expectedStrips: 15,
        expectedRolls: 5,
      },
    ] as const

    it.each(cases)('$name', ({ input, expectedStrips, expectedRolls }) => {
      const outcome = calculateQuickWallpaper(input)
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return
      expect(outcome.result.requiredStrips).toBe(expectedStrips)
      expect(outcome.result.minimumRolls).toBe(expectedRolls)
    })
  })

  describe('roll cutting', () => {
    it('fits exact strips with known remainder', () => {
      const outcome = calculateQuickWallpaper(baseInput())
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return

      expect(outcome.result.stripsPerFullRoll).toBe(3)
      expect(outcome.result.rollUsage[0].remainingUsableLengthMm).toBe(1650)
    })

    it('supports only one strip per roll', () => {
      const outcome = calculateQuickWallpaper({
        room: {
          lengthMm: metersToMillimeters(4),
          widthMm: metersToMillimeters(1),
          heightMm: metersToMillimeters(9),
        },
        roll: {
          widthMm: metersToMillimeters(1.06),
          lengthMm: metersToMillimeters(10),
        },
        trim: {
          topMm: centimetersToMillimeters(5),
          bottomMm: centimetersToMillimeters(5),
        },
        cornerAllowance: ZERO_CORNER_POLICY,
      })
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return
      expect(outcome.result.stripsPerFullRoll).toBe(1)
      expect(outcome.result.minimumRolls).toBe(outcome.result.requiredStrips)
    })
  })

  describe('pattern', () => {
    it('leaves pattern step unchanged without pattern', () => {
      const outcome = calculateQuickWallpaper(baseInput())
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return
      expect(outcome.result.rawStripLengthMm).toBe(outcome.result.patternStepMm)
    })

    it('rounds pattern step up to repeat for straight match', () => {
      const outcome = calculateQuickWallpaper(baseInput({
        pattern: { match: 'straight', repeatMm: centimetersToMillimeters(64) },
      }))
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return
      expect(outcome.result.patternStepMm).toBe(3200)
    })

    it('rounds pattern step up when repeat does not divide raw length', () => {
      const outcome = calculateQuickWallpaper(baseInput({
        room: {
          lengthMm: metersToMillimeters(4),
          widthMm: metersToMillimeters(3),
          heightMm: metersToMillimeters(2.75),
        },
        pattern: { match: 'straight', repeatMm: centimetersToMillimeters(64) },
      }))
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return
      expect(outcome.result.rawStripLengthMm).toBe(2850)
      expect(outcome.result.patternStepMm).toBe(3200)
    })

    it('reduces stripsPerRoll from 4 to 3 when repeat applies', () => {
      const room = {
        lengthMm: metersToMillimeters(2),
        widthMm: metersToMillimeters(2),
        heightMm: metersToMillimeters(2.4),
      }
      const roll = {
        widthMm: metersToMillimeters(0.53),
        lengthMm: metersToMillimeters(10.05),
      }
      const withoutPattern = calculateQuickWallpaper({
        room, roll, cornerAllowance: ZERO_CORNER_POLICY,
      })
      const withPattern = calculateQuickWallpaper({
        room,
        roll,
        cornerAllowance: ZERO_CORNER_POLICY,
        pattern: { match: 'straight', repeatMm: centimetersToMillimeters(64) },
      })

      expect(withoutPattern.ok).toBe(true)
      expect(withPattern.ok).toBe(true)
      if (!withoutPattern.ok || !withPattern.ok) return

      expect(withoutPattern.result.stripsPerFullRoll).toBe(4)
      expect(withPattern.result.stripsPerFullRoll).toBe(3)
    })
  })

  describe('validation — boundary and invalid inputs', () => {
    it.each([
      ['zero room width', baseInput({ room: { ...REFERENCE_ROOM_4X3, widthMm: mm(0) } })],
      ['negative height', baseInput({ room: { ...REFERENCE_ROOM_4X3, heightMm: mm(-100) } })],
      ['zero roll length', baseInput({ roll: { ...REFERENCE_ROLL_WIDE, lengthMm: mm(0) } })],
      ['NaN dimension', baseInput({ room: { ...REFERENCE_ROOM_4X3, lengthMm: Number.NaN as typeof REFERENCE_ROOM_4X3.lengthMm } })],
    ])('rejects %s', (_label, input) => {
      const outcome = calculateQuickWallpaper(input)
      expect(outcome.ok).toBe(false)
      if (outcome.ok) return
      expect(outcome.error.code).toBe('INVALID_DIMENSION')
    })

    it('rejects extremely large inputs', () => {
      const outcome = calculateQuickWallpaper(baseInput({
        room: {
          lengthMm: mm(200_000),
          widthMm: metersToMillimeters(3),
          heightMm: metersToMillimeters(2.7),
        },
      }))
      expect(outcome.ok).toBe(false)
      if (outcome.ok) return
      expect(outcome.error.code).toBe('INPUT_OVERFLOW')
    })

    it('rejects half-drop pattern match', () => {
      const outcome = calculateQuickWallpaper(baseInput({
        pattern: { match: 'half-drop', repeatMm: centimetersToMillimeters(64) },
      }))
      expect(outcome.ok).toBe(false)
      if (outcome.ok) return
      expect(outcome.error.code).toBe('UNSUPPORTED_PATTERN_MATCH')
    })

    it('rejects straight match without repeat', () => {
      const outcome = calculateQuickWallpaper(baseInput({
        pattern: { match: 'straight' },
      }))
      expect(outcome.ok).toBe(false)
      if (outcome.ok) return
      expect(outcome.error.code).toBe('INVALID_REPEAT')
    })
  })

  describe('explainability — trace and rollUsage totals', () => {
    it('provides structured trace without UI strings', () => {
      const outcome = calculateQuickWallpaper({
        room: REFERENCE_ROOM_4X3,
        roll: REFERENCE_ROLL_WIDE,
      })
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return

      expect(outcome.result.trace.adjustedWallWidthMm).toBe(
        SCENARIO_A_EXPECTED.adjustedWallWidthMm,
      )
      expect(outcome.result.trace.cornerAllowanceMm).toBe(
        SCENARIO_A_EXPECTED.cornerAllowanceMm,
      )
    })

    it('sums strip counts to requiredStrips', () => {
      const outcome = calculateQuickWallpaper(baseInput())
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return

      const stripSum = outcome.result.rollUsage.reduce(
        (sum, entry) => sum + entry.stripsCut,
        0,
      )
      expect(stripSum).toBe(outcome.result.requiredStrips)
      expect(stripSum).toBe(SCENARIO_A_EXPECTED.requiredStrips)
    })
  })
})

describe('recommendRollPurchase', () => {
  it('does not suggest spare for single-roll minimum', () => {
    const recommendation = recommendRollPurchase(1)
    expect(recommendation.ok).toBe(true)
    if (!recommendation.ok) return
    expect(recommendation.result.suggestedTotalRolls).toBe(1)
    expect(recommendation.result.suggestedSpareRolls).toBe(0)
  })

  it('suggests one spare with reason codes when minimum >= 2', () => {
    const recommendation = recommendRollPurchase(5)
    expect(recommendation.ok).toBe(true)
    if (!recommendation.ok) return
    expect(recommendation.result.suggestedTotalRolls).toBe(6)
    expect(recommendation.result.reasonCodes.length).toBeGreaterThan(0)
  })

  it.each([
    ['negative', -1],
    ['fractional', 2.5],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['unsafe integer', Number.MAX_SAFE_INTEGER + 1],
  ])('rejects invalid minimumRolls: %s', (_label, value) => {
    const recommendation = recommendRollPurchase(value)
    expect(recommendation.ok).toBe(false)
    if (recommendation.ok) return
    expect(recommendation.error.code).toBe('INVALID_DIMENSION')
  })

  it('accepts zero minimumRolls', () => {
    const recommendation = recommendRollPurchase(0)
    expect(recommendation.ok).toBe(true)
    if (!recommendation.ok) return
    expect(recommendation.result.suggestedTotalRolls).toBe(0)
  })
})

describe('assessOwnedFullRolls', () => {
  const calculationOutcome = calculateQuickWallpaper({
    room: REFERENCE_ROOM_4X3,
    roll: REFERENCE_ROLL_WIDE,
  })

  it('reports exact sufficiency', () => {
    expect(calculationOutcome.ok).toBe(true)
    if (!calculationOutcome.ok) return

    const assessment = assessOwnedFullRolls(calculationOutcome.result, 5)
    expect(assessment.ok).toBe(true)
    if (!assessment.ok) return
    expect(assessment.result.isSufficient).toBe(true)
    expect(assessment.result.shortageRolls).toBe(0)
    expect(assessment.result.surplusRolls).toBe(0)
  })

  it('reports shortage rolls and strips', () => {
    expect(calculationOutcome.ok).toBe(true)
    if (!calculationOutcome.ok) return

    const assessment = assessOwnedFullRolls(calculationOutcome.result, 3)
    expect(assessment.ok).toBe(true)
    if (!assessment.ok) return
    expect(assessment.result.isSufficient).toBe(false)
    expect(assessment.result.shortageRolls).toBe(2)
    expect(assessment.result.missingStrips).toBe(5)
  })

  it('reports surplus rolls', () => {
    expect(calculationOutcome.ok).toBe(true)
    if (!calculationOutcome.ok) return

    const assessment = assessOwnedFullRolls(calculationOutcome.result, 7)
    expect(assessment.ok).toBe(true)
    if (!assessment.ok) return
    expect(assessment.result.surplusRolls).toBe(2)
    expect(assessment.result.missingStrips).toBe(0)
  })

  it('rejects negative owned full rolls', () => {
    expect(calculationOutcome.ok).toBe(true)
    if (!calculationOutcome.ok) return

    const assessment = assessOwnedFullRolls(calculationOutcome.result, -1)
    expect(assessment.ok).toBe(false)
    if (assessment.ok) return
    expect(assessment.error.code).toBe('INVALID_DIMENSION')
  })
})
