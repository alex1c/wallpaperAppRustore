import type { QuickCalculationFormValues } from '@/features/wallpaper/input/parse-quick-form'
import type { PatternFormValues } from '@/features/wallpaper/pattern/pattern-match-types'
import type { PresentedWallpaperResult } from '@/features/wallpaper/presenter/present-wallpaper-result'
import { getLocale, t } from '@/i18n'
import { formatDimensionTextForDisplay } from '@/features/wallpaper/presenter/format-length'
import type { CalculationReportModel, CalculationReportPattern } from './types'
import { formatRollDisplayLabel } from './format-roll-label'

export interface BuildQuickReportInput {
	presented: PresentedWallpaperResult
	form: QuickCalculationFormValues
	pattern: PatternFormValues | null
}

/**
 * Builds a Quick Mode report from the presented result + form snapshot.
 * Does not call the domain engine.
 */
export function buildQuickCalculationReport(
	input: BuildQuickReportInput,
): CalculationReportModel {
	const strings = t()
	const { presented, form, pattern } = input
	const meters = strings.wallpaper.units.meters
	const locale = getLocale()
	const patternInfo = resolvePattern(pattern)

	const resultMeta: string[] = [
		presented.stripsSummary,
		presented.stripsPerRollSummary,
	]

	if (presented.recommendation) {
		resultMeta.push(presented.recommendation.spareMessage)
		resultMeta.push(presented.recommendation.totalWithSpareMessage)
	}

	if (presented.patternApplied) {
		resultMeta.push(strings.wallpaper.result.patternAppliedBadge)
	}

	const explanationParagraphs = presented.explanationSteps.map(
		(step) => `${step.stepNumber}. ${step.title}\n${step.body}`,
	)

	if (presented.phaseAssumptionNote) {
		explanationParagraphs.push(presented.phaseAssumptionNote)
	}

	if (presented.trimHint) {
		explanationParagraphs.push(presented.trimHint)
	}

	return {
		mode: 'quick',
		appTitle: strings.app.title,
		reportTitle: strings.wallpaper.share.reportTitle,
		resultHeading: presented.minimumRollsHeading,
		resultValue: presented.minimumRollsValue,
		resultUnit: presented.minimumRollsUnit,
		resultMeta,
		roomSection: {
			title: strings.wallpaper.share.sections.room,
			lines: [
				{
					label: strings.wallpaper.fields.length,
					value: `${formatDimensionTextForDisplay(form.roomLength, locale)} ${meters}`,
				},
				{
					label: strings.wallpaper.fields.width,
					value: `${formatDimensionTextForDisplay(form.roomWidth, locale)} ${meters}`,
				},
				{
					label: strings.wallpaper.fields.height,
					value: `${formatDimensionTextForDisplay(form.roomHeight, locale)} ${meters}`,
				},
			],
		},
		wallpaperSection: {
			title: strings.wallpaper.share.sections.wallpaper,
			lines: [
				{
					label: strings.wallpaper.precise.wallpaper.rollSummary,
					value: formatRollDisplayLabel(form),
				},
				...patternSectionLines(patternInfo),
			],
		},
		openingsSection: null,
		explanationSection: {
			title: strings.wallpaper.share.sections.explanation,
			lines: [],
			paragraphs: explanationParagraphs,
		},
		footer: strings.wallpaper.share.footer,
		hasOpenings: false,
		patternKind:
			patternInfo.kind === 'straight'
				? 'straight'
				: patternInfo.kind === 'free'
					? 'free'
					: 'none',
	}
}

function resolvePattern(
	pattern: PatternFormValues | null,
): CalculationReportPattern {
	const strings = t()

	if (!pattern) {
		return { kind: 'none' }
	}

	if (pattern.matchType === 'free') {
		return {
			kind: 'free',
			title: strings.wallpaper.pattern.options.free.title,
		}
	}

	if (pattern.matchType === 'straight') {
		return {
			kind: 'straight',
			title: strings.wallpaper.pattern.options.straight.title,
			repeatLabel: strings.wallpaper.pattern.repeatLabel,
			repeatValue: `${pattern.repeatCm} ${strings.wallpaper.units.centimeters}`,
		}
	}

	return {
		kind: 'half_drop_unsupported',
		title: strings.wallpaper.pattern.options['half-drop'].title,
	}
}

function patternSectionLines(
	pattern: CalculationReportPattern,
): { label: string; value: string }[] {
	const strings = t()
	const patternLabel = strings.wallpaper.precise.wallpaper.patternSummary

	if (pattern.kind === 'none') {
		return [
			{
				label: patternLabel,
				value: strings.wallpaper.precise.wallpaper.noPattern,
			},
		]
	}

	if (pattern.kind === 'free') {
		return [{ label: patternLabel, value: pattern.title }]
	}

	if (pattern.kind === 'straight') {
		return [
			{ label: patternLabel, value: pattern.title },
			{ label: pattern.repeatLabel, value: pattern.repeatValue },
		]
	}

	// Half-drop must never produce a numeric roll report — callers must block first.
	return [{ label: patternLabel, value: pattern.title }]
}
