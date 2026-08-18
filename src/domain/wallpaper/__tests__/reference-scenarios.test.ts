import {
  calculateQuickWallpaper,
  recommendRollPurchase,
  type RollUsageEntry,
} from '@/domain/wallpaper'
import {
  REFERENCE_PATTERN_STRAIGHT_640,
  REFERENCE_ROLL_NARROW,
  REFERENCE_ROLL_WIDE,
  REFERENCE_ROOM_4X3,
  SCENARIO_A_EXPECTED,
  SCENARIO_B_EXPECTED,
  SCENARIO_C_EXPECTED,
  SCENARIO_D_INPUT,
  SCENARIO_E_EXPECTED,
  SCENARIO_E_INPUT,
} from '../fixtures/reference-scenarios'

describe('reference scenarios (independent hand-calculated expectations)', () => {
  describe('Scenario A — no pattern, wide roll', () => {
    const outcome = calculateQuickWallpaper({
      room: REFERENCE_ROOM_4X3,
      roll: REFERENCE_ROLL_WIDE,
    })

    it('passes calculation', () => {
      expect(outcome.ok).toBe(true)
    })

    it('matches hand-calculated geometry and roll plan', () => {
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return

      const { result } = outcome
      expect(result.trace.totalWallWidthMm).toBe(SCENARIO_A_EXPECTED.totalWallWidthMm)
      expect(result.trace.cornerAllowanceMm).toBe(SCENARIO_A_EXPECTED.cornerAllowanceMm)
      expect(result.trace.adjustedWallWidthMm).toBe(SCENARIO_A_EXPECTED.adjustedWallWidthMm)
      expect(result.requiredStrips).toBe(SCENARIO_A_EXPECTED.requiredStrips)
      expect(result.rawStripLengthMm).toBe(SCENARIO_A_EXPECTED.rawStripLengthMm)
      expect(result.patternStepMm).toBe(SCENARIO_A_EXPECTED.patternStepMm)
      expect(result.stripsPerFullRoll).toBe(SCENARIO_A_EXPECTED.stripsPerFullRoll)
      expect(result.minimumRolls).toBe(SCENARIO_A_EXPECTED.minimumRolls)
      expect(result.patternApplied).toBe(false)
      expect(result.patternMatch).toBe('free')
    })

    it('explains roll usage including partial last roll', () => {
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return

      const { rollUsage, material } = outcome.result
      expect(rollUsage).toHaveLength(5)
      expect(rollUsage.slice(0, 4).every((r: RollUsageEntry) => r.stripsCut === 3)).toBe(true)
      expect(rollUsage[4].stripsCut).toBe(SCENARIO_A_EXPECTED.lastRollStrips)
      expect(material.totalPhysicalCutLengthMm).toBe(
        SCENARIO_A_EXPECTED.totalPhysicalCutLengthMm,
      )
    })

    it('suggests one spare roll for minimumRolls >= 2', () => {
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return

      const recommendation = recommendRollPurchase(outcome.result.minimumRolls)
      expect(recommendation.ok).toBe(true)
      if (!recommendation.ok) return
      expect(recommendation.result.suggestedTotalRolls).toBe(6)
      expect(recommendation.result.suggestedSpareRolls).toBe(1)
    })
  })

  describe('Scenario B — straight repeat 640 mm', () => {
    const outcome = calculateQuickWallpaper({
      room: REFERENCE_ROOM_4X3,
      roll: REFERENCE_ROLL_WIDE,
      pattern: REFERENCE_PATTERN_STRAIGHT_640,
    })

    it('uses pattern step and physical roll planner', () => {
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return

      expect(outcome.result.patternStepMm).toBe(SCENARIO_B_EXPECTED.patternStepMm)
      expect(outcome.result.stripsPerFullRoll).toBe(SCENARIO_B_EXPECTED.stripsPerFullRoll)
      expect(outcome.result.minimumRolls).toBe(SCENARIO_B_EXPECTED.minimumRolls)
      expect(outcome.result.patternApplied).toBe(true)
      expect(outcome.result.material.totalPhysicalCutLengthMm).toBe(
        SCENARIO_B_EXPECTED.totalPhysicalCutLengthMm,
      )
      expect(outcome.result.material.totalPatternAlignmentLossMm).toBe(
        SCENARIO_B_EXPECTED.totalPatternAlignmentLossMm,
      )
    })

    it('records pattern phase assumption in trace', () => {
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return
      expect(outcome.result.trace.patternPhase.assumesNewRollStartsAtPhaseZero).toBe(true)
      expect(outcome.result.trace.patternPhase.minimumRollsDependsOnPhaseAssumption).toBe(true)
    })
  })

  describe('Scenario C — narrow roll 0.53 m', () => {
    const outcome = calculateQuickWallpaper({
      room: REFERENCE_ROOM_4X3,
      roll: REFERENCE_ROLL_NARROW,
    })

    it('requires more strips and rolls than wide roll', () => {
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return

      expect(outcome.result.requiredStrips).toBe(SCENARIO_C_EXPECTED.requiredStrips)
      expect(outcome.result.minimumRolls).toBe(SCENARIO_C_EXPECTED.minimumRolls)
    })
  })

  describe('Scenario D — strip longer than roll', () => {
    it('returns STRIP_LONGER_THAN_ROLL', () => {
      const outcome = calculateQuickWallpaper(SCENARIO_D_INPUT)
      expect(outcome.ok).toBe(false)
      if (outcome.ok) return
      expect(outcome.error.code).toBe('STRIP_LONGER_THAN_ROLL')
    })
  })

  describe('Scenario E — exact boundary divisions', () => {
    const outcome = calculateQuickWallpaper(SCENARIO_E_INPUT)

    it('avoids extra rounding at strip and roll boundaries', () => {
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return

      expect(outcome.result.requiredStrips).toBe(SCENARIO_E_EXPECTED.requiredStrips)
      expect(outcome.result.stripsPerFullRoll).toBe(SCENARIO_E_EXPECTED.stripsPerFullRoll)
      expect(outcome.result.minimumRolls).toBe(SCENARIO_E_EXPECTED.minimumRolls)
    })

    it('has zero remaining usable length on every roll', () => {
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) return

      expect(
        outcome.result.rollUsage.every(
          (entry: RollUsageEntry) => entry.remainingUsableLengthMm === 0,
        ),
      ).toBe(true)
    })
  })
})
