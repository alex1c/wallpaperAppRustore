import { Pressable, StyleSheet, Text, View } from 'react-native'
import { DimensionField } from '@/features/wallpaper/components/dimension-field'
import { formatWallLabel } from '@/features/wallpaper/precise/presenter/present-precise-wallpaper-result'
import type { PreciseWallDraft } from '@/features/wallpaper/precise/state/precise-draft-types'
import { getLocale, t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

interface PreciseWallCardProps {
  wall: PreciseWallDraft
  widthError?: string
  heightError?: string
  canRemove: boolean
  onChangeWidth: (value: string) => void
  onChangeHeight: (value: string) => void
  onRemove: () => void
}

/** Editable wall row card — human labels only, no domain ids in UI. */
export function PreciseWallCard({
  wall,
  widthError,
  heightError,
  canRemove,
  onChangeWidth,
  onChangeHeight,
  onRemove,
}: PreciseWallCardProps) {
  const strings = t()
  const locale = getLocale()
  const wallStrings = strings.wallpaper.precise.walls

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{formatWallLabel(wall, locale)}</Text>
        {canRemove ? (
          <Pressable
            accessibilityLabel={wallStrings.removeWall}
            accessibilityHint={wallStrings.removeWallHint}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onRemove}
            style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
          >
            <Text style={styles.removeLabel}>{wallStrings.removeWall}</Text>
          </Pressable>
        ) : null}
      </View>

      <DimensionField
        errorMessage={widthError}
        label={wallStrings.width}
        onChangeText={onChangeWidth}
        unit={strings.wallpaper.units.meters}
        value={wall.width}
      />
      <DimensionField
        errorMessage={heightError}
        label={wallStrings.height}
        onChangeText={onChangeHeight}
        unit={strings.wallpaper.units.meters}
        value={wall.height}
      />
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
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  removeButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  removeLabel: {
    ...typography.caption,
    color: colors.error,
  },
  pressed: {
    opacity: 0.85,
  },
})
