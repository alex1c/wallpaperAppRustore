import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  formatPatternRepeatSummary,
  formatRollSummaryLabel,
} from '@/features/wallpaper/precise/presenter/present-precise-wallpaper-result'
import type { PreciseDraft } from '@/features/wallpaper/precise/state/precise-draft-types'
import { getLocale, t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

interface WallpaperConfigSummaryProps {
  draft: PreciseDraft
  onChangeRoll: () => void
  onChangePattern: () => void
}

/** Compact roll + pattern summary — not the main focus of Precise Mode. */
export function WallpaperConfigSummary({
  draft,
  onChangeRoll,
  onChangePattern,
}: WallpaperConfigSummaryProps) {
  const strings = t()
  const locale = getLocale()
  const wallpaperStrings = strings.wallpaper.precise.wallpaper
  const rollLabel = formatRollSummaryLabel(
    draft.rollPresetId,
    draft.rollWidth,
    draft.rollLength,
    locale,
  )

  const patternLabel = draft.pattern === null
    ? wallpaperStrings.noPattern
    : draft.pattern.matchType === 'free'
      ? strings.wallpaper.pattern.options.free.title
      : `${strings.wallpaper.pattern.options.straight.title}${draft.pattern.repeatCm ? ` · ${formatPatternRepeatSummary(draft.pattern.repeatCm, locale)}` : ''}`

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.rowContent}>
          <Text style={styles.rowLabel}>{wallpaperStrings.rollSummary}</Text>
          <Text style={styles.rowValue}>{rollLabel}</Text>
        </View>
        <Pressable
          accessibilityHint={wallpaperStrings.rollSummary}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onChangeRoll}
          style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]}
        >
          <Text style={styles.changeLabel}>{wallpaperStrings.changeRoll}</Text>
        </Pressable>
      </View>

      <View style={[styles.row, styles.rowSpacing]}>
        <View style={styles.rowContent}>
          <Text style={styles.rowLabel}>{wallpaperStrings.patternSummary}</Text>
          <Text style={styles.rowValue}>{patternLabel}</Text>
        </View>
        <Pressable
          accessibilityHint={wallpaperStrings.patternSummary}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onChangePattern}
          style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]}
        >
          <Text style={styles.changeLabel}>{wallpaperStrings.changePattern}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowSpacing: {
    marginTop: spacing.md,
  },
  rowContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  changeButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  changeLabel: {
    ...typography.subtitle,
    color: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
})
