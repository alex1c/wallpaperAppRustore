import type { WallpaperRollPresetId } from '@/config/wallpaper-roll-presets'
import type { PatternFormValues } from '@/features/wallpaper/pattern/pattern-match-types'

/** User-editable wall row in Precise Mode — strings stay editable until submit. */
export interface PreciseWallDraft {
  id: string
  /** 1-based display index shown as «Стена N». */
  displayIndex: number
  width: string
  height: string
}

export type PreciseOpeningKind = 'door' | 'window'

/** User-editable opening row — geometry strings in meters. */
export interface PreciseOpeningDraft {
  id: string
  kind: PreciseOpeningKind
  wallId: string
  width: string
  height: string
  /** Distance from the wall's left edge — user-facing «от левого края». */
  offsetFromLeft: string
  /** Windows only — distance from floor to bottom edge. */
  offsetFromFloor: string
}

/** Full Precise Mode form draft passed from Quick or edited on the precise screen. */
export interface PreciseDraft {
  walls: PreciseWallDraft[]
  openings: PreciseOpeningDraft[]
  rollPresetId: WallpaperRollPresetId
  rollWidth: string
  rollLength: string
  pattern: PatternFormValues | null
}

export const DEFAULT_PRECISE_DRAFT: PreciseDraft = {
  walls: [
    { id: 'wall-1', displayIndex: 1, width: '4', height: '2,7' },
    { id: 'wall-2', displayIndex: 2, width: '3', height: '2,7' },
    { id: 'wall-3', displayIndex: 3, width: '4', height: '2,7' },
    { id: 'wall-4', displayIndex: 4, width: '3', height: '2,7' },
  ],
  openings: [],
  rollPresetId: 'wide-1060',
  rollWidth: '1,06',
  rollLength: '10,05',
  pattern: null,
}
