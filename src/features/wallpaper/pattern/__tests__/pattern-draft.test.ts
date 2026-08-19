import {
  changePatternMatchDraft,
  changePatternRepeatDraft,
} from '@/features/wallpaper/pattern/pattern-draft'

describe('pattern draft result invalidation', () => {
  it.each([
    ['straight', 'half-drop'],
    ['free', 'half-drop'],
    ['half-drop', 'straight'],
  ] as const)('invalidates a previous result for %s → %s', (from, to) => {
    const invalidateResult = jest.fn()

    const next = changePatternMatchDraft(
      { matchType: from, repeatCm: '64' },
      to,
      invalidateResult,
    )

    expect(next.matchType).toBe(to)
    expect(invalidateResult).toHaveBeenCalledTimes(1)
  })

  it('invalidates a previous straight result when repeat changes', () => {
    const invalidateResult = jest.fn()

    const next = changePatternRepeatDraft(
      { matchType: 'straight', repeatCm: '64' },
      '32',
      invalidateResult,
    )

    expect(next.repeatCm).toBe('32')
    expect(invalidateResult).toHaveBeenCalledTimes(1)
  })
})
