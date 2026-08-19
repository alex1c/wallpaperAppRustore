import type { RefObject } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import {
  filterDecimalInputText,
  filterIntegerInputText,
} from '@/units/decimal-input-text'
import { getDecimalKeyboardType } from '@/features/wallpaper/input/decimal-keyboard'
import { colors, radii, spacing, typography } from '@/theme'

export type DimensionInputMode = 'decimal' | 'integer'

interface DimensionFieldProps {
  label: string
  unit: string
  value: string
  errorMessage?: string
  inputMode?: DimensionInputMode
  inputRef?: RefObject<TextInput | null>
  onInputRef?: (ref: TextInput | null) => void
  onChangeText: (value: string) => void
  onSubmitEditing?: () => void
  returnKeyType?: 'next' | 'done' | 'go'
}

/**
 * Labeled numeric input with unit suffix and inline validation message.
 * Stores raw user-editable string; parsing happens on submit only. Input mode
 * affects the soft keyboard, not the value, so invalid paste remains fixable.
 */
export function DimensionField({
  label,
  unit,
  value,
  errorMessage,
  inputMode = 'decimal',
  inputRef,
  onInputRef,
  onChangeText,
  onSubmitEditing,
  returnKeyType = 'done',
}: DimensionFieldProps) {
  const hasError = Boolean(errorMessage)

  const handleChangeText = (raw: string) => {
    const editableText = inputMode === 'integer'
      ? filterIntegerInputText(raw)
      : filterDecimalInputText(raw)

    onChangeText(editableText)
  }

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          hasError && styles.inputRowError,
        ]}
      >
        <TextInput
          ref={(node) => {
            if (inputRef) {
              inputRef.current = node
            }

            onInputRef?.(node)
          }}
          accessibilityLabel={label}
          accessibilityHint={errorMessage ? `${unit}. ${errorMessage}` : unit}
          keyboardType={
            inputMode === 'integer' ? 'number-pad' : getDecimalKeyboardType()
          }
          onChangeText={handleChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          style={styles.input}
          value={value}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
      {hasError ? (
        <Text
          accessibilityRole="alert"
          style={styles.errorText}
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  inputRowError: {
    borderColor: colors.error,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.sm,
  },
  unit: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
})
