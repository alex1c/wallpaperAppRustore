import {
  calculateQuickWallpaper,
  recommendRollPurchaseFromResult,
} from '@/domain/wallpaper'
import {
  REFERENCE_ROLL_WIDE,
  REFERENCE_ROOM_4X3,
  SCENARIO_A_EXPECTED,
} from '@/domain/wallpaper/fixtures/reference-scenarios'
import {
  buildExplanationSteps,
  mapDomainErrorToMessageKey,
  presentWallpaperQuickResult,
} from '@/features/wallpaper/presenter'
import { setLocale } from '@/i18n'

describe('wallpaper result presenter', () => {
  beforeEach(() => {
    setLocale('ru')
  })

  const scenarioA = () => {
    const outcome = calculateQuickWallpaper({
      room: REFERENCE_ROOM_4X3,
      roll: REFERENCE_ROLL_WIDE,
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) {
      throw new Error('Scenario A should pass')
    }

    const recommendation = recommendRollPurchaseFromResult(outcome.result)
    expect(recommendation.ok).toBe(true)
    if (!recommendation.ok) {
      throw new Error('Recommendation should pass')
    }

    return {
      result: outcome.result,
      recommendation: recommendation.result,
    }
  }

  it('keeps minimumRolls unchanged from domain (Scenario A)', () => {
    const { result, recommendation } = scenarioA()

    const presented = presentWallpaperQuickResult(result, recommendation, 'ru')

    expect(presented.minimumRolls).toBe(SCENARIO_A_EXPECTED.minimumRolls)
    expect(presented.minimumRolls).toBe(result.minimumRolls)
    expect(presented.minimumRollsValue).toBe('5')
  })

  it('separates minimum rolls from spare recommendation', () => {
    const { result, recommendation } = scenarioA()
    const presented = presentWallpaperQuickResult(result, recommendation, 'ru')

    expect(presented.minimumRolls).toBe(5)
    expect(presented.recommendation).not.toBeNull()
    expect(presented.recommendation?.totalWithSpareMessage).toContain('6')
    expect(presented.recommendation?.spareMessage).toMatch(/1\s+рулон/)
  })

  it('builds Scenario A explanation with corner allowance step', () => {
    const { result } = scenarioA()
    const steps = buildExplanationSteps(result.trace, 'ru')

    expect(steps.length).toBeGreaterThanOrEqual(4)

    const combined = steps.map((step) => step.body).join(' ')

    expect(combined).toContain('14')
    expect(combined).toContain('14,08')
    expect(combined).toMatch(/14\s+полот/)
    expect(combined).toContain('2,80')
    expect(combined).toMatch(/5\s+рулон/)
  })

  it('formats lengths with RU decimal comma', () => {
    const { result, recommendation } = scenarioA()
    const presented = presentWallpaperQuickResult(result, recommendation, 'ru')
    const steps = presented.explanationSteps
    const combined = steps.map((step) => step.body).join(' ')

    expect(combined).toMatch(/2,70/)
    expect(combined).toMatch(/10,05/)
  })

  it('derives top and bottom trim copy from the calculation trace', () => {
    const outcome = calculateQuickWallpaper({
      room: REFERENCE_ROOM_4X3,
      roll: REFERENCE_ROLL_WIDE,
      trim: { topMm: 30 as import('@/units').Millimeters, bottomMm: 70 as import('@/units').Millimeters },
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    const combined = buildExplanationSteps(outcome.result.trace, 'ru')
      .map((step) => step.body)
      .join(' ')

    expect(combined).toContain('3 см сверху')
    expect(combined).toContain('7 см снизу')
    expect(combined).not.toContain('по 5 см')
  })

  it('maps domain errors to stable message keys', () => {
    expect(mapDomainErrorToMessageKey('INVALID_DIMENSION')).toBe('invalidDimension')
    expect(mapDomainErrorToMessageKey('STRIP_LONGER_THAN_ROLL')).toBe(
      'stripLongerThanRoll',
    )
    expect(mapDomainErrorToMessageKey('UNSUPPORTED_DIFFERENT_WALL_HEIGHTS')).toBe(
      'unsupportedFeature',
    )
  })
})
