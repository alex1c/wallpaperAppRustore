import {
  parseCentimetersInputToMillimeters,
  parseMetersInputToMillimeters,
} from '@/units/parse-decimal-input'
import {
  DEFAULT_QUICK_FORM_VALUES,
  parseQuickCalculationForm,
} from '@/features/wallpaper/input/parse-quick-form'
import { calculateQuickWallpaper } from '@/domain/wallpaper'

describe('parseCentimetersInputToMillimeters', () => {
  it('converts integer centimeters to mm', () => {
    const result = parseCentimetersInputToMillimeters('106')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.valueMm).toBe(1060)
    }
  })

  it('converts narrow roll width 53 cm', () => {
    const result = parseCentimetersInputToMillimeters('53')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.valueMm).toBe(530)
    }
  })

  it('accepts decimal cm with comma', () => {
    const result = parseCentimetersInputToMillimeters('53,5')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.valueMm).toBe(535)
    }
  })
})

describe('parseQuickCalculationForm', () => {
  it('parses room comma decimals and custom roll cm + m length', () => {
    const outcome = parseQuickCalculationForm({
      ...DEFAULT_QUICK_FORM_VALUES,
      roomLength: '4,5',
      roomWidth: '3,25',
      roomHeight: '2,7',
      rollPresetId: 'custom',
      rollWidth: '106',
      rollLength: '10,05',
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.input.room.lengthMm).toBe(4500)
    expect(outcome.input.room.widthMm).toBe(3250)
    expect(outcome.input.room.heightMm).toBe(2700)
    expect(outcome.input.roll.widthMm).toBe(1060)
    expect(outcome.input.roll.lengthMm).toBe(10050)
  })

  it('uses preset roll dimensions without parsing custom fields', () => {
    const outcome = parseQuickCalculationForm({
      ...DEFAULT_QUICK_FORM_VALUES,
      rollPresetId: 'wide-1060',
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.input.roll.widthMm).toBe(1060)
    expect(outcome.input.roll.lengthMm).toBe(10050)
  })
})

describe('meter and cm adapters agree on wide roll width', () => {
  it('106 cm equals 1,06 m', () => {
    const fromCm = parseCentimetersInputToMillimeters('106')
    const fromM = parseMetersInputToMillimeters('1,06')

    expect(fromCm.ok).toBe(true)
    expect(fromM.ok).toBe(true)
    if (fromCm.ok && fromM.ok) {
      expect(fromCm.valueMm).toBe(fromM.valueMm)
    }
  })

  it('produces the same calculation for the wide preset and custom equivalent', () => {
    const preset = parseQuickCalculationForm({
      ...DEFAULT_QUICK_FORM_VALUES,
      rollPresetId: 'wide-1060',
    })
    const custom = parseQuickCalculationForm({
      ...DEFAULT_QUICK_FORM_VALUES,
      rollPresetId: 'custom',
      rollWidth: '106',
      rollLength: '10,05',
    })

    expect(preset.ok).toBe(true)
    expect(custom.ok).toBe(true)
    if (!preset.ok || !custom.ok) return

    const presetResult = calculateQuickWallpaper(preset.input)
    const customResult = calculateQuickWallpaper(custom.input)

    expect(presetResult.ok).toBe(true)
    expect(customResult.ok).toBe(true)
    if (!presetResult.ok || !customResult.ok) return

    expect(customResult.result).toEqual(presetResult.result)
  })
})
