import type { WallpaperRollPresetId } from '@/config/wallpaper-roll-presets'
import {
  DEFAULT_WALLPAPER_ROLL_PRESET_ID,
  WALLPAPER_ROLL_PRESETS,
} from '@/config/wallpaper-roll-presets'
import type { QuickWallpaperCalculationInput } from '@/domain/wallpaper'
import type { ParseDecimalInputErrorCode } from '@/units/parse-decimal-input'
import { parseMetersInputToMillimeters } from '@/units/parse-decimal-input'

/** Quick Mode form field identifiers for validation error mapping. */
export type QuickFormFieldKey =
  | 'roomLength'
  | 'roomWidth'
  | 'roomHeight'
  | 'rollWidth'
  | 'rollLength'

export interface QuickCalculationFormValues {
  roomLength: string
  roomWidth: string
  roomHeight: string
  rollPresetId: WallpaperRollPresetId
  rollWidth: string
  rollLength: string
}

export type QuickFormFieldErrors = Partial<Record<QuickFormFieldKey, ParseDecimalInputErrorCode>>

export type ParseQuickFormOutcome =
  | { ok: true; input: QuickWallpaperCalculationInput }
  | { ok: false; fieldErrors: QuickFormFieldErrors; generalError?: never }
  | { ok: false; fieldErrors?: never; generalError: 'NO_ROLL_DIMENSIONS' }

/** Default form values — Scenario A room with wide roll preset selected. */
export const DEFAULT_QUICK_FORM_VALUES: QuickCalculationFormValues = {
  roomLength: '4',
  roomWidth: '3',
  roomHeight: '2,7',
  rollPresetId: DEFAULT_WALLPAPER_ROLL_PRESET_ID,
  rollWidth: '1,06',
  rollLength: '10,05',
}

/**
 * Parses and validates Quick Mode form strings into domain input.
 * All dimensions are converted to integer mm before reaching the engine.
 */
export function parseQuickCalculationForm(
  values: QuickCalculationFormValues,
): ParseQuickFormOutcome {
  const fieldErrors: QuickFormFieldErrors = {}

  const roomLength = parseMetersInputToMillimeters(values.roomLength)
  if (!roomLength.ok) {
    fieldErrors.roomLength = roomLength.code
  }

  const roomWidth = parseMetersInputToMillimeters(values.roomWidth)
  if (!roomWidth.ok) {
    fieldErrors.roomWidth = roomWidth.code
  }

  const roomHeight = parseMetersInputToMillimeters(values.roomHeight)
  if (!roomHeight.ok) {
    fieldErrors.roomHeight = roomHeight.code
  }

  let rollWidthMm = null as import('@/units').Millimeters | null
  let rollLengthMm = null as import('@/units').Millimeters | null

  if (values.rollPresetId === 'custom') {
    const rollWidth = parseMetersInputToMillimeters(values.rollWidth)
    if (!rollWidth.ok) {
      fieldErrors.rollWidth = rollWidth.code
    } else {
      rollWidthMm = rollWidth.valueMm
    }

    const rollLength = parseMetersInputToMillimeters(values.rollLength)
    if (!rollLength.ok) {
      fieldErrors.rollLength = rollLength.code
    } else {
      rollLengthMm = rollLength.valueMm
    }
  } else {
    const preset = WALLPAPER_ROLL_PRESETS.find((entry) => entry.id === values.rollPresetId)

    if (!preset) {
      return { ok: false, generalError: 'NO_ROLL_DIMENSIONS' }
    }

    rollWidthMm = preset.widthMm
    rollLengthMm = preset.lengthMm
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors }
  }

  if (rollWidthMm === null || rollLengthMm === null) {
    return { ok: false, generalError: 'NO_ROLL_DIMENSIONS' }
  }

  return {
    ok: true,
    input: {
      room: {
        lengthMm: roomLength.ok ? roomLength.valueMm : (0 as import('@/units').Millimeters),
        widthMm: roomWidth.ok ? roomWidth.valueMm : (0 as import('@/units').Millimeters),
        heightMm: roomHeight.ok ? roomHeight.valueMm : (0 as import('@/units').Millimeters),
      },
      roll: {
        widthMm: rollWidthMm,
        lengthMm: rollLengthMm,
      },
    },
  }
}

/** Field order used to focus/scroll to the first invalid input on submit. */
export const QUICK_FORM_FIELD_ORDER: readonly QuickFormFieldKey[] = [
  'roomLength',
  'roomWidth',
  'roomHeight',
  'rollWidth',
  'rollLength',
]
