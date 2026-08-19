import { metersToMillimeters } from '@/units'
import type { Millimeters } from '@/units'

/** Preset identifier for Quick Mode roll selection UI. */
export type WallpaperRollPresetId = 'wide-1060' | 'narrow-530' | 'custom'

/** Roll dimensions preset — UI config only, not domain business logic. */
export interface WallpaperRollPreset {
  id: Exclude<WallpaperRollPresetId, 'custom'>
  /** i18n key suffix under `wallpaper.rollPresets.labels`. */
  labelKey: 'wide1060' | 'narrow530'
  widthMm: Millimeters
  lengthMm: Millimeters
}

/**
 * Popular roll sizes for RU Quick Mode.
 * Copy describes them as "popular sizes", not exclusive standards.
 */
export const WALLPAPER_ROLL_PRESETS: readonly WallpaperRollPreset[] = [
  {
    id: 'wide-1060',
    labelKey: 'wide1060',
    widthMm: metersToMillimeters(1.06),
    lengthMm: metersToMillimeters(10.05),
  },
  {
    id: 'narrow-530',
    labelKey: 'narrow530',
    widthMm: metersToMillimeters(0.53),
    lengthMm: metersToMillimeters(10.05),
  },
] as const

/** Default Quick Mode preset — wide European roll. */
export const DEFAULT_WALLPAPER_ROLL_PRESET_ID: Exclude<
  WallpaperRollPresetId,
  'custom'
> = 'wide-1060'
