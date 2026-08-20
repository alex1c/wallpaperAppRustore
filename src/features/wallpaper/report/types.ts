/**
 * Calculation report model — built from presented results + form snapshot.
 * Never recalculates rolls; never embeds domain mm codes for display.
 */

export type CalculationReportMode = 'quick' | 'precise'

export type CalculationReportPattern =
	| { kind: 'none' }
	| { kind: 'free'; title: string }
	| { kind: 'straight'; title: string; repeatLabel: string; repeatValue: string }
	| { kind: 'half_drop_unsupported'; title: string }

export interface CalculationReportLine {
	label: string
	value: string
}

export interface CalculationReportSection {
	title: string
	lines: CalculationReportLine[]
	/** Optional paragraph blocks (explanation steps, notes). */
	paragraphs?: string[]
}

/**
 * Locale-ready report snapshot for text + PDF formatters.
 * All strings are human-facing; no raw mm / domain enums.
 */
export interface CalculationReportModel {
	mode: CalculationReportMode
	appTitle: string
	reportTitle: string
	/** Hero result — Quick uses "minimum", Precise uses planned layout wording. */
	resultHeading: string
	resultValue: string
	resultUnit: string
	/** Extra result lines (strips, spare, planned helper, coverage…). */
	resultMeta: string[]
	roomSection: CalculationReportSection
	wallpaperSection: CalculationReportSection
	openingsSection: CalculationReportSection | null
	explanationSection: CalculationReportSection
	footer: string
	/** True when openings exist (Precise only). */
	hasOpenings: boolean
	patternKind: 'none' | 'free' | 'straight'
}
