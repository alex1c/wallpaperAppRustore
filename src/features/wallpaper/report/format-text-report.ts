import type { CalculationReportModel, CalculationReportSection } from './types'

/**
 * Formats a calculation report as concise messenger/email plain text.
 * Output uses human RU/EN strings already present on the model.
 */
export function formatCalculationTextReport(report: CalculationReportModel): string {
	const blocks: string[] = [
		report.appTitle,
		'',
		report.reportTitle,
		'',
		report.resultHeading,
		`${report.resultValue} ${report.resultUnit}`,
	]

	for (const meta of report.resultMeta) {
		blocks.push(meta)
	}

	blocks.push('')
	blocks.push(...formatSection(report.roomSection))
	blocks.push('')
	blocks.push(...formatSection(report.wallpaperSection))

	if (report.openingsSection) {
		blocks.push('')
		blocks.push(...formatSection(report.openingsSection))
	}

	blocks.push('')
	blocks.push(...formatSection(report.explanationSection))
	blocks.push('')
	blocks.push(report.footer)

	return `${blocks.join('\n').trim()}\n`
}

function formatSection(section: CalculationReportSection): string[] {
	const lines: string[] = [section.title]

	for (const line of section.lines) {
		lines.push(`${line.label}: ${line.value}`)
	}

	if (section.paragraphs) {
		for (const paragraph of section.paragraphs) {
			lines.push('')
			lines.push(paragraph)
		}
	}

	return lines
}

/**
 * Guard: half-drop must never produce a numeric share/PDF report.
 */
export function isHalfDropPattern(
	patternMatchType: string | null | undefined,
): boolean {
	return patternMatchType === 'half-drop'
}
