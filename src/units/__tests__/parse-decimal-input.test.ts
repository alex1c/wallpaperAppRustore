import {
  METER_INPUT_MAX_DECIMAL_PLACES,
  normalizeDecimalInput,
  parseMetersInputToMillimeters,
} from '@/units/parse-decimal-input'

describe('parseMetersInputToMillimeters', () => {
  it('accepts comma decimal separator', () => {
    const result = parseMetersInputToMillimeters('2,7')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.valueMm).toBe(2700)
    }
  })

  it('accepts dot decimal separator', () => {
    const result = parseMetersInputToMillimeters('2.7')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.valueMm).toBe(2700)
    }
  })

  it('accepts trailing decimal zeros', () => {
    const result = parseMetersInputToMillimeters('2,70')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.valueMm).toBe(2700)
    }
  })

  it('parses narrow roll width preset value', () => {
    const result = parseMetersInputToMillimeters('0,53')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.valueMm).toBe(530)
    }
  })

  it('parses wide roll width preset value', () => {
    const result = parseMetersInputToMillimeters('1,06')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.valueMm).toBe(1060)
    }
  })

  it('trims surrounding whitespace', () => {
    const result = parseMetersInputToMillimeters('  3,00  ')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.valueMm).toBe(3000)
    }
  })

  it('rejects invalid text', () => {
    expect(parseMetersInputToMillimeters('abc').ok).toBe(false)
    expect(parseMetersInputToMillimeters('2,7,1').ok).toBe(false)
    expect(parseMetersInputToMillimeters('2 7').ok).toBe(false)
  })

  it('rejects empty input', () => {
    expect(parseMetersInputToMillimeters('').ok).toBe(false)
    expect(parseMetersInputToMillimeters('   ').ok).toBe(false)
  })

  it('rejects zero', () => {
    expect(parseMetersInputToMillimeters('0').ok).toBe(false)
    expect(parseMetersInputToMillimeters('0,0').ok).toBe(false)
  })

  it('rejects negative values', () => {
    expect(parseMetersInputToMillimeters('-2,7').ok).toBe(false)
  })

  it('rounds extra precision to nearest millimeter', () => {
    const result = parseMetersInputToMillimeters('2,7004')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.valueMm).toBe(2700)
    }
  })

  it('documents max decimal places constant', () => {
    expect(METER_INPUT_MAX_DECIMAL_PLACES).toBe(3)
  })
})

describe('normalizeDecimalInput', () => {
  it('converts comma to dot', () => {
    expect(normalizeDecimalInput('2,7')).toBe('2.7')
  })
})
