import type { SupportedLocale } from '@/config/app-config'
import type { WallpaperCalculationTrace } from '@/domain/wallpaper'
import { t } from '@/i18n'
import { formatRuCountNoun } from '@/i18n/pluralize'
import {
  formatCentimetersFromMm,
  formatMetersFromMm,
  interpolateTemplate,
} from './format-length'

/** One human-readable step in the "How we calculated" section. */
export interface PresentedExplanationStep {
  /** 1-based step index for UI ordering. */
  stepNumber: number
  title: string
  body: string
}

function formatStripCountLabel(count: number, locale: SupportedLocale): string {
  const nouns = t().wallpaper.nouns.strip
  return formatRuCountNoun(count, nouns.one, nouns.few, nouns.many, locale)
}

function formatRollCountLabel(count: number, locale: SupportedLocale): string {
  const nouns = t().wallpaper.nouns.roll
  return formatRuCountNoun(count, nouns.one, nouns.few, nouns.many, locale)
}

/**
 * Builds structured explanation steps from domain trace data only.
 * Does not recompute formulas — reads precomputed trace values.
 */
export function buildExplanationSteps(
  trace: WallpaperCalculationTrace,
  locale: SupportedLocale,
): PresentedExplanationStep[] {
  const strings = t()
  const steps: PresentedExplanationStep[] = []

  const totalWallWidth = formatMetersFromMm(trace.totalWallWidthMm, locale)
  const adjustedWidth = formatMetersFromMm(trace.adjustedWallWidthMm, locale)
  const stripWidth = formatMetersFromMm(trace.rollWidthMm, locale)
  const stripCountLabel = formatStripCountLabel(trace.requiredStrips, locale)
  const perCornerMm = trace.cornerAllowanceMm > 0
    ? Math.round(trace.cornerAllowanceMm / 4)
    : 0

  if (trace.cornerAllowanceMm > 0) {
    steps.push({
      stepNumber: 1,
      title: strings.wallpaper.explanation.steps.perimeterTitle,
      body: interpolateTemplate(strings.wallpaper.explanation.steps.perimeterWithCornerBody, {
        totalWidth: totalWallWidth,
        adjustedWidth,
        perCorner: formatCentimetersFromMm(perCornerMm as import('@/units').Millimeters, locale),
      }),
    })
  } else {
    steps.push({
      stepNumber: 1,
      title: strings.wallpaper.explanation.steps.perimeterTitle,
      body: interpolateTemplate(strings.wallpaper.explanation.steps.perimeterBody, {
        totalWidth: totalWallWidth,
      }),
    })
  }

  steps.push({
    stepNumber: steps.length + 1,
    title: strings.wallpaper.explanation.steps.stripsTitle,
    body: interpolateTemplate(strings.wallpaper.explanation.steps.stripsBody, {
      adjustedWidth,
      stripWidth,
      stripCountLabel,
    }),
  })

  const wallHeight = formatMetersFromMm(trace.wallHeightMm, locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const stripLength = formatMetersFromMm(trace.rawStripLengthMm, locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const topTrim = formatCentimetersFromMm(trace.topTrimMm, locale)
  const bottomTrim = formatCentimetersFromMm(trace.bottomTrimMm, locale)

  steps.push({
    stepNumber: steps.length + 1,
    title: strings.wallpaper.explanation.steps.stripLengthTitle,
    body: interpolateTemplate(strings.wallpaper.explanation.steps.stripLengthBody, {
      wallHeight,
      topTrim,
      bottomTrim,
      stripLength,
    }),
  })

  const rollLength = formatMetersFromMm(trace.rollLengthMm, locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const stripsPerRollLabel = formatStripCountLabel(trace.stripsPerFullRoll, locale)

  steps.push({
    stepNumber: steps.length + 1,
    title: strings.wallpaper.explanation.steps.stripsPerRollTitle,
    body: interpolateTemplate(strings.wallpaper.explanation.steps.stripsPerRollBody, {
      rollLength,
      stripsPerRollLabel,
    }),
  })

  const fullRolls = trace.rollUsage.filter(
    (entry) => entry.stripsCut === trace.stripsPerFullRoll,
  ).length
  const partialRoll = trace.rollUsage.find(
    (entry) => entry.stripsCut < trace.stripsPerFullRoll,
  )
  const minimumRollsLabel = formatRollCountLabel(trace.minimumRolls, locale)
  const stripsPerRoll = new Intl.NumberFormat(
    locale === 'ru' ? 'ru-RU' : 'en-US',
  ).format(trace.stripsPerFullRoll)

  let rollPlanBody: string

  if (partialRoll && partialRoll.stripsCut > 0) {
    const fullRollsStripsCount = trace.rollUsage
      .filter((entry) => entry.stripsCut === trace.stripsPerFullRoll)
      .reduce((sum, entry) => sum + entry.stripsCut, 0)
    const fullRollsStrips = new Intl.NumberFormat(
      locale === 'ru' ? 'ru-RU' : 'en-US',
    ).format(fullRollsStripsCount)

    rollPlanBody = interpolateTemplate(
      strings.wallpaper.explanation.steps.rollPlanPartialBody,
      {
        stripCountLabel,
        fullRollCount: new Intl.NumberFormat(
          locale === 'ru' ? 'ru-RU' : 'en-US',
        ).format(fullRolls),
        stripsPerRoll,
        fullRollsStrips,
        partialStripsLabel: formatStripCountLabel(partialRoll.stripsCut, locale),
        minimumRollsLabel,
      },
    )
  } else {
    rollPlanBody = interpolateTemplate(
      strings.wallpaper.explanation.steps.rollPlanEvenBody,
      {
        stripCountLabel,
        minimumRollsLabel,
        stripsPerRoll,
      },
    )
  }

  steps.push({
    stepNumber: steps.length + 1,
    title: strings.wallpaper.explanation.steps.rollPlanTitle,
    body: rollPlanBody,
  })

  return steps
}
