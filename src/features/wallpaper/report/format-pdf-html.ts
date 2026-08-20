import type { CalculationReportModel, CalculationReportSection } from './types'

/**
 * Builds print-friendly HTML for expo-print.
 * Uses UTF-8 + system sans-serif (Roboto on Android) for Cyrillic glyphs.
 */
export function formatCalculationPdfHtml(report: CalculationReportModel): string {
	const sectionsHtml = [
		renderResultHero(report),
		renderSection(report.roomSection),
		renderSection(report.wallpaperSection),
		report.openingsSection ? renderSection(report.openingsSection) : '',
		renderSection(report.explanationSection),
	].join('\n')

	return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(report.reportTitle)}</title>
  <style>
    @page { margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #1A1D26;
      font-family: Roboto, "Noto Sans", "DejaVu Sans", Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.45;
    }
    h1 {
      font-size: 18pt;
      margin: 0 0 4pt;
    }
    h2 {
      font-size: 11pt;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #5C6370;
      margin: 0 0 8pt;
      border-bottom: 1px solid #E2E5EB;
      padding-bottom: 4pt;
    }
    .subtitle {
      color: #5C6370;
      margin: 0 0 18pt;
      font-size: 11pt;
    }
    .section {
      margin: 0 0 16pt;
      page-break-inside: avoid;
    }
    .hero {
      background: #F7F8FA;
      border: 1px solid #E2E5EB;
      border-radius: 10px;
      padding: 14pt 16pt;
      margin-bottom: 18pt;
    }
    .hero-heading {
      color: #5C6370;
      font-size: 11pt;
      margin: 0 0 4pt;
    }
    .hero-value {
      font-size: 28pt;
      font-weight: 700;
      color: #15803D;
      margin: 0;
    }
    .hero-unit {
      font-size: 14pt;
      font-weight: 600;
      color: #1A1D26;
      margin-left: 6pt;
    }
    .meta {
      margin: 6pt 0 0;
      color: #1A1D26;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 12pt;
      padding: 3pt 0;
    }
    .label { color: #5C6370; }
    .value { font-weight: 600; text-align: right; }
    .paragraph {
      white-space: pre-wrap;
      margin: 8pt 0 0;
    }
    .footer {
      margin-top: 22pt;
      color: #5C6370;
      font-size: 10pt;
      border-top: 1px solid #E2E5EB;
      padding-top: 10pt;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(report.appTitle)}</h1>
  <p class="subtitle">${escapeHtml(report.reportTitle)}</p>
  ${sectionsHtml}
  <p class="footer">${escapeHtml(report.footer)}</p>
</body>
</html>`
}

function renderResultHero(report: CalculationReportModel): string {
	const meta = report.resultMeta
		.map((line) => `<p class="meta">${escapeHtml(line)}</p>`)
		.join('\n')

	return `<section class="hero">
  <p class="hero-heading">${escapeHtml(report.resultHeading)}</p>
  <p class="hero-value">${escapeHtml(report.resultValue)}<span class="hero-unit">${escapeHtml(report.resultUnit)}</span></p>
  ${meta}
</section>`
}

function renderSection(section: CalculationReportSection): string {
	const rows = section.lines
		.map(
			(line) => `<div class="row">
  <span class="label">${escapeHtml(line.label)}</span>
  <span class="value">${escapeHtml(line.value)}</span>
</div>`,
		)
		.join('\n')

	const paragraphs = (section.paragraphs ?? [])
		.map((paragraph) => `<p class="paragraph">${escapeHtml(paragraph)}</p>`)
		.join('\n')

	return `<section class="section">
  <h2>${escapeHtml(section.title)}</h2>
  ${rows}
  ${paragraphs}
</section>`
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
}
