import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  WALLPAPER_ROLL_PRESETS,
  type WallpaperRollPresetId,
} from '@/config/wallpaper-roll-presets'
import { t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

interface RollPresetSelectorProps {
  selectedId: WallpaperRollPresetId
  onSelect: (id: WallpaperRollPresetId) => void
}

/**
 * Radio-style preset list for common roll sizes plus a custom option.
 * Preset dimensions are config data — not embedded in the calculation engine.
 */
export function RollPresetSelector({
  selectedId,
  onSelect,
}: RollPresetSelectorProps) {
  const strings = t()

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>{strings.wallpaper.rollPresets.popularSizes}</Text>

      {WALLPAPER_ROLL_PRESETS.map((preset) => {
        const selected = selectedId === preset.id
        const label = strings.wallpaper.rollPresets.labels[preset.labelKey]

        return (
          <Pressable
            key={preset.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(preset.id)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && styles.optionPressed,
            ]}
          >
            <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
              {selected ? <View style={styles.radioInner} /> : null}
            </View>
            <Text style={styles.optionLabel}>{label}</Text>
          </Pressable>
        )
      })}

      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: selectedId === 'custom' }}
        onPress={() => onSelect('custom')}
        style={({ pressed }) => [
          styles.option,
          selectedId === 'custom' && styles.optionSelected,
          pressed && styles.optionPressed,
        ]}
      >
        <View
          style={[
            styles.radioOuter,
            selectedId === 'custom' && styles.radioOuterSelected,
          ]}
        >
          {selectedId === 'custom' ? <View style={styles.radioInner} /> : null}
        </View>
        <Text style={styles.optionLabel}>{strings.wallpaper.rollPresets.custom}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.accent,
  },
  optionPressed: {
    opacity: 0.9,
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginRight: spacing.sm,
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
  optionLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
})
