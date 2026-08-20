import {
	buildPreciseCalculationReport,
	buildQuickCalculationReport,
	formatCalculationPdfHtml,
	formatCalculationTextReport,
	isHalfDropPattern,
} from '@/features/wallpaper/report'
import type { PresentedWallpaperResult } from '@/features/wallpaper/presenter/present-wallpaper-result'
import type { PresentedPreciseWallpaperResult } from '@/features/wallpaper/precise/presenter/present-precise-wallpaper-result'
import type { PreciseDraft } from '@/features/wallpaper/precise/state/precise-draft-types'
import { DEFAULT_QUICK_FORM_VALUES } from '@/features/wallpaper/input/parse-quick-form'
import { assertNoRawDimensionParams } from '@/services/analytics'

function makeQuickPresented(
	overrides: Partial<PresentedWallpaperResult> = {},
): PresentedWallpaperResult {
	return {
		resultKey: '5-14-3',
		minimumRolls: 5,
		minimumRollsHeading: 'Нужно минимум',
		minimumRollsValue: '5',
		minimumRollsUnit: 'рулонов',
		requiredStrips: 14,
		stripsSummary: '14 полотен',
		stripsPerRollSummary: 'По 3 полотна из полного рулона',
		recommendation: {
			spareMessage: 'Для запаса можно взять ещё 1 рулон',
			totalWithSpareMessage: 'Итого с запасом: 6',
		},
		explanationSteps: [
			{
				stepNumber: 1,
				title: 'Длина стен',
				body: 'Общая длина стен — 14 м.',
			},
		],
		phaseAssumptionNote: null,
		trimHint: 'Этот запас помогает компенсировать небольшую неровность.',
		patternApplied: false,
		...overrides,
	}
}

function makePrecisePresented(
	overrides: Partial<PresentedPreciseWallpaperResult> = {},
): PresentedPreciseWallpaperResult {
	return {
		resultKey: 'precise-5',
		plannedRollsHeading: 'По расчётному раскрою',
		plannedRollsValue: '5',
		plannedRollsUnit: 'рулонов',
		plannedRollsHelper: 'Количество рулонов по плану раскроя',
		coverageAreaLabel: 'Площадь оклейки',
		coverageAreaValue: '35,2 м²',
		summaryLine: '4 стены',
		comparison: null,
		openingImpacts: [],
		openingImpactsSectionTitle: 'Проёмы',
		explanationSteps: [
			{ title: 'Стены', body: 'Учтены размеры отдельных стен.' },
		],
		conservativeNote: 'План консервативный.',
		patternApplied: false,
		...overrides,
	}
}

describe('wallpaper calculation reports', () => {
	it('builds Quick text with minimum semantics and no raw mm', () => {
		const report = buildQuickCalculationReport({
			presented: makeQuickPresented(),
			form: {
				...DEFAULT_QUICK_FORM_VALUES,
				roomLength: '2.7000',
				roomWidth: '3.0000',
				roomHeight: '2.7000',
				rollWidth: '1.0600',
				rollLength: '10.0500',
			},
			pattern: null,
		})
		const text = formatCalculationTextReport(report)

		expect(text).toContain('Нужно минимум')
		expect(text).toContain('5 рулонов')
		expect(text).toContain('4')
		expect(text).toContain('3')
		expect(text).toContain('2,7')
		expect(text).not.toContain('2.7000')
		expect(text).not.toContain('3.0000')
		expect(text).not.toContain('10.0500')
		expect(text).not.toMatch(/\b\d{3,}\s*mm\b/i)
		expect(text).not.toContain('minimumRolls')
		expect(text).not.toContain('{')
		expect(report.mode).toBe('quick')
	})

	it('includes straight pattern explanation in Quick report', () => {
		const report = buildQuickCalculationReport({
			presented: makeQuickPresented({
				patternApplied: true,
				explanationSteps: [
					{
						stepNumber: 1,
						title: 'Учитываем рисунок',
						body: 'Рисунок повторяется каждые 64 см.',
					},
				],
			}),
			form: DEFAULT_QUICK_FORM_VALUES,
			pattern: { matchType: 'straight', repeatCm: '64' },
		})
		const text = formatCalculationTextReport(report)

		expect(text).toContain('Рисунок нужно совмещать')
		expect(text).toContain('64')
		expect(text).toContain('Учитываем рисунок')
		expect(report.patternKind).toBe('straight')
	})

	it('builds Precise report without openings and avoids minimum wording', () => {
		const draft: PreciseDraft = {
			walls: [
				{ id: 'w1', displayIndex: 1, width: '4', height: '2,7' },
				{ id: 'w2', displayIndex: 2, width: '3', height: '2,7' },
			],
			openings: [],
			rollPresetId: 'wide-1060',
			rollWidth: '1,06',
			rollLength: '10,05',
			pattern: null,
		}
		const report = buildPreciseCalculationReport({
			presented: makePrecisePresented(),
			draft,
		})
		const text = formatCalculationTextReport(report)

		expect(text).toContain('По расчётному раскрою')
		expect(text).not.toContain('Нужно минимум')
		expect(text).toContain('Стена 1')
		expect(report.hasOpenings).toBe(false)
	})

	it('includes door summary for Precise with openings', () => {
		const draft: PreciseDraft = {
			walls: [
				{ id: 'w1', displayIndex: 1, width: '4', height: '2,7' },
			],
			openings: [
				{
					id: 'd1',
					kind: 'door',
					wallId: 'w1',
					width: '0,9',
					height: '2,1',
					offsetFromLeft: '0,5',
					offsetFromFloor: '0',
				},
			],
			rollPresetId: 'wide-1060',
			rollWidth: '1,06',
			rollLength: '10,05',
			pattern: null,
		}
		const report = buildPreciseCalculationReport({
			presented: makePrecisePresented({
				summaryLine: '1 стена · 1 дверь',
				comparison: {
					title: 'Сравнение',
					body: 'Количество рулонов не изменилось, но площадь оклейки уменьшилась.',
				},
				openingImpacts: [
					{
						label: 'Дверь на стене 1',
						detail: 'Не нужно оклеивать: 1,89 м²',
					},
				],
			}),
			draft,
		})
		const text = formatCalculationTextReport(report)

		expect(text).toContain('Двери и окна')
		expect(text).toContain('0,9')
		expect(text).toContain('2,1')
		expect(text).toContain('площадь оклейки уменьшилась')
		expect(report.hasOpenings).toBe(true)
	})

	it('marks half-drop as unsupported for numeric reports', () => {
		expect(isHalfDropPattern('half-drop')).toBe(true)
		expect(isHalfDropPattern('straight')).toBe(false)
	})

	it('renders Cyrillic in PDF HTML with utf-8 charset', () => {
		const report = buildQuickCalculationReport({
			presented: makeQuickPresented(),
			form: DEFAULT_QUICK_FORM_VALUES,
			pattern: null,
		})
		const html = formatCalculationPdfHtml(report)

		expect(html).toContain('charset="utf-8"')
		expect(html).toContain('Калькулятор обоев')
		expect(html).toContain('Нужно минимум')
		expect(html).toContain('Как получился результат')
	})

	it('keeps share analytics props categorical only', () => {
		expect(() => assertNoRawDimensionParams({
			mode: 'quick',
			pattern: 'straight',
			has_openings: false,
		})).not.toThrow()
	})
})
