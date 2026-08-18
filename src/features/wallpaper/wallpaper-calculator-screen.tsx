import { useMemo, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { ScreenContainer } from '@/components/screen-container'
import { calculateQuickWallpaper } from '@/domain/wallpaper'
import { formatNumber, t } from '@/i18n'
import { getAnalyticsService } from '@/services'
import { colors, radii, spacing, typography } from '@/theme'
import { centimetersToMillimeters } from '@/units'

/** Demo defaults roughly matching a typical Russian room and roll. */
const DEFAULT_ROOM = {
  widthCm: 400,
  lengthCm: 500,
  heightCm: 270,
}

const DEFAULT_ROLL = {
  widthCm: 53,
  lengthCm: 1000,
}

/**
 * Foundation wallpaper calculator screen — quick mode placeholder only.
 * Full UX and precise mode arrive in Phases 3–4.
 */
export function WallpaperCalculatorScreen() {
  const strings = t()
  const [roomWidthCm, setRoomWidthCm] = useState(String(DEFAULT_ROOM.widthCm))
  const [roomLengthCm, setRoomLengthCm] = useState(String(DEFAULT_ROOM.lengthCm))
  const [roomHeightCm, setRoomHeightCm] = useState(String(DEFAULT_ROOM.heightCm))
  const [rollWidthCm, setRollWidthCm] = useState(String(DEFAULT_ROLL.widthCm))
  const [rollLengthCm, setRollLengthCm] = useState(String(DEFAULT_ROLL.lengthCm))
  const [minimumRolls, setMinimumRolls] = useState<number | null>(null)
  const [requiredStrips, setRequiredStrips] = useState<number | null>(null)

  const canCalculate = useMemo(() => {
    return [
      roomWidthCm,
      roomLengthCm,
      roomHeightCm,
      rollWidthCm,
      rollLengthCm,
    ].every((value) => value.trim().length > 0)
  }, [
    roomHeightCm,
    roomLengthCm,
    roomWidthCm,
    rollLengthCm,
    rollWidthCm,
  ])

  const handleCalculate = () => {
    getAnalyticsService().track({ name: 'calculation_start' })

    const outcome = calculateQuickWallpaper({
      room: {
        widthMm: centimetersToMillimeters(Number(roomWidthCm)),
        lengthMm: centimetersToMillimeters(Number(roomLengthCm)),
        heightMm: centimetersToMillimeters(Number(roomHeightCm)),
      },
      roll: {
        widthMm: centimetersToMillimeters(Number(rollWidthCm)),
        lengthMm: centimetersToMillimeters(Number(rollLengthCm)),
      },
    })

    if (!outcome.ok) {
      setMinimumRolls(null)
      setRequiredStrips(null)
      return
    }

    setMinimumRolls(outcome.result.minimumRolls)
    setRequiredStrips(outcome.result.requiredStrips)

    getAnalyticsService().track({
      name: 'calculation_complete',
      params: { rolls: outcome.result.minimumRolls },
    })
    getAnalyticsService().track({ name: 'result_view' })
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.heading} accessibilityRole="header">
        {strings.wallpaper.heading}
      </Text>
      <Text style={styles.note}>{strings.wallpaper.placeholderNote}</Text>

      <DimensionField
        label={strings.wallpaper.roomWidth}
        unit={strings.wallpaper.unitCm}
        value={roomWidthCm}
        onChangeText={setRoomWidthCm}
      />
      <DimensionField
        label={strings.wallpaper.roomLength}
        unit={strings.wallpaper.unitCm}
        value={roomLengthCm}
        onChangeText={setRoomLengthCm}
      />
      <DimensionField
        label={strings.wallpaper.roomHeight}
        unit={strings.wallpaper.unitCm}
        value={roomHeightCm}
        onChangeText={setRoomHeightCm}
      />
      <DimensionField
        label={strings.wallpaper.rollWidth}
        unit={strings.wallpaper.unitCm}
        value={rollWidthCm}
        onChangeText={setRollWidthCm}
      />
      <DimensionField
        label={strings.wallpaper.rollLength}
        unit={strings.wallpaper.unitCm}
        value={rollLengthCm}
        onChangeText={setRollLengthCm}
      />

      <Pressable
        accessibilityRole="button"
        disabled={!canCalculate}
        onPress={handleCalculate}
        style={({ pressed }) => [
          styles.button,
          !canCalculate && styles.buttonDisabled,
          pressed && canCalculate && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonLabel}>{strings.wallpaper.calculate}</Text>
      </Pressable>

      {minimumRolls !== null && requiredStrips !== null ? (
        <View style={styles.resultCard} accessibilityLiveRegion="polite">
          <Text style={styles.resultTitle}>{strings.wallpaper.resultRolls}</Text>
          <Text style={styles.resultValue}>{formatNumber(minimumRolls)}</Text>
          <Text style={styles.resultMeta}>
            {strings.wallpaper.resultStrips}: {formatNumber(requiredStrips)}
          </Text>
        </View>
      ) : null}
    </ScreenContainer>
  )
}

interface DimensionFieldProps {
  label: string
  unit: string
  value: string
  onChangeText: (value: string) => void
}

/** Labeled numeric input with unit suffix — UI converts cm to domain mm on submit. */
function DimensionField({
  label,
  unit,
  value,
  onChangeText,
}: DimensionFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="decimal-pad"
          onChangeText={onChangeText}
          style={styles.input}
          value={value}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  heading: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  unit: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    backgroundColor: colors.accentPressed,
  },
  buttonLabel: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  resultTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  resultValue: {
    ...typography.title,
    color: colors.success,
    marginVertical: spacing.xs,
  },
  resultMeta: {
    ...typography.body,
    color: colors.textPrimary,
  },
})
