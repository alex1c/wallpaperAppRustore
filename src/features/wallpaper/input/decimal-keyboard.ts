import { Platform } from 'react-native'
import {
  getDecimalTextInputPropsForPlatform,
  type DecimalTextInputProps,
} from '@/features/wallpaper/input/decimal-text-input-props'

export type { DecimalTextInputProps, DecimalInputPlatform } from '@/features/wallpaper/input/decimal-text-input-props'
export { getDecimalTextInputPropsForPlatform } from '@/features/wallpaper/input/decimal-text-input-props'

export function getDecimalTextInputProps(): DecimalTextInputProps {
  return getDecimalTextInputPropsForPlatform(Platform.OS)
}
