import type { SupportedLocale } from '@/config/app-config'
import type {
  PreciseOpeningImpact,
  PreciseWallpaperCalculationResult,
} from '@/domain/wallpaper'
import { t } from '@/i18n'
import { formatRuCountNoun, pluralizeRu } from '@/i18n/pluralize'
import type { PreciseOpeningDraft, PreciseWallDraft } from '../state/precise-draft-types'
import {
  buildPreciseExplanationSteps,
  type PresentedPreciseExplanationStep,
} from './build-precise-explanation-steps'
import {
  formatCentimetersTextForDisplay,
  formatCount,
  formatDimensionTextForDisplay,
  formatMetersFromMm,
  formatSquareMetersFromMm2,
  interpolateTemplate,
} from '../../presenter/format-length'

/** Localized UI model for Precise Mode results — no domain math here. */
export interface PresentedPreciseWallpaperResult {
  resultKey: string
  plannedRollsHeading: string
  plannedRollsValue: string
  plannedRollsUnit: string
  plannedRollsHelper: string
  coverageAreaLabel: string
  coverageAreaValue: string
  summaryLine: string
  comparison: PresentedPreciseComparison | null
  openingImpacts: PresentedOpeningImpact[]
  openingImpactsSectionTitle: string
  explanationSteps: PresentedPreciseExplanationStep[]
  conservativeNote: string
  patternApplied: boolean
}

export interface PresentedPreciseComparison {
  title: string
  body: string
}

export interface PresentedOpeningImpact {
  label: string
  detail: string
}

type RollComparisonKind =
  | 'reduced'
  | 'unchanged'
  | 'increased'
  | 'no_openings'

/**
 * Converts precise domain result + draft metadata into localized UI model.
 * Never recomputes geometry, roll packing, or opening area.
 */
export function presentPreciseWallpaperResult(
  result: PreciseWallpaperCalculationResult,
  wallsDraft: readonly PreciseWallDraft[],
  openingsDraft: readonly PreciseOpeningDraft[],
  locale: SupportedLocale,
): PresentedPreciseWallpaperResult {
  const strings = t()
  const preciseStrings = strings.wallpaper.precise.result

  const plannedRollsValue = formatCount(result.plannedRolls, locale)
  const rollNouns = strings.wallpaper.nouns.roll
  const plannedRollsUnit = locale === 'ru'
    ? pluralizeRu(
      result.plannedRolls,
      rollNouns.one,
      rollNouns.few,
      rollNouns.many,
    )
    : result.plannedRolls === 1 ? rollNouns.one : rollNouns.many

  const totalCoverageMm2 = result.walls.reduce(
    (sum, wall) => sum + wall.actualCoverageAreaMm2,
    0,
  )

  const doorCount = openingsDraft.filter((entry) => entry.kind === 'door').length
  const windowCount = openingsDraft.filter((entry) => entry.kind === 'window').length

  const summaryParts: string[] = [
    formatRuCountNoun(
      wallsDraft.length,
      preciseStrings.wallCount.one,
      preciseStrings.wallCount.few,
      preciseStrings.wallCount.many,
      locale,
    ),
  ]

  if (doorCount > 0) {
    summaryParts.push(
      formatRuCountNoun(
        doorCount,
        preciseStrings.doorCount.one,
        preciseStrings.doorCount.few,
        preciseStrings.doorCount.many,
        locale,
      ),
    )
  }

  if (windowCount > 0) {
    summaryParts.push(
      formatRuCountNoun(
        windowCount,
        preciseStrings.windowCount.one,
        preciseStrings.windowCount.few,
        preciseStrings.windowCount.many,
        locale,
      ),
    )
  }

  const comparison = buildComparison(
    result,
    locale,
    openingsDraft.length > 0,
  )

  const openingImpacts = buildOpeningImpacts(
    result.openingImpacts,
    openingsDraft,
    wallsDraft,
    locale,
  )

  return {
    resultKey: `${result.plannedRolls}-${result.totalRequiredSegments}-${openingsDraft.length}`,
    plannedRollsHeading: preciseStrings.plannedHeading,
    plannedRollsValue,
    plannedRollsUnit,
    plannedRollsHelper: preciseStrings.plannedHelper,
    coverageAreaLabel: preciseStrings.coverageAreaLabel,
    coverageAreaValue: formatSquareMetersFromMm2(totalCoverageMm2, locale),
    summaryLine: summaryParts.join(' · '),
    comparison,
    openingImpacts,
    openingImpactsSectionTitle: preciseStrings.openingImpactsTitle,
    explanationSteps: buildPreciseExplanationSteps(result, wallsDraft, openingsDraft, locale),
    conservativeNote: preciseStrings.conservativeNote,
    patternApplied: result.patternApplied,
  }
}

function buildComparison(
  result: PreciseWallpaperCalculationResult,
  locale: SupportedLocale,
  hasOpenings: boolean,
): PresentedPreciseWallpaperResult['comparison'] {
  const strings = t()
  const comparisonStrings = strings.wallpaper.precise.result.comparison
  const savings = result.openingSavings
  const baseline = savings.baselinePlannedRolls
  const actual = savings.actualPlannedRolls

  if (!hasOpenings || baseline === null) {
    return null
  }

  const kind = resolveRollComparisonKind(baseline, actual)
  const coverageSaved = formatSquareMetersFromMm2(savings.coverageAreaSavedMm2, locale)

  switch (kind) {
    case 'reduced':
      return {
        title: comparisonStrings.title,
        body: interpolateTemplate(comparisonStrings.reducedBody, {
          baselineRolls: formatCount(baseline, locale),
          actualRolls: formatCount(actual, locale),
          areaSaved: coverageSaved,
        }),
      }
    case 'unchanged':
      return {
        title: comparisonStrings.title,
        body: interpolateTemplate(comparisonStrings.unchangedBody, {
          rolls: formatCount(actual, locale),
          areaSaved: coverageSaved,
        }),
      }
    case 'increased':
      return {
        title: comparisonStrings.title,
        body: interpolateTemplate(comparisonStrings.increasedBody, {
          baselineRolls: formatCount(baseline, locale),
          actualRolls: formatCount(actual, locale),
          areaSaved: coverageSaved,
        }),
      }
    default:
      return null
  }
}

function resolveRollComparisonKind(
  baseline: number,
  actual: number,
): RollComparisonKind {
  if (actual < baseline) {
    return 'reduced'
  }

  if (actual === baseline) {
    return 'unchanged'
  }

  return 'increased'
}

function buildOpeningImpacts(
  impacts: readonly PreciseOpeningImpact[],
  openingsDraft: readonly PreciseOpeningDraft[],
  wallsDraft: readonly PreciseWallDraft[],
  locale: SupportedLocale,
): PresentedOpeningImpact[] {
  const strings = t()
  const impactStrings = strings.wallpaper.precise.result.openingImpact

  return impacts.map((impact) => {
    const opening = openingsDraft.find((entry) => entry.id === impact.openingId)
    const wall = wallsDraft.find((entry) => entry.id === impact.wallId)
    const kind = opening?.kind ?? 'door'
    const kindLabel = kind === 'door' ? impactStrings.doorOnWall : impactStrings.windowOnWall

    return {
      label: interpolateTemplate(kindLabel, {
        wallNumber: String(wall?.displayIndex ?? '?'),
      }),
      detail: interpolateTemplate(impactStrings.areaNotNeeded, {
        area: formatSquareMetersFromMm2(impact.coverageAreaRemovedMm2, locale),
      }),
    }
  })
}

/** Exported for tests — ensures presenter wording avoids «minimum» semantics. */
export function collectPreciseResultUserStrings(
  presented: PresentedPreciseWallpaperResult,
): string[] {
  return [
    presented.plannedRollsHeading,
    presented.plannedRollsHelper,
    presented.conservativeNote,
    presented.comparison?.title ?? '',
    presented.comparison?.body ?? '',
    ...presented.explanationSteps.map((step) => `${step.title} ${step.body}`),
  ]
}

/** Maps opening field validation codes to localized messages. */
export function mapPreciseFieldError(
  code: import('@/units/parse-decimal-input').ParseDecimalInputErrorCode
    | 'OPENING_OUTSIDE_WALL'
    | 'OVERLAPPING',
): string {
  const strings = t()
  const fieldStrings = strings.wallpaper.errors.field
  const preciseErrors = strings.wallpaper.precise.errors

  if (code === 'OPENING_OUTSIDE_WALL') {
    return preciseErrors.openingOutsideWall
  }

  if (code === 'OVERLAPPING') {
    return preciseErrors.overlappingOpenings
  }

  switch (code) {
    case 'EMPTY':
      return fieldStrings.empty
    case 'INVALID_FORMAT':
      return fieldStrings.invalidFormat
    case 'NOT_POSITIVE':
      return fieldStrings.notPositive
    case 'NOT_FINITE':
      return fieldStrings.notFinite
    case 'TOO_LARGE':
      return fieldStrings.tooLarge
    default:
      return fieldStrings.invalidFormat
  }
}

/** Formats a wall label for pickers — «Стена 2». */
export function formatWallLabel(wall: PreciseWallDraft, locale: SupportedLocale): string {
  const strings = t()
  return interpolateTemplate(strings.wallpaper.precise.walls.wallTitle, {
    number: formatCount(wall.displayIndex, locale),
  })
}

/**
 * Read-only opening card meta line.
 * Example RU: «Стена 1 · 0,8 × 2 м» (even when draft text used dots).
 */
export function formatOpeningSummaryLine(
  wallLabel: string,
  widthRaw: string,
  heightRaw: string,
  locale: SupportedLocale,
): string {
  const strings = t()
  const width = formatDimensionTextForDisplay(widthRaw, locale) || '?'
  const height = formatDimensionTextForDisplay(heightRaw, locale) || '?'
  return `${wallLabel} · ${width} × ${height} ${strings.wallpaper.units.meters}`
}

/** Formats roll summary line from preset id and custom dimensions. */
export function formatRollSummaryLabel(
  presetId: import('@/config/wallpaper-roll-presets').WallpaperRollPresetId,
  rollWidth: string,
  rollLength: string,
  locale: SupportedLocale = 'ru',
): string {
  const strings = t()

  if (presetId === 'custom') {
    const width = formatDimensionTextForDisplay(rollWidth, locale) || rollWidth
    const length = formatDimensionTextForDisplay(rollLength, locale) || rollLength
    return `${width} × ${length} ${strings.wallpaper.units.meters}`
  }

  if (presetId === 'narrow-530') {
    return strings.wallpaper.rollPresets.labels.narrow530
  }

  return strings.wallpaper.rollPresets.labels.wide1060
}

/** Locale-aware pattern repeat fragment for wallpaper config summary. */
export function formatPatternRepeatSummary(
  repeatCm: string,
  locale: SupportedLocale,
): string {
  const strings = t()
  const formatted = formatCentimetersTextForDisplay(repeatCm, locale) || repeatCm
  return `${formatted} ${strings.wallpaper.units.centimeters}`
}

export { formatMetersFromMm }
