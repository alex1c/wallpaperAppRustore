import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  formatOpeningSummaryLine,
  formatWallLabel,
} from '@/features/wallpaper/precise/presenter/present-precise-wallpaper-result'
import type {
  PreciseOpeningDraft,
  PreciseWallDraft,
} from '@/features/wallpaper/precise/state/precise-draft-types'
import { getLocale, t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

interface PreciseOpeningsSectionProps {
  openings: PreciseOpeningDraft[]
  walls: PreciseWallDraft[]
  onAddDoor: () => void
  onAddWindow: () => void
  onEditOpening: (opening: PreciseOpeningDraft) => void
  onRemoveOpening: (openingId: string) => void
}

/** Doors/windows list with empty state and add actions. */
export function PreciseOpeningsSection({
  openings,
  walls,
  onAddDoor,
  onAddWindow,
  onEditOpening,
  onRemoveOpening,
}: PreciseOpeningsSectionProps) {
  const strings = t()
  const locale = getLocale()
  const openingStrings = strings.wallpaper.precise.openings

  return (
    <View>
      {openings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{openingStrings.emptyTitle}</Text>
          <Text style={styles.emptyBody}>{openingStrings.emptyBody}</Text>
        </View>
      ) : (
        openings.map((opening) => {
          const wall = walls.find((entry) => entry.id === opening.wallId)
          const kindLabel = opening.kind === 'door'
            ? openingStrings.doorLabel
            : openingStrings.windowLabel
          const wallLabel = wall ? formatWallLabel(wall, locale) : '—'
          const sizeSummary = formatOpeningSummaryLine(
            wallLabel,
            opening.width,
            opening.height,
            locale,
          )

          return (
            <Pressable
              key={opening.id}
              accessibilityRole="button"
              onPress={() => onEditOpening(opening)}
              style={({ pressed }) => [styles.openingCard, pressed && styles.pressed]}
            >
              <View style={styles.openingHeader}>
                <Text style={styles.openingTitle}>{kindLabel}</Text>
                <Pressable
                  accessibilityLabel={openingStrings.remove}
                  accessibilityHint={openingStrings.removeHint}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => onRemoveOpening(opening.id)}
                  style={({ pressed: removePressed }) => [
                    styles.removeButton,
                    removePressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.removeLabel}>{openingStrings.remove}</Text>
                </Pressable>
              </View>
              <Text style={styles.openingMeta}>{sizeSummary}</Text>
            </Pressable>
          )
        })
      )}

      <Pressable
        accessibilityRole="button"
        onPress={onAddDoor}
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
      >
        <Text style={styles.addButtonLabel}>{openingStrings.addDoor}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onAddWindow}
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
      >
        <Text style={styles.addButtonLabel}>{openingStrings.addWindow}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  openingCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    minHeight: 44,
    padding: spacing.md,
  },
  openingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  openingTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  openingMeta: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  addButtonLabel: {
    ...typography.subtitle,
    color: colors.accent,
  },
  pressed: {
    opacity: 0.9,
  },
})
