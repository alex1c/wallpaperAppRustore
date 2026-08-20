import {
  filterDecimalInputText,
  filterIntegerInputText,
} from '@/units/decimal-input-text'

describe('filterDecimalInputText', () => {
  it('preserves comma while typing without converting to dot', () => {
    expect(filterDecimalInputText('3,')).toBe('3,')
    expect(filterDecimalInputText('3,25')).toBe('3,25')
  })

  it('preserves incomplete trailing separators such as 2. without mutation', () => {
    expect(filterDecimalInputText('2.')).toBe('2.')
    expect(filterDecimalInputText('2,')).toBe('2,')
  })

  it('preserves dot separator', () => {
    expect(filterDecimalInputText('4.5')).toBe('4.5')
  })

  it('keeps malformed intermediate text visible for correction', () => {
    expect(filterDecimalInputText('2,7.5')).toBe('2,7.5')
    expect(filterDecimalInputText('2,,7')).toBe('2,,7')
  })

  it('keeps pasted garbage for submit-time validation', () => {
    expect(filterDecimalInputText('a4,b5c')).toBe('a4,b5c')
  })
})

describe('filterIntegerInputText', () => {
  it('does not silently rewrite an invalid pasted width', () => {
    expect(filterIntegerInputText('106')).toBe('106')
    expect(filterIntegerInputText('10a6')).toBe('10a6')
  })
})
