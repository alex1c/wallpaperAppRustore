import type { SupportedLocale } from '@/config/app-config'
import type {
  RollPurchaseRecommendation,
  WallpaperCalculationResult,
} from '@/domain/wallpaper'
import { t } from '@/i18n'
import { formatRuCountNoun, pluralizeRu } from '@/i18n/pluralize'
import { buildExplanationSteps, type PresentedExplanationStep } from './build-explanation-steps'
import { formatCount } from './format-length'

/** Localized UI model for Quick Mode calculation results — no domain math here. */
export interface PresentedWallpaperResult {
  /** Stable key for React remount when recalculating — avoids stale explanation UI. */
  resultKey: string
  minimumRolls: number
  minimumRollsHeading: string
  minimumRollsValue: string
  minimumRollsUnit: string
  requiredStrips: number
  stripsSummary: string
  stripsPerRollSummary: string
  recommendation: PresentedRecommendation | null
  explanationSteps: PresentedExplanationStep[]
  phaseAssumptionNote: string | null
  trimHint: string
  patternApplied: boolean
}

export interface PresentedRecommendation {
  spareMessage: string
  totalWithSpareMessage: string
}

/**
 * Converts domain calculation + purchase recommendation into localized UI model.
 * Never modifies minimumRolls — values pass through unchanged from domain.
 */
export function presentWallpaperQuickResult(
  result: WallpaperCalculationResult,
  recommendation: RollPurchaseRecommendation,
  locale: SupportedLocale,
): PresentedWallpaperResult {
  const strings = t()
  const { trace } = result
  const stripNouns = strings.wallpaper.nouns.strip
  const rollNouns = strings.wallpaper.nouns.roll

  const minimumRollsValue = formatCount(result.minimumRolls, locale)

  let recommendationPresented: PresentedRecommendation | null = null

  if (recommendation.suggestedSpareRolls > 0) {
    const spareLabel = formatRuCountNoun(
      recommendation.suggestedSpareRolls,
      rollNouns.one,
      rollNouns.few,
      rollNouns.many,
      locale,
    )

    recommendationPresented = {
      spareMessage: `${strings.wallpaper.result.sparePrefix} ${spareLabel}`,
      totalWithSpareMessage: `${strings.wallpaper.result.totalWithSpare} ${formatCount(recommendation.suggestedTotalRolls, locale)}`,
    }
  }

  const phaseAssumptionNote = trace.patternPhase.minimumRollsDependsOnPhaseAssumption
    ? strings.wallpaper.explanation.phaseAssumptionNote
    : null

  const stripsSummary = formatRuCountNoun(
    result.requiredStrips,
    stripNouns.one,
    stripNouns.few,
    stripNouns.many,
    locale,
  )

  const stripsPerRollNoun = locale === 'ru'
    ? pluralizeRu(
      result.stripsPerFullRoll,
      stripNouns.one,
      stripNouns.few,
      stripNouns.many,
    )
    : result.stripsPerFullRoll === 1 ? stripNouns.one : stripNouns.many

  const stripsPerRollSummary = locale === 'ru'
    ? `${strings.wallpaper.result.stripsPerRollPrefix} ${formatCount(result.stripsPerFullRoll, locale)} ${stripsPerRollNoun} из полного рулона`
    : `${formatCount(result.stripsPerFullRoll, locale)} ${stripsPerRollNoun} per full roll`

  return {
    resultKey: `${result.minimumRolls}-${result.requiredStrips}-${result.stripsPerFullRoll}`,
    minimumRolls: result.minimumRolls,
    minimumRollsHeading: strings.wallpaper.result.minimumHeading,
    minimumRollsValue,
    minimumRollsUnit: pluralizeRolls(result.minimumRolls, locale),
    requiredStrips: result.requiredStrips,
    stripsSummary,
    stripsPerRollSummary,
    recommendation: recommendationPresented,
    explanationSteps: buildExplanationSteps(trace, locale),
    phaseAssumptionNote,
    trimHint: strings.wallpaper.explanation.trimHint,
    patternApplied: result.patternApplied,
  }
}

/** Simple RU/EN roll noun for the hero result line. */
function pluralizeRolls(count: number, locale: SupportedLocale): string {
  const strings = t()
  const rollNouns = strings.wallpaper.nouns.roll

  if (locale === 'ru') {
    return pluralizeRu(count, rollNouns.one, rollNouns.few, rollNouns.many)
  }

  return count === 1 ? rollNouns.one : rollNouns.many
}
