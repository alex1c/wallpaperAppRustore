import {
  parseMetersInputToMillimeters,
} from '@/units/parse-decimal-input'
import {
  DEFAULT_QUICK_FORM_VALUES,
  parseQuickCalculationForm,
} from '@/features/wallpaper/input/parse-quick-form'
import { calculateQuickWallpaper } from '@/domain/wallpaper'

describe('parseQuickCalculationForm', () => {
  it('defaults Quick room height to 2,7 m', () => {
    expect(DEFAULT_QUICK_FORM_VALUES.roomLength).toBe('4')
    expect(DEFAULT_QUICK_FORM_VALUES.roomWidth).toBe('3')
    expect(DEFAULT_QUICK_FORM_VALUES.roomHeight).toBe('2,7')

    const outcome = parseQuickCalculationForm(DEFAULT_QUICK_FORM_VALUES)

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.input.room.heightMm).toBe(2700)
  })

  it('parses room comma decimals and custom roll width/length in meters', () => {
    const outcome = parseQuickCalculationForm({
      ...DEFAULT_QUICK_FORM_VALUES,
      roomLength: '4,5',
      roomWidth: '3,25',
      roomHeight: '2,7',
      rollPresetId: 'custom',
      rollWidth: '1,06',
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

  it('accepts dot decimals for room and custom roll fields', () => {
    const outcome = parseQuickCalculationForm({
      ...DEFAULT_QUICK_FORM_VALUES,
      roomLength: '3.2',
      roomHeight: '2.7',
      rollPresetId: 'custom',
      rollWidth: '1.06',
      rollLength: '10.05',
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    expect(outcome.input.room.lengthMm).toBe(3200)
    expect(outcome.input.room.heightMm).toBe(2700)
    expect(outcome.input.roll.widthMm).toBe(1060)
    expect(outcome.input.roll.lengthMm).toBe(10050)
  })

  it('rejects malformed comma decimal input on submit', () => {
    const outcome = parseQuickCalculationForm({
      ...DEFAULT_QUICK_FORM_VALUES,
      roomLength: '3,,2',
    })

    expect(outcome.ok).toBe(false)
    if (outcome.ok || !outcome.fieldErrors) return

    expect(outcome.fieldErrors.roomLength).toBe('INVALID_FORMAT')
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

describe('custom wide roll in meters matches preset', () => {
  it('produces the same calculation for the wide preset and custom equivalent', () => {
    const preset = parseQuickCalculationForm({
      ...DEFAULT_QUICK_FORM_VALUES,
      rollPresetId: 'wide-1060',
    })
    const custom = parseQuickCalculationForm({
      ...DEFAULT_QUICK_FORM_VALUES,
      rollPresetId: 'custom',
      rollWidth: '1,06',
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

  it('1,06 m equals 1060 mm', () => {
    const result = parseMetersInputToMillimeters('1,06')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.valueMm).toBe(1060)
    }
  })
})
