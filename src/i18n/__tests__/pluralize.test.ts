import { pluralizeRu } from '@/i18n/pluralize'

describe('pluralizeRu', () => {
  it('pluralizes rolls correctly', () => {
    expect(pluralizeRu(1, 'рулон', 'рулона', 'рулонов')).toBe('рулон')
    expect(pluralizeRu(2, 'рулон', 'рулона', 'рулонов')).toBe('рулона')
    expect(pluralizeRu(5, 'рулон', 'рулона', 'рулонов')).toBe('рулонов')
    expect(pluralizeRu(11, 'рулон', 'рулона', 'рулонов')).toBe('рулонов')
    expect(pluralizeRu(21, 'рулон', 'рулона', 'рулонов')).toBe('рулон')
    expect(pluralizeRu(22, 'рулон', 'рулона', 'рулонов')).toBe('рулона')
    expect(pluralizeRu(25, 'рулон', 'рулона', 'рулонов')).toBe('рулонов')
  })

  it('pluralizes strips correctly', () => {
    expect(pluralizeRu(1, 'полотно', 'полотна', 'полотен')).toBe('полотно')
    expect(pluralizeRu(3, 'полотно', 'полотна', 'полотен')).toBe('полотна')
    expect(pluralizeRu(14, 'полотно', 'полотна', 'полотен')).toBe('полотен')
    expect(pluralizeRu(21, 'полотно', 'полотна', 'полотен')).toBe('полотно')
    expect(pluralizeRu(22, 'полотно', 'полотна', 'полотен')).toBe('полотна')
    expect(pluralizeRu(25, 'полотно', 'полотна', 'полотен')).toBe('полотен')
  })
})
