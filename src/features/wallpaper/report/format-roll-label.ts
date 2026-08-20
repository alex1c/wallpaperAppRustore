import { WALLPAPER_ROLL_PRESETS } from '@/config/wallpaper-roll-presets'
import type { QuickCalculationFormValues } from '@/features/wallpaper/input/parse-quick-form'
import type { PreciseDraft } from '@/features/wallpaper/precise/state/precise-draft-types'
import { getLocale, t } from '@/i18n'
import { formatDimensionTextForDisplay } from '@/features/wallpaper/presenter/format-length'

/** Human roll size label from Quick form values (preset or custom). */
export function formatRollDisplayLabel(form: Pick<
	QuickCalculationFormValues,
	'rollPresetId' | 'rollWidth' | 'rollLength'
>): string {
	const strings = t()
	const meters = strings.wallpaper.units.meters

	if (form.rollPresetId !== 'custom') {
		const preset = WALLPAPER_ROLL_PRESETS.find((item) => item.id === form.rollPresetId)
		if (preset) {
			return strings.wallpaper.rollPresets.labels[preset.labelKey]
		}
	}

	const locale = getLocale()
	const width = formatDimensionTextForDisplay(form.rollWidth, locale)
	const length = formatDimensionTextForDisplay(form.rollLength, locale)
	return `${width} × ${length} ${meters}`
}

/** Human roll size label from Precise draft. */
export function formatPreciseRollDisplayLabel(draft: PreciseDraft): string {
	return formatRollDisplayLabel({
		rollPresetId: draft.rollPresetId,
		rollWidth: draft.rollWidth,
		rollLength: draft.rollLength,
	})
}
