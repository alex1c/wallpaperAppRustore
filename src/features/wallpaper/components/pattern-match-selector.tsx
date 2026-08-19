import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { UiPatternMatchId } from '@/features/wallpaper/pattern/pattern-match-types'
import { t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

const PATTERN_OPTIONS: readonly UiPatternMatchId[] = [
  'free',
  'straight',
  'half-drop',
]

interface PatternMatchSelectorProps {
  selectedId: UiPatternMatchId
  onSelect: (id: UiPatternMatchId) => void
}

/**
 * Human-first pattern match selector — professional terms are secondary hints only.
 */
export function PatternMatchSelector({
  selectedId,
  onSelect,
}: PatternMatchSelectorProps) {
  const strings = t()

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{strings.wallpaper.pattern.sectionTitle}</Text>

      {PATTERN_OPTIONS.map((optionId) => {
        const selected = selectedId === optionId
        const option = strings.wallpaper.pattern.options[optionId]

        return (
          <Pressable
            key={optionId}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(optionId)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && styles.optionPressed,
            ]}
          >
            <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
              {selected ? <View style={styles.radioInner} /> : null}
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
              {option.hint ? (
                <Text style={styles.optionHint}>{option.hint}</Text>
              ) : null}
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  optionSelected: {
    borderColor: colors.accent,
  },
  optionPressed: {
    opacity: 0.92,
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
    width: 20,
  },
  radioOuterSelected: {
    borderColor: colors.accent,
  },
  radioInner: {
    backgroundColor: colors.accent,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  optionDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  optionHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
})
