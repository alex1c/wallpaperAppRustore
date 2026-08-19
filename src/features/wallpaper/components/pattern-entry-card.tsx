import { Pressable, StyleSheet, Text } from 'react-native'
import { t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

interface PatternEntryCardProps {
  onPress: () => void
}

/** Secondary entry for pattern-aware Quick calculation refinement. */
export function PatternEntryCard({ onPress }: PatternEntryCardProps) {
  const strings = t()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={strings.wallpaper.patternEntry.subtitle}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <Text style={styles.title}>{strings.wallpaper.patternEntry.title}</Text>
      <Text style={styles.subtitle}>{strings.wallpaper.patternEntry.subtitle}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    minHeight: 44,
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.9,
  },
  title: {
    ...typography.subtitle,
    color: colors.accent,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
})
