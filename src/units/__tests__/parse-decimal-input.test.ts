import {
  METER_INPUT_MAX_DECIMAL_PLACES,
  normalizeDecimalInput,
  parseMetersInputToMillimeters,
  parseMetersInputToNonNegativeMillimeters,
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

  it('rejects incomplete trailing decimal separators without inventing a number', () => {
    // Intermediate editable text such as "2." / "2," must stay visible while typing;
    // submit-time parse rejects it instead of silently coercing to 2.
    expect(parseMetersInputToMillimeters('2.')).toEqual({
      ok: false,
      code: 'INVALID_FORMAT',
    })
    expect(parseMetersInputToMillimeters('2,')).toEqual({
      ok: false,
      code: 'INVALID_FORMAT',
    })
  })

  it('rejects mixed or doubled separators that look almost valid', () => {
    expect(parseMetersInputToMillimeters('3,,2')).toEqual({
      ok: false,
      code: 'INVALID_FORMAT',
    })
    expect(parseMetersInputToMillimeters('3..2')).toEqual({
      ok: false,
      code: 'INVALID_FORMAT',
    })
    expect(parseMetersInputToMillimeters('3,2.5')).toEqual({
      ok: false,
      code: 'INVALID_FORMAT',
    })
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

describe('parseMetersInputToNonNegativeMillimeters', () => {
  it.each(['0', '00', '0,0', '0.00', '0,000'])('accepts zero offset %s', (value) => {
    expect(parseMetersInputToNonNegativeMillimeters(value)).toEqual({
      ok: true,
      valueMm: 0,
    })
  })

  it('accepts positive comma and dot offsets', () => {
    expect(parseMetersInputToNonNegativeMillimeters('0,9')).toEqual({
      ok: true,
      valueMm: 900,
    })
    expect(parseMetersInputToNonNegativeMillimeters('1.06')).toEqual({
      ok: true,
      valueMm: 1060,
    })
  })

  it('rejects malformed and negative offsets', () => {
    expect(parseMetersInputToNonNegativeMillimeters('-1').ok).toBe(false)
    expect(parseMetersInputToNonNegativeMillimeters('0,,1').ok).toBe(false)
    expect(parseMetersInputToNonNegativeMillimeters('').ok).toBe(false)
  })
})

describe('normalizeDecimalInput', () => {
  it('converts comma to dot', () => {
    expect(normalizeDecimalInput('2,7')).toBe('2.7')
  })
})
