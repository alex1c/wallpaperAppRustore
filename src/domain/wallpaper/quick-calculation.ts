import { rectangleAreaMm } from '@/units'
import type {
  QuickWallpaperCalculationInput,
  QuickWallpaperCalculationOutcome,
} from './types'

/**
 * Computes total wall area for a rectangular room (four walls, no openings).
 * Openings, rapport, and cut planning belong to later phases.
 */
function calculateWallAreaMm2(input: QuickWallpaperCalculationInput) {
  const { room } = input
  const perimeterMm = 2 * (room.widthMm + room.lengthMm)
  return rectangleAreaMm(perimeterMm as typeof room.widthMm, room.heightMm)
}

/**
 * Phase 0–1 placeholder: simple area-based roll estimate with waste allowance.
 * Pure TypeScript — no React, Expo, ads, or analytics dependencies.
 */
export function calculateQuickWallpaperRolls(
  input: QuickWallpaperCalculationInput,
): QuickWallpaperCalculationOutcome {
  const dimensions = [
    input.room.widthMm,
    input.room.lengthMm,
    input.room.heightMm,
    input.roll.widthMm,
    input.roll.lengthMm,
  ]

  if (dimensions.some((value) => !Number.isFinite(value) || value <= 0)) {
    return {
      ok: false,
      error: {
        code: 'INVALID_DIMENSION',
        message: 'All dimensions must be positive finite numbers.',
      },
    }
  }

  if (!Number.isFinite(input.wastePercent) || input.wastePercent < 0) {
    return {
      ok: false,
      error: {
        code: 'INVALID_WASTE',
        message: 'Waste percent must be a non-negative finite number.',
      },
    }
  }

  const wallAreaMm2 = calculateWallAreaMm2(input)
  const rollAreaMm2 = rectangleAreaMm(input.roll.widthMm, input.roll.lengthMm)
  const wasteMultiplier = 1 + input.wastePercent / 100
  const adjustedAreaMm2 = wallAreaMm2 * wasteMultiplier
  const rollsRequired = Math.max(1, Math.ceil(adjustedAreaMm2 / rollAreaMm2))

  return {
    ok: true,
    result: {
      wallAreaMm2,
      rollAreaMm2,
      rollsRequired,
      wasteMultiplier,
    },
  }
}
