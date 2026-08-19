import { getDecimalTextInputPropsForPlatform } from '@/features/wallpaper/input/decimal-text-input-props'

describe('getDecimalTextInputPropsForPlatform', () => {
  it('avoids restrictive keyboardType on Android so comma survives onChangeText', () => {
    expect(getDecimalTextInputPropsForPlatform('android')).toEqual({
      inputMode: 'decimal',
    })
  })

  it('uses decimal-pad on iOS', () => {
    expect(getDecimalTextInputPropsForPlatform('ios')).toEqual({
      inputMode: 'decimal',
      keyboardType: 'decimal-pad',
    })
  })
})
