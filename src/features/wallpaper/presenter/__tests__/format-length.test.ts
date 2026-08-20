import {
  formatCentimetersTextForDisplay,
  formatDimensionTextForDisplay,
  formatMetersNumberFromMm,
} from '@/features/wallpaper/presenter/format-length'
import {
  formatOpeningSummaryLine,
  formatWallLabel,
} from '@/features/wallpaper/precise/presenter/present-precise-wallpaper-result'
import { setLocale } from '@/i18n'
import type { Millimeters } from '@/units'

const mm = (value: number) => value as Millimeters

describe('formatMetersNumberFromMm', () => {
  it('uses RU comma and keeps integers without trailing zeros', () => {
    expect(formatMetersNumberFromMm(mm(800), 'ru')).toBe('0,8')
    expect(formatMetersNumberFromMm(mm(1500), 'ru')).toBe('1,5')
    expect(formatMetersNumberFromMm(mm(2000), 'ru')).toBe('2')
  })

  it('uses EN dot and keeps integers without trailing zeros', () => {
    expect(formatMetersNumberFromMm(mm(800), 'en')).toBe('0.8')
    expect(formatMetersNumberFromMm(mm(1500), 'en')).toBe('1.5')
    expect(formatMetersNumberFromMm(mm(2000), 'en')).toBe('2')
  })
})

describe('formatDimensionTextForDisplay', () => {
  it('normalizes editable meter text to locale display separators', () => {
    expect(formatDimensionTextForDisplay('0.8', 'ru')).toBe('0,8')
    expect(formatDimensionTextForDisplay('0,8', 'ru')).toBe('0,8')
    expect(formatDimensionTextForDisplay('1.5', 'ru')).toBe('1,5')
    expect(formatDimensionTextForDisplay('2', 'ru')).toBe('2')

    expect(formatDimensionTextForDisplay('0.8', 'en')).toBe('0.8')
    expect(formatDimensionTextForDisplay('0,8', 'en')).toBe('0.8')
    expect(formatDimensionTextForDisplay('1.5', 'en')).toBe('1.5')
    expect(formatDimensionTextForDisplay('2', 'en')).toBe('2')
  })

  it('leaves malformed editable text unchanged', () => {
    expect(formatDimensionTextForDisplay('3,,2', 'ru')).toBe('3,,2')
    expect(formatDimensionTextForDisplay('2.', 'en')).toBe('2.')
  })
})

describe('formatCentimetersTextForDisplay', () => {
  it('formats pattern repeat text with locale separators', () => {
    expect(formatCentimetersTextForDisplay('64.1', 'ru')).toBe('64,1')
    expect(formatCentimetersTextForDisplay('64,1', 'en')).toBe('64.1')
  })
})

describe('formatOpeningSummaryLine', () => {
  beforeEach(() => {
    setLocale('ru')
  })

  it('formats RU opening summaries with comma decimals', () => {
    const wallOne = formatWallLabel(
      { id: 'wall-1', displayIndex: 1, width: '4', height: '2,7' },
      'ru',
    )
    const wallTwo = formatWallLabel(
      { id: 'wall-2', displayIndex: 2, width: '3', height: '2,7' },
      'ru',
    )

    expect(formatOpeningSummaryLine(wallOne, '0.8', '2', 'ru')).toBe(
      'Стена 1 · 0,8 × 2 м',
    )
    expect(formatOpeningSummaryLine(wallTwo, '1.5', '1.5', 'ru')).toBe(
      'Стена 2 · 1,5 × 1,5 м',
    )
  })
})
