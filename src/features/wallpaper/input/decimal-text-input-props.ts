import type { TextInputProps } from 'react-native'

/** Props applied to decimal dimension fields for locale-friendly entry. */
export type DecimalTextInputProps = Pick<TextInputProps, 'keyboardType' | 'inputMode'>

export type DecimalInputPlatform = 'android' | 'ios' | 'windows' | 'macos' | 'web'

/**
 * Android must NOT use `inputMode="decimal"` or `keyboardType="decimal-pad"`.
 *
 * React Native maps `inputMode="decimal"` → `keyboardType="decimal-pad"`
 * (see `inputModeToKeyboardTypeMap` in RN TextInput). On Android that becomes
 * `TYPE_CLASS_NUMBER | TYPE_NUMBER_FLAG_DECIMAL`, which DigitsKeyListener
 * filters to digits + '.' only — locale commas never reach `onChangeText`.
 *
 * Use the default text keyboard so "," and "." both survive typing/paste;
 * parsing and normalization remain submit-time only.
 */
export function getDecimalTextInputPropsForPlatform(
  os: DecimalInputPlatform,
): DecimalTextInputProps {
  if (os === 'android') {
    return {
      keyboardType: 'default',
      inputMode: 'text',
    }
  }

  return {
    inputMode: 'decimal',
    keyboardType: 'decimal-pad',
  }
}
