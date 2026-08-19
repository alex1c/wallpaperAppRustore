import {
  parsePatternForm,
  withPatternInput,
} from '@/features/wallpaper/input/parse-pattern-form'
import { calculateQuickWallpaper } from '@/domain/wallpaper'
import {
  REFERENCE_ROLL_WIDE,
  REFERENCE_ROOM_4X3,
  SCENARIO_A_EXPECTED,
  SCENARIO_B_EXPECTED,
} from '@/domain/wallpaper/fixtures/reference-scenarios'
import { buildExplanationSteps } from '@/features/wallpaper/presenter/build-explanation-steps'
import { setLocale } from '@/i18n'

describe('parsePatternForm', () => {
  it('converts straight repeat 64 cm to 640 mm', () => {
    const outcome = parsePatternForm({ matchType: 'straight', repeatCm: '64' })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.pattern?.match).toBe('straight')
    expect(outcome.pattern?.repeatMm).toBe(640)
  })

  it('accepts comma decimal repeat input', () => {
    const outcome = parsePatternForm({ matchType: 'straight', repeatCm: '64,0' })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.pattern?.repeatMm).toBe(640)
  })

  it('rejects malformed repeat input', () => {
    const outcome = parsePatternForm({ matchType: 'straight', repeatCm: 'abc' })

    expect(outcome.ok).toBe(false)
    if (outcome.ok || !('fieldErrors' in outcome)) return

    expect(outcome.fieldErrors.repeatCm).toBe('INVALID_FORMAT')
  })

  it('returns undefined pattern for free match', () => {
    const outcome = parsePatternForm({ matchType: 'free', repeatCm: '' })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.pattern).toBeUndefined()
  })

  it('blocks half-drop without calling domain', () => {
    const outcome = parsePatternForm({ matchType: 'half-drop', repeatCm: '64' })

    expect(outcome.ok).toBe(false)
    if (outcome.ok || !('halfDropDeferred' in outcome)) return

    expect(outcome.halfDropDeferred).toBe(true)
  })
})

describe('pattern calculation integration', () => {
  beforeEach(() => {
    setLocale('ru')
  })

  it('keeps free-match quick result unchanged (Scenario A)', () => {
    const base = {
      room: REFERENCE_ROOM_4X3,
      roll: REFERENCE_ROLL_WIDE,
    }

    const withoutPattern = calculateQuickWallpaper(base)
    const withFree = calculateQuickWallpaper(withPatternInput(base, undefined))

    expect(withoutPattern.ok).toBe(true)
    expect(withFree.ok).toBe(true)
    if (!withoutPattern.ok || !withFree.ok) return

    expect(withFree.result.minimumRolls).toBe(SCENARIO_A_EXPECTED.minimumRolls)
    expect(withFree.result.requiredStrips).toBe(withoutPattern.result.requiredStrips)
    expect(withFree.result.minimumRolls).toBe(withoutPattern.result.minimumRolls)
  })

  it('uses domain straight match result for 64 cm repeat (Scenario B)', () => {
    const patternParsed = parsePatternForm({ matchType: 'straight', repeatCm: '64' })
    expect(patternParsed.ok).toBe(true)
    if (!patternParsed.ok) return

    const outcome = calculateQuickWallpaper(withPatternInput({
      room: REFERENCE_ROOM_4X3,
      roll: REFERENCE_ROLL_WIDE,
    }, patternParsed.pattern))

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.patternApplied).toBe(true)
    expect(outcome.result.patternStepMm).toBe(SCENARIO_B_EXPECTED.patternStepMm)
    expect(outcome.result.minimumRolls).toBe(SCENARIO_B_EXPECTED.minimumRolls)
    expect(outcome.result.trace.patternPhase.minimumRollsDependsOnPhaseAssumption).toBe(true)
  })

  it('builds straight-match explanation distinguishing physical strip and pattern step', () => {
    const patternParsed = parsePatternForm({ matchType: 'straight', repeatCm: '64' })
    expect(patternParsed.ok).toBe(true)
    if (!patternParsed.ok) return

    const outcome = calculateQuickWallpaper(withPatternInput({
      room: REFERENCE_ROOM_4X3,
      roll: REFERENCE_ROLL_WIDE,
    }, patternParsed.pattern))

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.rawStripLengthMm).toBe(2800)
    expect(outcome.result.patternStepMm).toBe(3200)
    expect(outcome.result.rawStripLengthMm).not.toBe(outcome.result.patternStepMm)

    const steps = buildExplanationSteps(outcome.result.trace, 'ru')
    const combined = steps.map((step) => step.body).join(' ')

    expect(combined).toMatch(/Физическая длина полотна/)
    expect(combined).toMatch(/2,80\s+м/)
    expect(combined).toMatch(/шагом 3,20\s+м/)
    expect(combined).toMatch(/40\s+см/)
    expect(combined).not.toMatch(/Физическая длина полотна — 3,20/)
    expect(combined).not.toMatch(/patternStep|minimumRolls/)
  })

  it('builds 3,10 m physical vs 3,20 m pattern step for 32 cm repeat at 3 m height', () => {
    const patternParsed = parsePatternForm({ matchType: 'straight', repeatCm: '32' })
    expect(patternParsed.ok).toBe(true)
    if (!patternParsed.ok) return

    const outcome = calculateQuickWallpaper(withPatternInput({
      room: {
        lengthMm: 4000 as import('@/units').Millimeters,
        widthMm: 3000 as import('@/units').Millimeters,
        heightMm: 3000 as import('@/units').Millimeters,
      },
      roll: REFERENCE_ROLL_WIDE,
    }, patternParsed.pattern))

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.rawStripLengthMm).toBe(3100)
    expect(outcome.result.patternStepMm).toBe(3200)

    const combined = buildExplanationSteps(outcome.result.trace, 'ru')
      .map((step) => step.body)
      .join(' ')

    expect(combined).toMatch(/3,10\s+м/)
    expect(combined).toMatch(/шагом 3,20\s+м/)
    expect(combined).toMatch(/10\s+см/)
  })

  it('preserves millimeter-precise repeat and alignment gap in cm explanation', () => {
    const patternParsed = parsePatternForm({ matchType: 'straight', repeatCm: '64,1' })
    expect(patternParsed.ok).toBe(true)
    if (!patternParsed.ok) return

    const outcome = calculateQuickWallpaper(withPatternInput({
      room: REFERENCE_ROOM_4X3,
      roll: REFERENCE_ROLL_WIDE,
    }, patternParsed.pattern))

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.result.trace.patternRepeatMm).toBe(641)
    expect(outcome.result.patternStepMm - outcome.result.rawStripLengthMm).toBe(405)

    const combined = buildExplanationSteps(outcome.result.trace, 'ru')
      .map((step) => step.body)
      .join(' ')

    expect(combined).toMatch(/64,1\s+см/)
    expect(combined).toMatch(/40,5\s+см/)
  })

  it('does not produce numeric result for half-drop via parse guard', () => {
    const blocked = parsePatternForm({ matchType: 'half-drop', repeatCm: '64' })
    expect(blocked.ok).toBe(false)
  })
})
