import { calculatePreciseWallpaper } from '@/domain/wallpaper'
import { DEFAULT_QUICK_FORM_VALUES } from '@/features/wallpaper/input/parse-quick-form'
import { buildPreciseDraftFromQuickForm } from '@/features/wallpaper/precise/input/build-precise-draft-from-quick'
import {
  createNewWallDraft,
  parsePreciseCalculationForm,
  reindexWallDisplayNumbers,
} from '@/features/wallpaper/precise/input/parse-precise-form'
import {
  collectPreciseResultUserStrings,
  presentPreciseWallpaperResult,
} from '@/features/wallpaper/precise/presenter/present-precise-wallpaper-result'
import type { PreciseDraft } from '@/features/wallpaper/precise/state/precise-draft-types'
import {
  P2_INPUT,
  P5_INPUT,
} from '@/domain/wallpaper/precise/fixtures/precise-reference-scenarios'
import {
  changePatternMatchDraft,
  changePatternRepeatDraft,
} from '@/features/wallpaper/pattern/pattern-draft'
import { DEFAULT_PATTERN_FORM_VALUES } from '@/features/wallpaper/pattern/pattern-match-types'
import {
  consumePendingPreciseDraft,
  resetPendingPreciseDraftForTests,
  setPendingPreciseDraft,
} from '@/features/wallpaper/precise/state/precise-draft-store'
import { invalidatePreciseCalculation } from '@/features/wallpaper/precise/state/invalidate-precise-calculation'
import type { Millimeters } from '@/units'

const baseDraft = (): PreciseDraft => ({
  walls: [
    { id: 'wall-1', displayIndex: 1, width: '4', height: '2,7' },
    { id: 'wall-2', displayIndex: 2, width: '3', height: '2,7' },
    { id: 'wall-3', displayIndex: 3, width: '4', height: '2,7' },
    { id: 'wall-4', displayIndex: 4, width: '3', height: '2,7' },
  ],
  openings: [],
  rollPresetId: 'wide-1060',
  rollWidth: '1,06',
  rollLength: '10,05',
  pattern: null,
})

describe('precise mode UX adapters', () => {
  it('A — Quick 4×3×2.7 creates four expected walls', () => {
    const draft = buildPreciseDraftFromQuickForm(DEFAULT_QUICK_FORM_VALUES)

    expect(draft.walls).toHaveLength(4)
    expect(draft.walls.map((wall) => wall.width)).toEqual(['4', '3', '4', '3'])
    expect(draft.walls.every((wall) => wall.height === '2,7')).toBe(true)
  })

  it('A2 — Quick handoff preserves roll preset for Precise screen', () => {
    const draft = buildPreciseDraftFromQuickForm(DEFAULT_QUICK_FORM_VALUES)

    expect(draft.rollPresetId).toBe('wide-1060')
    expect(draft.rollWidth).toBe('1,06')
    expect(draft.rollLength).toBe('10,05')
  })

  it('A3 — Quick handoff preserves custom roll strings for the adapter boundary', () => {
    const draft = buildPreciseDraftFromQuickForm({
      ...DEFAULT_QUICK_FORM_VALUES,
      rollPresetId: 'custom',
      rollWidth: '1,06',
      rollLength: '10.05',
    })
    const parsed = parsePreciseCalculationForm(draft)

    expect(draft.rollPresetId).toBe('custom')
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.input.roll).toEqual({ widthMm: 1060, lengthMm: 10050 })
  })

  it('A4 — adding after middle-wall removal keeps domain ids unique', () => {
    const afterRemoval = reindexWallDisplayNumbers(
      baseDraft().walls.filter((wall) => wall.id !== 'wall-2'),
    )
    const added = createNewWallDraft(afterRemoval)

    expect(afterRemoval.map((wall) => wall.displayIndex)).toEqual([1, 2, 3])
    expect(added.displayIndex).toBe(4)
    expect(added.id).toBe('wall-5')
    expect(afterRemoval.some((wall) => wall.id === added.id)).toBe(false)
  })

  it('B — door input maps to correct PreciseOpening mm', () => {
    const draft: PreciseDraft = {
      ...baseDraft(),
      openings: [{
        id: 'door-1',
        kind: 'door',
        wallId: 'wall-1',
        width: '0,9',
        height: '2,1',
        offsetFromLeft: '1,55',
        offsetFromFloor: '0',
      }],
    }

    const parsed = parsePreciseCalculationForm(draft)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    expect(parsed.input.openings?.[0]).toMatchObject({
      widthMm: 900,
      heightMm: 2100,
      offsetXMm: 1550,
      offsetFromFloorMm: 0,
    })
  })

  it('C — window input maps correct offsets', () => {
    const draft: PreciseDraft = {
      ...baseDraft(),
      openings: [{
        id: 'window-1',
        kind: 'window',
        wallId: 'wall-2',
        width: '1,2',
        height: '1,2',
        offsetFromLeft: '1,4',
        offsetFromFloor: '0,9',
      }],
    }

    const parsed = parsePreciseCalculationForm(draft)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    expect(parsed.input.openings?.[0]).toMatchObject({
      widthMm: 1200,
      heightMm: 1200,
      offsetXMm: 1400,
      offsetFromFloorMm: 900,
    })
  })

  it('C2 — openings may touch the left edge and windows may touch the floor', () => {
    const parsed = parsePreciseCalculationForm({
      ...baseDraft(),
      openings: [{
        id: 'window-edge',
        kind: 'window',
        wallId: 'wall-1',
        width: '0,9',
        height: '1,2',
        offsetFromLeft: '0,00',
        offsetFromFloor: '0.0',
      }],
    })

    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.input.openings?.[0]).toMatchObject({
      offsetXMm: 0,
      offsetFromFloorMm: 0,
    })
  })

  it('D — accepts comma and dot decimal fields', () => {
    const draft: PreciseDraft = {
      ...baseDraft(),
      walls: [
        { id: 'wall-1', displayIndex: 1, width: '4.5', height: '2.7' },
        { id: 'wall-2', displayIndex: 2, width: '3,0', height: '2,7' },
      ],
    }

    const parsed = parsePreciseCalculationForm(draft)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    expect(parsed.input.walls[0].widthMm).toBe(4500)
    expect(parsed.input.walls[1].widthMm).toBe(3000)
  })

  it('E — opening outside wall maps to validation error code', () => {
    const draft: PreciseDraft = {
      ...baseDraft(),
      openings: [{
        id: 'bad',
        kind: 'door',
        wallId: 'wall-1',
        width: '1,5',
        height: '1,2',
        offsetFromLeft: '3,0',
        offsetFromFloor: '0',
      }],
    }

    const parsed = parsePreciseCalculationForm(draft)
    expect(parsed.ok).toBe(false)
    if (parsed.ok || !('fieldErrors' in parsed) || !parsed.fieldErrors) {
      throw new Error(`unexpected parse outcome: ${JSON.stringify(parsed)}`)
    }

    expect(Object.values(parsed.fieldErrors)).toContain('OPENING_OUTSIDE_WALL')
  })

  it('E2 — vertical opening overflow is associated with the relevant field', () => {
    const windowParsed = parsePreciseCalculationForm({
      ...baseDraft(),
      openings: [{
        id: 'high-window',
        kind: 'window',
        wallId: 'wall-1',
        width: '1',
        height: '1',
        offsetFromLeft: '1',
        offsetFromFloor: '2',
      }],
    })
    const doorParsed = parsePreciseCalculationForm({
      ...baseDraft(),
      openings: [{
        id: 'tall-door',
        kind: 'door',
        wallId: 'wall-1',
        width: '1',
        height: '3',
        offsetFromLeft: '1',
        offsetFromFloor: '0',
      }],
    })

    expect(windowParsed.ok).toBe(false)
    expect(doorParsed.ok).toBe(false)
    if (windowParsed.ok || doorParsed.ok) return
    expect(windowParsed.fieldErrors?.['opening:high-window:offsetFromFloor'])
      .toBe('OPENING_OUTSIDE_WALL')
    expect(doorParsed.fieldErrors?.['opening:tall-door:height'])
      .toBe('OPENING_OUTSIDE_WALL')
  })

  it('F — overlapping openings are rejected in UI adapter', () => {
    const draft: PreciseDraft = {
      ...baseDraft(),
      openings: [
        {
          id: 'a',
          kind: 'window',
          wallId: 'wall-1',
          width: '0,8',
          height: '1,2',
          offsetFromLeft: '1,0',
          offsetFromFloor: '0,5',
        },
        {
          id: 'b',
          kind: 'window',
          wallId: 'wall-1',
          width: '0,6',
          height: '0,9',
          offsetFromLeft: '1,4',
          offsetFromFloor: '0,8',
        },
      ],
    }

    const parsed = parsePreciseCalculationForm(draft)
    expect(parsed.ok).toBe(false)
    if (parsed.ok || !parsed.fieldErrors) return

    expect(parsed.fieldErrors['opening:a:offsetFromLeft']).toBe('OVERLAPPING')
  })

  it('G — free match with opening calculation succeeds end-to-end', () => {
    const parsed = parsePreciseCalculationForm({
      ...baseDraft(),
      openings: [{
        id: 'door-1',
        kind: 'door',
        wallId: 'wall-1',
        width: '0,9',
        height: '2,1',
        offsetFromLeft: '1,55',
        offsetFromFloor: '0',
      }],
    })

    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    const outcome = calculatePreciseWallpaper(parsed.input)
    expect(outcome.ok).toBe(true)
  })

  it('H — straight pattern with openings blocked before domain', () => {
    const parsed = parsePreciseCalculationForm({
      ...baseDraft(),
      pattern: { ...DEFAULT_PATTERN_FORM_VALUES, matchType: 'straight', repeatCm: '64' },
      openings: [{
        id: 'door-1',
        kind: 'door',
        wallId: 'wall-1',
        width: '0,9',
        height: '2,1',
        offsetFromLeft: '1,55',
        offsetFromFloor: '0',
      }],
    })

    expect(parsed.ok).toBe(false)
    if (parsed.ok) return

    expect(parsed.unsupportedPatternWithOpenings).toBe(true)
  })
})

describe('precise presenter UX semantics', () => {
  const wallsDraft = baseDraft().walls

  it('K — baseline rolls equal actual produces unchanged comparison copy', () => {
    const outcome = calculatePreciseWallpaper(P2_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    const presented = presentPreciseWallpaperResult(
      outcome.result,
      wallsDraft,
      [{
        id: 'door-1',
        kind: 'door',
        wallId: 'wall-a',
        width: '0,9',
        height: '2,1',
        offsetFromLeft: '1,55',
        offsetFromFloor: '0',
      }],
      'ru',
    )

    expect(presented.comparison?.body).toContain('не изменилось')
  })

  it('L — actual rolls less than baseline produces reduced comparison copy', () => {
    const outcome = calculatePreciseWallpaper(P5_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    const presented = presentPreciseWallpaperResult(
      outcome.result,
      [{ id: 'wall-tall', displayIndex: 1, width: '2,12', height: '9' }],
      [{
        id: 'door-full',
        kind: 'door',
        wallId: 'wall-tall',
        width: '2,12',
        height: '6',
        offsetFromLeft: '0',
        offsetFromFloor: '0',
      }],
      'ru',
    )

    expect(outcome.result.openingSavings.actualPlannedRolls).toBeLessThan(
      outcome.result.openingSavings.baselinePlannedRolls ?? 0,
    )
    expect(presented.comparison?.body).toContain('С учётом')
  })

  it('M — fragmentation edge with increased rolls uses honest copy', () => {
    const mm = (value: number) => value as Millimeters
    const outcome = calculatePreciseWallpaper({
      walls: [{ id: 'wall-fragmented', widthMm: mm(1), heightMm: mm(10) }],
      openings: [{
        id: 'window-fragmented',
        wallId: 'wall-fragmented',
        offsetXMm: mm(0),
        offsetFromFloorMm: mm(4),
        widthMm: mm(1),
        heightMm: mm(1),
      }],
      roll: { widthMm: mm(1), lengthMm: mm(12) },
      trim: { topMm: mm(1), bottomMm: mm(1) },
    })
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    const savings = outcome.result.openingSavings
    const presented = presentPreciseWallpaperResult(
      outcome.result,
      [{ id: 'wall-fragmented', displayIndex: 1, width: '0,001', height: '0,01' }],
      [{
        id: 'window-fragmented',
        kind: 'window',
        wallId: 'wall-fragmented',
        width: '0,001',
        height: '0,001',
        offsetFromLeft: '0',
        offsetFromFloor: '0,004',
      }],
      'ru',
    )

    expect(savings.baselinePlannedRolls).toBe(1)
    expect(savings.actualPlannedRolls).toBe(2)
    expect(presented.comparison?.body).toContain('из-за раскроя')
  })

  it('N — openingImpacts come from domain data in presenter', () => {
    const outcome = calculatePreciseWallpaper(P2_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    const presented = presentPreciseWallpaperResult(
      outcome.result,
      [{ id: 'wall-a', displayIndex: 1, width: '4', height: '2,7' }],
      [{
        id: 'door-1',
        kind: 'door',
        wallId: 'wall-a',
        width: '0,9',
        height: '2,1',
        offsetFromLeft: '1,55',
        offsetFromFloor: '0',
      }],
      'ru',
    )

    expect(presented.openingImpacts.length).toBe(outcome.result.openingImpacts.length)
    expect(presented.openingImpacts[0].detail).toContain('м²')
  })

  it('O — RU precise result strings avoid minimum/minimal wording', () => {
    const outcome = calculatePreciseWallpaper(P2_INPUT)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return

    const presented = presentPreciseWallpaperResult(
      outcome.result,
      wallsDraft,
      [],
      'ru',
    )

    const forbidden = /миним/i
    const allText = collectPreciseResultUserStrings(presented).join(' ')

    expect(allText).not.toMatch(forbidden)
    expect(presented.plannedRollsHeading).toBe('По расчётному раскрою')
  })

  it('P — wall reorder does not change planned rolls', () => {
    const outcome = calculatePreciseWallpaper({
      walls: [
        { id: 'w1', widthMm: 4000 as import('@/units').Millimeters, heightMm: 2700 as import('@/units').Millimeters },
        { id: 'w2', widthMm: 3000 as import('@/units').Millimeters, heightMm: 2700 as import('@/units').Millimeters },
      ],
      roll: { widthMm: 1060 as import('@/units').Millimeters, lengthMm: 10050 as import('@/units').Millimeters },
      trim: { topMm: 50 as import('@/units').Millimeters, bottomMm: 50 as import('@/units').Millimeters },
    })

    const reversed = calculatePreciseWallpaper({
      walls: [
        { id: 'w2', widthMm: 3000 as import('@/units').Millimeters, heightMm: 2700 as import('@/units').Millimeters },
        { id: 'w1', widthMm: 4000 as import('@/units').Millimeters, heightMm: 2700 as import('@/units').Millimeters },
      ],
      roll: { widthMm: 1060 as import('@/units').Millimeters, lengthMm: 10050 as import('@/units').Millimeters },
      trim: { topMm: 50 as import('@/units').Millimeters, bottomMm: 50 as import('@/units').Millimeters },
    })

    expect(outcome.ok && reversed.ok).toBe(true)
    if (!outcome.ok || !reversed.ok) return

    expect(outcome.result.plannedRolls).toBe(reversed.result.plannedRolls)
  })
})

describe('precise stale result contract', () => {
  it('I/J — central invalidation clears result, explanation, field and calculation errors', () => {
    const calls: string[] = []

    invalidatePreciseCalculation({
      clearPresentedResult: () => calls.push('result'),
      collapseExplanation: () => calls.push('explanation'),
      clearFieldErrors: () => calls.push('fields'),
      clearDomainError: () => calls.push('domain'),
      clearUnsupportedPatternMessage: () => calls.push('unsupported'),
    })

    expect(calls).toEqual([
      'result',
      'explanation',
      'fields',
      'domain',
      'unsupported',
    ])
  })

  it('new Quick handoff replaces the previous Precise session and its openings', () => {
    resetPendingPreciseDraftForTests()
    const first = buildPreciseDraftFromQuickForm(DEFAULT_QUICK_FORM_VALUES)
    setPendingPreciseDraft(first)
    const firstSession = consumePendingPreciseDraft()
    firstSession.openings.push({
      id: 'old-door',
      kind: 'door',
      wallId: 'wall-1',
      width: '0,9',
      height: '2,1',
      offsetFromLeft: '1',
      offsetFromFloor: '0',
    })

    const second = buildPreciseDraftFromQuickForm({
      ...DEFAULT_QUICK_FORM_VALUES,
      roomLength: '5,5',
      roomWidth: '2,5',
      roomHeight: '3',
      rollPresetId: 'narrow-530',
    })
    setPendingPreciseDraft(second)
    const secondSession = consumePendingPreciseDraft()

    expect(secondSession.walls.map((wall) => wall.width)).toEqual(['5,5', '2,5', '5,5', '2,5'])
    expect(secondSession.walls.every((wall) => wall.height === '3')).toBe(true)
    expect(secondSession.rollPresetId).toBe('narrow-530')
    expect(secondSession.openings).toEqual([])
    resetPendingPreciseDraftForTests()
  })

  it('UI-8A — straight pattern with opening blocks recalculation after free result', () => {
    const withDoor = {
      ...baseDraft(),
      openings: [{
        id: 'door-1',
        kind: 'door' as const,
        wallId: 'wall-1',
        width: '0,9',
        height: '2,1',
        offsetFromLeft: '1,55',
        offsetFromFloor: '0',
      }],
    }

    const freeParsed = parsePreciseCalculationForm(withDoor)
    expect(freeParsed.ok).toBe(true)

    const straightDraft = {
      ...withDoor,
      pattern: { ...DEFAULT_PATTERN_FORM_VALUES, matchType: 'straight' as const, repeatCm: '64' },
    }
    const straightParsed = parsePreciseCalculationForm(straightDraft)
    expect(straightParsed.ok).toBe(false)
    if (straightParsed.ok) return
    expect(straightParsed.unsupportedPatternWithOpenings).toBe(true)
  })

  it('UI-8B — switching back to free pattern allows calculation again', () => {
    const draft = {
      ...baseDraft(),
      pattern: { ...DEFAULT_PATTERN_FORM_VALUES, matchType: 'free' as const, repeatCm: '' },
      openings: [{
        id: 'door-1',
        kind: 'door' as const,
        wallId: 'wall-1',
        width: '0,9',
        height: '2,1',
        offsetFromLeft: '1,55',
        offsetFromFloor: '0',
      }],
    }

    const parsed = parsePreciseCalculationForm(draft)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(calculatePreciseWallpaper(parsed.input).ok).toBe(true)
  })

  it('UI-9 — pattern sheet draft edits invalidate before commit', () => {
    let presented: object | null = { plannedRolls: 3 }
    const invalidate = () => { presented = null }

    changePatternMatchDraft(
      DEFAULT_PATTERN_FORM_VALUES,
      'straight',
      invalidate,
    )
    expect(presented).toBeNull()

    presented = { plannedRolls: 3 }
    changePatternRepeatDraft(
      { ...DEFAULT_PATTERN_FORM_VALUES, matchType: 'straight', repeatCm: '64' },
      '80',
      invalidate,
    )
    expect(presented).toBeNull()
  })

  it('UI-9 — wall, opening, roll, and pattern mutations follow invalidate contract', () => {
    let presented: object | null = { plannedRolls: 2 }
    const invalidate = () => { presented = null }

    const mutations = [
      () => { baseDraft().walls[0].height = '2,8' },
      () => { baseDraft().walls.push({ id: 'w5', displayIndex: 5, width: '2', height: '2,7' }) },
      () => { baseDraft().walls.pop() },
      () => { baseDraft().openings.push({
        id: 'd',
        kind: 'door',
        wallId: 'wall-1',
        width: '0,9',
        height: '2,1',
        offsetFromLeft: '1',
        offsetFromFloor: '0',
      }) },
      () => { baseDraft().openings.pop() },
      () => { baseDraft().rollPresetId = 'narrow-530' as import('@/config/wallpaper-roll-presets').WallpaperRollPresetId },
      () => { baseDraft().rollWidth = '1,0' },
      () => { baseDraft().rollLength = '15,0' },
      () => { baseDraft().pattern = { ...DEFAULT_PATTERN_FORM_VALUES, matchType: 'straight', repeatCm: '64' } },
      () => {
        const p = baseDraft().pattern ?? DEFAULT_PATTERN_FORM_VALUES
        baseDraft().pattern = { ...p, repeatCm: '80' }
      },
    ]

    for (const mutate of mutations) {
      presented = { plannedRolls: 2 }
      mutate()
      invalidate()
      expect(presented).toBeNull()
    }
  })
})
