import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { PresentedWallpaperResult } from '@/features/wallpaper/presenter'
import { t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'
import { ExplanationSection } from './explanation-section'

interface CalculationResultProps {
  result: PresentedWallpaperResult
  explanationExpanded: boolean
  onToggleExplanation: () => void
  /** Optional slot between secondary details and explanation (e.g. result banner). */
  belowDetailsSlot?: ReactNode
}

/**
 * Primary result card — minimum rolls hero, secondary strip stats,
 * spare recommendation separated from strict minimum.
 * Explanation is collapsed by default and lives below the hero result.
 */
export function CalculationResult({
  result,
  explanationExpanded,
  onToggleExplanation,
  belowDetailsSlot,
}: CalculationResultProps) {
  const strings = t()

  return (
    <View
      key={result.resultKey}
      accessibilityLiveRegion="polite"
      style={styles.container}
    >
      <Text style={styles.minimumHeading}>{result.minimumRollsHeading}</Text>

      {result.patternApplied ? (
        <Text style={styles.patternBadge}>{strings.wallpaper.result.patternAppliedBadge}</Text>
      ) : null}

      <View style={styles.heroRow}>
        <Text
          accessibilityLabel={`${result.minimumRollsHeading} ${result.minimumRollsValue}`}
          style={styles.heroValue}
        >
          {result.minimumRollsValue}
        </Text>
        <Text style={styles.heroUnit}>{result.minimumRollsUnit}</Text>
      </View>

      <Text style={styles.meta}>{result.stripsSummary}</Text>
      <Text style={styles.meta}>{result.stripsPerRollSummary}</Text>

      {result.recommendation ? (
        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationText}>
            {result.recommendation.spareMessage}
          </Text>
          <Text style={styles.recommendationTotal}>
            {result.recommendation.totalWithSpareMessage}
          </Text>
        </View>
      ) : null}

      {belowDetailsSlot}

      <ExplanationSection
        expanded={explanationExpanded}
        onToggle={onToggleExplanation}
        phaseAssumptionNote={result.phaseAssumptionNote}
        steps={result.explanationSteps}
        trimHint={result.trimHint}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  minimumHeading: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  patternBadge: {
    ...typography.caption,
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    color: colors.accent,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  heroValue: {
    ...typography.title,
    color: colors.success,
    fontSize: 40,
    lineHeight: 48,
  },
  heroUnit: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  recommendationBox: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  recommendationText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  recommendationTotal: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
})
