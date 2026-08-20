import { getLocale, t } from '@/i18n'
import type { PresentedPreciseWallpaperResult } from '@/features/wallpaper/precise/presenter/present-precise-wallpaper-result'
import {
	formatOpeningSummaryLine,
	formatWallLabel,
} from '@/features/wallpaper/precise/presenter/present-precise-wallpaper-result'
import { formatDimensionTextForDisplay } from '@/features/wallpaper/presenter/format-length'
import type { PreciseDraft } from '@/features/wallpaper/precise/state/precise-draft-types'
import type { CalculationReportModel } from './types'
import { formatPreciseRollDisplayLabel } from './format-roll-label'

export interface BuildPreciseReportInput {
	presented: PresentedPreciseWallpaperResult
	draft: PreciseDraft
}

/**
 * Builds a Precise Mode report from presented result + draft snapshot.
 * Preserves "planned cutting layout" wording — never invents "minimum".
 */
export function buildPreciseCalculationReport(
	input: BuildPreciseReportInput,
): CalculationReportModel {
	const strings = t()
	const locale = getLocale()
	const { presented, draft } = input
	const meters = strings.wallpaper.units.meters
	const hasOpenings = draft.openings.length > 0

	const resultMeta: string[] = [
		presented.plannedRollsHelper,
		presented.summaryLine,
		`${presented.coverageAreaLabel}: ${presented.coverageAreaValue}`,
	]

	if (presented.comparison) {
		resultMeta.push(`${presented.comparison.title}: ${presented.comparison.body}`)
	}

	if (presented.patternApplied) {
		resultMeta.push(strings.wallpaper.result.patternAppliedBadge)
	}

	const wallLines = draft.walls.map((wall) => ({
		label: formatWallLabel(wall, locale),
		value: `${formatDimensionTextForDisplay(wall.width, locale)} × ${formatDimensionTextForDisplay(wall.height, locale)} ${meters}`,
	}))

	const openingsLines = draft.openings.map((opening) => {
		const wall = draft.walls.find((item) => item.id === opening.wallId)
		const wallLabel = wall ? formatWallLabel(wall, locale) : '—'
		const kindLabel = opening.kind === 'door'
			? strings.wallpaper.precise.openings.doorLabel
			: strings.wallpaper.precise.openings.windowLabel
		return {
			label: kindLabel,
			value: formatOpeningSummaryLine(
				wallLabel,
				opening.width,
				opening.height,
				locale,
			),
		}
	})

	const impactParagraphs = presented.openingImpacts.map(
		(impact) => `${impact.label}: ${impact.detail}`,
	)

	const explanationParagraphs = [
		...presented.explanationSteps.map(
			(step, index) => `${index + 1}. ${step.title}\n${step.body}`,
		),
		presented.conservativeNote,
	].filter(Boolean)

	return {
		mode: 'precise',
		appTitle: strings.app.title,
		reportTitle: strings.wallpaper.share.reportTitle,
		resultHeading: presented.plannedRollsHeading,
		resultValue: presented.plannedRollsValue,
		resultUnit: presented.plannedRollsUnit,
		resultMeta,
		roomSection: {
			title: strings.wallpaper.share.sections.walls,
			lines: wallLines,
		},
		wallpaperSection: {
			title: strings.wallpaper.share.sections.wallpaper,
			lines: [
				{
					label: strings.wallpaper.precise.wallpaper.rollSummary,
					value: formatPreciseRollDisplayLabel(draft),
				},
				...buildPatternLines(draft),
			],
		},
		openingsSection: hasOpenings
			? {
				title: strings.wallpaper.share.sections.openings,
				lines: openingsLines,
				paragraphs: impactParagraphs.length > 0 ? impactParagraphs : undefined,
			}
			: null,
		explanationSection: {
			title: strings.wallpaper.share.sections.explanation,
			lines: [],
			paragraphs: explanationParagraphs,
		},
		footer: strings.wallpaper.share.footer,
		hasOpenings,
		patternKind: resolvePatternKind(draft),
	}
}

function resolvePatternKind(
	draft: PreciseDraft,
): CalculationReportModel['patternKind'] {
	if (!draft.pattern) {
		return 'none'
	}

	if (draft.pattern.matchType === 'straight') {
		return 'straight'
	}

	if (draft.pattern.matchType === 'free') {
		return 'free'
	}

	return 'none'
}

function buildPatternLines(
	draft: PreciseDraft,
): { label: string; value: string }[] {
	const strings = t()
	const patternLabel = strings.wallpaper.precise.wallpaper.patternSummary

	if (!draft.pattern) {
		return [
			{
				label: patternLabel,
				value: strings.wallpaper.precise.wallpaper.noPattern,
			},
		]
	}

	if (draft.pattern.matchType === 'free') {
		return [
			{
				label: patternLabel,
				value: strings.wallpaper.pattern.options.free.title,
			},
		]
	}

	if (draft.pattern.matchType === 'straight') {
		return [
			{
				label: patternLabel,
				value: strings.wallpaper.pattern.options.straight.title,
			},
			{
				label: strings.wallpaper.pattern.repeatLabel,
				value: `${draft.pattern.repeatCm} ${strings.wallpaper.units.centimeters}`,
			},
		]
	}

	return [
		{
			label: patternLabel,
			value: strings.wallpaper.pattern.options['half-drop'].title,
		},
	]
}
