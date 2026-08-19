import { useState } from 'react'
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { DimensionField } from '@/features/wallpaper/components/dimension-field'
import { WallPreview } from '@/features/wallpaper/precise/components/wall-preview'
import type {
  PreciseFormFieldErrors,
  PreciseFormFieldKey,
} from '@/features/wallpaper/precise/input/parse-precise-form'
import {
  formatWallLabel,
  mapPreciseFieldError,
} from '@/features/wallpaper/precise/presenter/present-precise-wallpaper-result'
import type {
  PreciseOpeningDraft,
  PreciseWallDraft,
} from '@/features/wallpaper/precise/state/precise-draft-types'
import { getLocale, t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

interface OpeningFormSheetProps {
  visible: boolean
  opening: PreciseOpeningDraft | null
  walls: PreciseWallDraft[]
  fieldErrors: PreciseFormFieldErrors
  onSave: (opening: PreciseOpeningDraft) => void
  onClose: () => void
  onDraftChange: () => void
}

/** Modal form for adding or editing a door/window with wall preview. */
export function OpeningFormSheet({
  visible,
  opening,
  walls,
  fieldErrors,
  onSave,
  onClose,
  onDraftChange,
}: OpeningFormSheetProps) {
  if (!visible || !opening) {
    return null
  }

  return (
    <OpeningFormSheetBody
      fieldErrors={fieldErrors}
      initialOpening={opening}
      onClose={onClose}
      onDraftChange={onDraftChange}
      onSave={onSave}
      walls={walls}
    />
  )
}

interface OpeningFormSheetBodyProps {
  initialOpening: PreciseOpeningDraft
  walls: PreciseWallDraft[]
  fieldErrors: PreciseFormFieldErrors
  onSave: (opening: PreciseOpeningDraft) => void
  onClose: () => void
  onDraftChange: () => void
}

function OpeningFormSheetBody({
  initialOpening,
  walls,
  fieldErrors,
  onSave,
  onClose,
  onDraftChange,
}: OpeningFormSheetBodyProps) {
  const strings = t()
  const locale = getLocale()
  const openingStrings = strings.wallpaper.precise.openings
  const [draft, setDraft] = useState<PreciseOpeningDraft>(initialOpening)

  const resolveError = (key: PreciseFormFieldKey): string | undefined => {
    const code = fieldErrors[key]

    if (!code) {
      return undefined
    }

    return mapPreciseFieldError(code)
  }

  const selectedWall = walls.find((wall) => wall.id === draft.wallId) ?? walls[0]
  const title = draft.kind === 'door' ? openingStrings.editDoor : openingStrings.editWindow

  const handleSave = () => {
    Keyboard.dismiss()
    onSave(draft)
  }

  const updateOpeningDraft = (
    updater: (current: PreciseOpeningDraft) => PreciseOpeningDraft,
  ) => {
    onDraftChange()
    setDraft(updater)
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionLabel}>{openingStrings.onWall}</Text>
            <View style={styles.wallPicker}>
              {walls.map((wall) => {
                const selected = wall.id === draft.wallId

                return (
                  <Pressable
                    key={wall.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => updateOpeningDraft((current) => ({ ...current, wallId: wall.id }))}
                    style={({ pressed }) => [
                      styles.wallChip,
                      selected && styles.wallChipSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.wallChipLabel,
                        selected && styles.wallChipLabelSelected,
                      ]}
                    >
                      {formatWallLabel(wall, locale)}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <DimensionField
              errorMessage={resolveError(`opening:${draft.id}:width`)}
              label={openingStrings.width}
              onChangeText={(value) => updateOpeningDraft((current) => ({ ...current, width: value }))}
              unit={strings.wallpaper.units.meters}
              value={draft.width}
            />
            <DimensionField
              errorMessage={resolveError(`opening:${draft.id}:height`)}
              label={openingStrings.height}
              onChangeText={(value) => updateOpeningDraft((current) => ({ ...current, height: value }))}
              unit={strings.wallpaper.units.meters}
              value={draft.height}
            />
            <DimensionField
              errorMessage={resolveError(`opening:${draft.id}:offsetFromLeft`)}
              label={openingStrings.offsetFromLeft}
              onChangeText={(value) => updateOpeningDraft((current) => ({ ...current, offsetFromLeft: value }))}
              unit={strings.wallpaper.units.meters}
              value={draft.offsetFromLeft}
            />
            <Text style={styles.helper}>{openingStrings.offsetFromLeftHint}</Text>

            {draft.kind === 'window' ? (
              <>
                <DimensionField
                  errorMessage={resolveError(`opening:${draft.id}:offsetFromFloor`)}
                  label={openingStrings.offsetFromFloor}
                  onChangeText={(value) => updateOpeningDraft((current) => ({ ...current, offsetFromFloor: value }))}
                  unit={strings.wallpaper.units.meters}
                  value={draft.offsetFromFloor}
                />
                <Text style={styles.helper}>{openingStrings.offsetFromFloorHint}</Text>
              </>
            ) : null}

            {selectedWall ? (
              <WallPreview
                hint={openingStrings.previewHint}
                label={openingStrings.previewLabel}
                opening={{
                  kind: draft.kind,
                  width: draft.width,
                  height: draft.height,
                  offsetFromLeft: draft.offsetFromLeft,
                  offsetFromFloor: draft.offsetFromFloor,
                }}
                wallHeight={selectedWall.height}
                wallWidth={selectedWall.width}
              />
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryLabel}>{openingStrings.cancel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={handleSave}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryLabel}>{openingStrings.save}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '92%',
    padding: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  wallPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  wallChip: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  wallChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  wallChipLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  wallChipLabelSelected: {
    color: '#FFFFFF',
  },
  helper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: -spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  secondaryLabel: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  primaryLabel: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
})
