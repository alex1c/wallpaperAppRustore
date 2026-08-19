import { Platform } from 'react-native'

/** Keyboard type that allows decimal entry on both Android and iOS. */
export type DecimalKeyboardType = 'decimal-pad' | 'numeric'

/**
 * Android `decimal-pad` often lacks comma key in RU locale.
 * `numeric` accepts pasted/transliterated comma input more reliably.
 */
export function getDecimalKeyboardType(): DecimalKeyboardType {
  return Platform.OS === 'android' ? 'numeric' : 'decimal-pad'
}
