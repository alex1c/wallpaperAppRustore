import type { TextInputProps } from 'react-native'

/** Props applied to decimal dimension fields for locale-friendly entry. */
export type DecimalTextInputProps = Pick<TextInputProps, 'keyboardType' | 'inputMode'>

export type DecimalInputPlatform = 'android' | 'ios' | 'windows' | 'macos' | 'web'

/**
 * Android `numeric` / `decimal-pad` often reject comma before `onChangeText`.
 * Use `inputMode="decimal"` without a restrictive keyboardType so comma and dot
 * survive typing and paste; parsing still happens only on submit.
 */
export function getDecimalTextInputPropsForPlatform(
  os: DecimalInputPlatform,
): DecimalTextInputProps {
  if (os === 'android') {
    return { inputMode: 'decimal' }
  }

  return {
    inputMode: 'decimal',
    keyboardType: 'decimal-pad',
  }
}
