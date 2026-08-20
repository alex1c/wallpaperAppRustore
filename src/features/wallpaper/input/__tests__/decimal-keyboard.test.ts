import { getDecimalTextInputPropsForPlatform } from '@/features/wallpaper/input/decimal-text-input-props'

describe('getDecimalTextInputPropsForPlatform', () => {
  it('uses text keyboard on Android so locale comma reaches onChangeText', () => {
    // RN maps inputMode="decimal" → decimal-pad, which Android DigitsKeyListener
    // rejects commas for. Default/text keeps "," and "." in editable state.
    expect(getDecimalTextInputPropsForPlatform('android')).toEqual({
      keyboardType: 'default',
      inputMode: 'text',
    })
  })

  it('does not map Android to decimal-pad via inputMode', () => {
    const props = getDecimalTextInputPropsForPlatform('android')

    expect(props.inputMode).not.toBe('decimal')
    expect(props.keyboardType).not.toBe('decimal-pad')
    expect(props.keyboardType).not.toBe('numeric')
    expect(props.keyboardType).not.toBe('number-pad')
  })

  it('uses decimal-pad on iOS', () => {
    expect(getDecimalTextInputPropsForPlatform('ios')).toEqual({
      inputMode: 'decimal',
      keyboardType: 'decimal-pad',
    })
  })
})
