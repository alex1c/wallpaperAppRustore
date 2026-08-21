import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ExplanationSection } from '@/features/wallpaper/components/explanation-section'
import type { PresentedPreciseWallpaperResult } from '@/features/wallpaper/precise/presenter/present-precise-wallpaper-result'
import { t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

interface PreciseResultProps {
  result: PresentedPreciseWallpaperResult
  explanationExpanded: boolean
  onToggleExplanation: () => void
  /** Optional slot between secondary details and explanation (e.g. result banner). */
  belowDetailsSlot?: ReactNode
}

/**
 * Precise Mode result card — uses «planned cutting layout» wording,
 * never «minimum rolls» semantics.
 */
export function PreciseResult({
  result,
  explanationExpanded,
  onToggleExplanation,
  belowDetailsSlot,
}: PreciseResultProps) {
  const strings = t()
  const explanationStrings = strings.wallpaper.precise.explanation

  return (
    <View
      key={result.resultKey}
      accessibilityLiveRegion="polite"
      style={styles.container}
    >
      <Text style={styles.plannedHeading}>{result.plannedRollsHeading}</Text>

      <View style={styles.heroRow}>
        <Text
          accessibilityLabel={`${result.plannedRollsHeading} ${result.plannedRollsValue}`}
          style={styles.heroValue}
        >
          {result.plannedRollsValue}
        </Text>
        <Text style={styles.heroUnit}>{result.plannedRollsUnit}</Text>
      </View>

      <Text style={styles.helper}>{result.plannedRollsHelper}</Text>
      <Text style={styles.meta}>{result.summaryLine}</Text>
      <Text style={styles.meta}>
        {result.coverageAreaLabel}
        {': '}
        {result.coverageAreaValue}
      </Text>

      {result.comparison ? (
        <View style={styles.comparisonBox}>
          <Text style={styles.comparisonTitle}>{result.comparison.title}</Text>
          <Text style={styles.comparisonBody}>{result.comparison.body}</Text>
        </View>
      ) : null}

      {result.openingImpacts.length > 0 ? (
        <View style={styles.impactsBox}>
          <Text style={styles.impactsTitle}>{result.openingImpactsSectionTitle}</Text>
          {result.openingImpacts.map((impact) => (
            <View key={impact.label} style={styles.impactRow}>
              <Text style={styles.impactLabel}>{impact.label}</Text>
              <Text style={styles.impactDetail}>{impact.detail}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {belowDetailsSlot}

      <ExplanationSection
        expanded={explanationExpanded}
        onToggle={onToggleExplanation}
        phaseAssumptionNote={null}
        steps={result.explanationSteps.map((step, index) => ({
          stepNumber: index + 1,
          title: step.title,
          body: step.body,
        }))}
        toggleHintCollapsed={explanationStrings.toggleHintCollapsed}
        toggleHintExpanded={explanationStrings.toggleHintExpanded}
        toggleLabel={explanationStrings.toggleLabel}
        trimHint={result.conservativeNote}
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
  plannedHeading: {
    ...typography.subtitle,
    color: colors.textSecondary,
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
  helper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  meta: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  comparisonBox: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  comparisonTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  comparisonBody: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  impactsBox: {
    marginTop: spacing.md,
  },
  impactsTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  impactRow: {
    marginTop: spacing.xs,
  },
  impactLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  impactDetail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
})
