import type { WallpaperRollPresetId } from '@/config/wallpaper-roll-presets'
import type { PatternMatch } from '@/domain/wallpaper'
import type { UiPatternMatchId } from '@/features/wallpaper/pattern/pattern-match-types'
import type {
  OpeningCountBucket,
  OpeningTypeAnalyticsValue,
  PatternAnalyticsValue,
  ResultRollBucket,
  RollAnalyticsValue,
  WallCountBucket,
} from './event-taxonomy'

/** Maps domain/UI pattern ids to analytics-safe snake_case values. */
export function mapPatternForAnalytics(
  match: PatternMatch | UiPatternMatchId | null | undefined,
): PatternAnalyticsValue {
  if (match === 'straight') {
    return 'straight'
  }

  if (match === 'half-drop') {
    return 'half_drop'
  }

  return 'free'
}

/** Maps roll preset ids to coarse analytics labels (no custom dimensions). */
export function mapRollPresetForAnalytics(
  presetId: WallpaperRollPresetId,
): RollAnalyticsValue {
  if (presetId === 'narrow-530') {
    return 'preset_053'
  }

  if (presetId === 'custom') {
    return 'custom'
  }

  return 'preset_106'
}

export function mapOpeningTypeForAnalytics(
  kind: 'door' | 'window',
): OpeningTypeAnalyticsValue {
  return kind
}

export function bucketWallCount(count: number): WallCountBucket {
  if (count <= 2) {
    return '1_2'
  }

  if (count <= 4) {
    return '3_4'
  }

  return '5_plus'
}

export function bucketOpeningCount(count: number): OpeningCountBucket {
  if (count <= 0) {
    return '0'
  }

  if (count === 1) {
    return '1'
  }

  if (count === 2) {
    return '2'
  }

  return '3_plus'
}

/**
 * Buckets planned/minimum roll counts so we never send exact high-resolution
 * purchase figures tied to a unique room geometry.
 */
export function bucketResultRolls(rolls: number): ResultRollBucket {
  if (rolls <= 1) {
    return '1'
  }

  if (rolls === 2) {
    return '2'
  }

  if (rolls <= 5) {
    return '3_5'
  }

  if (rolls <= 10) {
    return '6_10'
  }

  return '11_plus'
}

/**
 * Asserts analytics params contain no dimension-like keys.
 * Used in tests — not a runtime firewall for production SDK payloads.
 */
export function assertNoRawDimensionParams(
  params: Record<string, unknown> | undefined,
): void {
  if (!params) {
    return
  }

  const forbidden = [
    'length',
    'width',
    'height',
    'offset',
    'repeat',
    'mm',
    'meters',
    'dimension',
    'room',
    'wall_width',
    'wall_height',
    'door_width',
    'window_height',
    'ad_unit',
    'creative',
    'click_url',
    'target_url',
    'gaid',
    'oaid',
    'android_id',
  ]

  for (const key of Object.keys(params)) {
    const normalized = key.toLowerCase()
    for (const fragment of forbidden) {
      if (normalized.includes(fragment)) {
        throw new Error(`Unsafe analytics param key: ${key}`)
      }
    }
  }
}
