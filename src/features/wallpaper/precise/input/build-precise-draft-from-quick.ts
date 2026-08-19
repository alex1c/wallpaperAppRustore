import type { QuickCalculationFormValues } from '@/features/wallpaper/input/parse-quick-form'
import type { PreciseDraft } from '../state/precise-draft-types'

/**
 * Converts Quick Mode room dimensions into four rectangular walls.
 * Order matches a typical room walk: length, width, length, width.
 */
export function buildPreciseDraftFromQuickForm(
  values: QuickCalculationFormValues,
): PreciseDraft {
  const { roomLength, roomWidth, roomHeight } = values

  return {
    walls: [
      { id: 'wall-1', displayIndex: 1, width: roomLength, height: roomHeight },
      { id: 'wall-2', displayIndex: 2, width: roomWidth, height: roomHeight },
      { id: 'wall-3', displayIndex: 3, width: roomLength, height: roomHeight },
      { id: 'wall-4', displayIndex: 4, width: roomWidth, height: roomHeight },
    ],
    openings: [],
    rollPresetId: values.rollPresetId,
    rollWidth: values.rollWidth,
    rollLength: values.rollLength,
    pattern: null,
  }
}
