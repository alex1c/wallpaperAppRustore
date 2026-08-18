import { calculateQuickWallpaperRolls } from '@/domain/wallpaper'
import { centimetersToMillimeters } from '@/units'

describe('calculateQuickWallpaperRolls', () => {
  it('returns roll count for a typical rectangular room', () => {
    const outcome = calculateQuickWallpaperRolls({
      room: {
        widthMm: centimetersToMillimeters(400),
        lengthMm: centimetersToMillimeters(500),
        heightMm: centimetersToMillimeters(270),
      },
      roll: {
        widthMm: centimetersToMillimeters(53),
        lengthMm: centimetersToMillimeters(1000),
      },
      wastePercent: 10,
    })

    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      expect(outcome.result.rollsRequired).toBeGreaterThan(0)
      expect(outcome.result.wasteMultiplier).toBeCloseTo(1.1)
    }
  })

  it('rejects non-positive dimensions', () => {
    const outcome = calculateQuickWallpaperRolls({
      room: {
        widthMm: centimetersToMillimeters(0),
        lengthMm: centimetersToMillimeters(500),
        heightMm: centimetersToMillimeters(270),
      },
      roll: {
        widthMm: centimetersToMillimeters(53),
        lengthMm: centimetersToMillimeters(1000),
      },
      wastePercent: 10,
    })

    expect(outcome.ok).toBe(false)
    if (!outcome.ok) {
      expect(outcome.error.code).toBe('INVALID_DIMENSION')
    }
  })

  it('rejects negative waste percent', () => {
    const outcome = calculateQuickWallpaperRolls({
      room: {
        widthMm: centimetersToMillimeters(400),
        lengthMm: centimetersToMillimeters(500),
        heightMm: centimetersToMillimeters(270),
      },
      roll: {
        widthMm: centimetersToMillimeters(53),
        lengthMm: centimetersToMillimeters(1000),
      },
      wastePercent: -1,
    })

    expect(outcome.ok).toBe(false)
    if (!outcome.ok) {
      expect(outcome.error.code).toBe('INVALID_WASTE')
    }
  })
})
