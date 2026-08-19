import type { SupportedLocale } from '@/config/app-config'
import type { PreciseWallpaperCalculationResult } from '@/domain/wallpaper'
import { t } from '@/i18n'
import { formatRuCountNoun } from '@/i18n/pluralize'
import type { PreciseOpeningDraft, PreciseWallDraft } from '../state/precise-draft-types'
import {
  formatCount,
  formatSquareMetersFromMm2,
  interpolateTemplate,
} from '../../presenter/format-length'

export interface PresentedPreciseExplanationStep {
  title: string
  body: string
}

/** Alias so precise steps work with shared ExplanationSection. */
export type PresentedExplanationStepCompat = PresentedPreciseExplanationStep

/**
 * Builds human-readable explanation steps from domain precise result only.
 * Does not recompute strips, segments, rolls, or opening areas.
 */
export function buildPreciseExplanationSteps(
  result: PreciseWallpaperCalculationResult,
  wallsDraft: readonly PreciseWallDraft[],
  openingsDraft: readonly PreciseOpeningDraft[],
  locale: SupportedLocale,
): PresentedPreciseExplanationStep[] {
  const strings = t()
  const stepStrings = strings.wallpaper.precise.explanation.steps
  const rollNouns = strings.wallpaper.nouns.roll

  const totalCoverageMm2 = result.walls.reduce(
    (sum, wall) => sum + wall.actualCoverageAreaMm2,
    0,
  )

  const steps: PresentedPreciseExplanationStep[] = [
    {
      title: stepStrings.wallsTitle,
      body: interpolateTemplate(stepStrings.wallsBody, {
        wallCount: formatCount(wallsDraft.length, locale),
        totalArea: formatSquareMetersFromMm2(totalCoverageMm2, locale),
      }),
    },
    {
      title: stepStrings.columnsTitle,
      body: interpolateTemplate(stepStrings.columnsBody, {
        columnCount: formatCount(result.totalStripColumns, locale),
      }),
    },
  ]

  if (openingsDraft.length > 0) {
    const areaSaved = formatSquareMetersFromMm2(
      result.openingSavings.coverageAreaSavedMm2,
      locale,
    )
    const openingCountLabel = formatRuCountNoun(
      openingsDraft.length,
      strings.wallpaper.precise.explanation.openingCount.one,
      strings.wallpaper.precise.explanation.openingCount.few,
      strings.wallpaper.precise.explanation.openingCount.many,
      locale,
    )

    steps.push({
      title: stepStrings.openingsTitle,
      body: interpolateTemplate(stepStrings.openingsBody, {
        openingCount: openingCountLabel,
        areaSaved,
      }),
    })

    if (result.openingSavings.partialSegmentsCreated > 0) {
      steps.push({
        title: stepStrings.segmentsTitle,
        body: stepStrings.segmentsBody,
      })
    }
  }

  const plannedRollsLabel = formatRuCountNoun(
    result.plannedRolls,
    rollNouns.one,
    rollNouns.few,
    rollNouns.many,
    locale,
  )

  steps.push({
    title: stepStrings.rollPlanTitle,
    body: interpolateTemplate(stepStrings.rollPlanBody, {
      plannedRolls: plannedRollsLabel,
    }),
  })

  steps.push({
    title: stepStrings.conservativeTitle,
    body: stepStrings.conservativeBody,
  })

  return steps
}
