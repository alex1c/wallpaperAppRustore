import { Pressable, StyleSheet, Text } from 'react-native'
import { t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

interface PreciseEntryCardProps {
  onPress: () => void
}

/**
 * Single secondary entry point for Phase 4 precise calculation.
 * Entire card is tappable — not just a text link.
 */
export function PreciseEntryCard({ onPress }: PreciseEntryCardProps) {
  const strings = t()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={strings.wallpaper.preciseEntry.subtitle}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <Text style={styles.title}>{strings.wallpaper.preciseEntry.title}</Text>
      <Text style={styles.subtitle}>{strings.wallpaper.preciseEntry.subtitle}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.lg,
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
