import {
  WALLPAPER_ROLL_PRESETS,
} from '@/config/wallpaper-roll-presets'
import { DEFAULT_TRIM_ALLOWANCE } from '@/domain/wallpaper'
import type {
  PatternConfig,
  PreciseWallpaperCalculationInput,
} from '@/domain/wallpaper'
import type { Millimeters } from '@/units'
import {
  parseMetersInputToMillimeters,
  parseMetersInputToNonNegativeMillimeters,
  type ParseDecimalInputErrorCode,
} from '@/units/parse-decimal-input'
import { parsePatternForm } from '@/features/wallpaper/input/parse-pattern-form'
import type { PatternFormValues } from '@/features/wallpaper/pattern/pattern-match-types'
import type {
  PreciseDraft,
  PreciseOpeningDraft,
  PreciseWallDraft,
} from '../state/precise-draft-types'

export type PreciseWallFieldKey = `wall:${string}:width` | `wall:${string}:height`
export type PreciseOpeningFieldKey =
  | `opening:${string}:width`
  | `opening:${string}:height`
  | `opening:${string}:offsetFromLeft`
  | `opening:${string}:offsetFromFloor`

export type PreciseFormFieldKey =
  | PreciseWallFieldKey
  | PreciseOpeningFieldKey
  | 'rollWidth'
  | 'rollLength'

export type PreciseFormFieldErrors = Partial<
  Record<PreciseFormFieldKey, ParseDecimalInputErrorCode | 'OPENING_OUTSIDE_WALL' | 'OVERLAPPING'>
>

export type ParsePreciseFormOutcome =
  | { ok: true; input: PreciseWallpaperCalculationInput }
  | {
    ok: false
    fieldErrors: PreciseFormFieldErrors
    generalError?: never
    unsupportedPatternWithOpenings?: never
  }
  | {
    ok: false
    unsupportedPatternWithOpenings: true
    fieldErrors?: never
    generalError?: never
  }
  | {
    ok: false
    generalError: 'NO_ROLL_DIMENSIONS' | 'PATTERN_PARSE_FAILED'
    fieldErrors?: never
    unsupportedPatternWithOpenings?: never
  }

function parseWallDimension(
  value: string,
  fieldKey: PreciseFormFieldKey,
  fieldErrors: PreciseFormFieldErrors,
): Millimeters | null {
  const parsed = parseMetersInputToMillimeters(value)

  if (!parsed.ok) {
    fieldErrors[fieldKey] = parsed.code
    return null
  }

  return parsed.valueMm
}

function parseOpeningDimensions(
  opening: PreciseOpeningDraft,
  fieldErrors: PreciseFormFieldErrors,
): {
  widthMm: Millimeters
  heightMm: Millimeters
  offsetXMm: Millimeters
  offsetFromFloorMm: Millimeters
} | null {
  const widthKey = `opening:${opening.id}:width` as const
  const heightKey = `opening:${opening.id}:height` as const
  const offsetKey = `opening:${opening.id}:offsetFromLeft` as const
  const floorKey = `opening:${opening.id}:offsetFromFloor` as const

  const widthMm = parseWallDimension(opening.width, widthKey, fieldErrors)
  const heightMm = parseWallDimension(opening.height, heightKey, fieldErrors)
  const parsedOffsetX = parseMetersInputToNonNegativeMillimeters(opening.offsetFromLeft)
  const offsetXMm = parsedOffsetX.ok ? parsedOffsetX.valueMm : null

  if (!parsedOffsetX.ok) {
    fieldErrors[offsetKey] = parsedOffsetX.code
  }

  let offsetFromFloorMm: Millimeters | null

  if (opening.kind === 'door') {
    offsetFromFloorMm = 0 as Millimeters
  } else {
    const parsedFloorOffset = parseMetersInputToNonNegativeMillimeters(
      opening.offsetFromFloor,
    )

    if (parsedFloorOffset.ok) {
      offsetFromFloorMm = parsedFloorOffset.valueMm
    } else {
      fieldErrors[floorKey] = parsedFloorOffset.code
      offsetFromFloorMm = null
    }
  }

  if (
    widthMm === null
    || heightMm === null
    || offsetXMm === null
    || offsetFromFloorMm === null
  ) {
    return null
  }

  return { widthMm, heightMm, offsetXMm, offsetFromFloorMm }
}

function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd
}

/** UI-level geometry checks before domain call — mirrors precise validation messages. */
function validateOpeningGeometry(
  walls: readonly { id: string; widthMm: Millimeters; heightMm: Millimeters }[],
  openings: readonly {
    id: string
    wallId: string
    widthMm: Millimeters
    heightMm: Millimeters
    offsetXMm: Millimeters
    offsetFromFloorMm: Millimeters
  }[],
  fieldErrors: PreciseFormFieldErrors,
): boolean {
  const wallById = new Map(walls.map((wall) => [wall.id, wall]))
  let valid = true

  for (const opening of openings) {
    const wall = wallById.get(opening.wallId)

    if (!wall) {
      continue
    }

    if (opening.offsetXMm + opening.widthMm > wall.widthMm) {
      fieldErrors[`opening:${opening.id}:offsetFromLeft`] = 'OPENING_OUTSIDE_WALL'
      valid = false
    }

    if (opening.offsetFromFloorMm + opening.heightMm > wall.heightMm) {
      const verticalField = opening.offsetFromFloorMm === 0
        ? `opening:${opening.id}:height` as const
        : `opening:${opening.id}:offsetFromFloor` as const
      fieldErrors[verticalField] = 'OPENING_OUTSIDE_WALL'
      valid = false
    } else if (opening.heightMm > wall.heightMm) {
      fieldErrors[`opening:${opening.id}:height`] = 'OPENING_OUTSIDE_WALL'
      valid = false
    }
  }

  const openingsByWall = new Map<string, (typeof openings)[number][]>()

  for (const opening of openings) {
    const list = openingsByWall.get(opening.wallId) ?? []
    list.push(opening)
    openingsByWall.set(opening.wallId, list)
  }

  for (const wallOpenings of openingsByWall.values()) {
    for (let i = 0; i < wallOpenings.length; i += 1) {
      for (let j = i + 1; j < wallOpenings.length; j += 1) {
        const a = wallOpenings[i]
        const b = wallOpenings[j]

        const xOverlap = intervalsOverlap(
          a.offsetXMm,
          a.offsetXMm + a.widthMm,
          b.offsetXMm,
          b.offsetXMm + b.widthMm,
        )
        const yOverlap = intervalsOverlap(
          a.offsetFromFloorMm,
          a.offsetFromFloorMm + a.heightMm,
          b.offsetFromFloorMm,
          b.offsetFromFloorMm + b.heightMm,
        )

        if (xOverlap && yOverlap) {
          fieldErrors[`opening:${a.id}:offsetFromLeft`] = 'OVERLAPPING'
          fieldErrors[`opening:${b.id}:offsetFromLeft`] = 'OVERLAPPING'
          valid = false
        }
      }
    }
  }

  return valid
}

function resolveRollDimensions(draft: PreciseDraft): {
  widthMm: Millimeters
  lengthMm: Millimeters
} | null {
  if (draft.rollPresetId === 'custom') {
    const width = parseMetersInputToMillimeters(draft.rollWidth)
    const length = parseMetersInputToMillimeters(draft.rollLength)

    if (!width.ok || !length.ok) {
      return null
    }

    return { widthMm: width.valueMm, lengthMm: length.valueMm }
  }

  const preset = WALLPAPER_ROLL_PRESETS.find((entry) => entry.id === draft.rollPresetId)

  if (!preset) {
    return null
  }

  return { widthMm: preset.widthMm, lengthMm: preset.lengthMm }
}

function parsePattern(
  pattern: PatternFormValues | null,
): PatternConfig | undefined | 'HALF_DROP' | 'INVALID' {
  if (pattern === null) {
    return undefined
  }

  const parsed = parsePatternForm(pattern)

  if (!parsed.ok) {
    if ('halfDropDeferred' in parsed) {
      return 'HALF_DROP'
    }

    return 'INVALID'
  }

  return parsed.pattern
}

/**
 * Parses Precise Mode UI draft into domain input (integer mm).
 * Blocks straight + openings before calling the domain engine.
 */
export function parsePreciseCalculationForm(
  draft: PreciseDraft,
): ParsePreciseFormOutcome {
  const fieldErrors: PreciseFormFieldErrors = {}
  const parsedWalls: { id: string; widthMm: Millimeters; heightMm: Millimeters }[] = []

  for (const wall of draft.walls) {
    const widthMm = parseWallDimension(
      wall.width,
      `wall:${wall.id}:width`,
      fieldErrors,
    )
    const heightMm = parseWallDimension(
      wall.height,
      `wall:${wall.id}:height`,
      fieldErrors,
    )

    if (widthMm !== null && heightMm !== null) {
      parsedWalls.push({ id: wall.id, widthMm, heightMm })
    }
  }

  const parsedOpenings: {
    id: string
    wallId: string
    widthMm: Millimeters
    heightMm: Millimeters
    offsetXMm: Millimeters
    offsetFromFloorMm: Millimeters
  }[] = []

  for (const opening of draft.openings) {
    const dims = parseOpeningDimensions(opening, fieldErrors)

    if (dims !== null) {
      parsedOpenings.push({
        id: opening.id,
        wallId: opening.wallId,
        ...dims,
      })
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors }
  }

  if (!validateOpeningGeometry(parsedWalls, parsedOpenings, fieldErrors)) {
    return { ok: false, fieldErrors }
  }

  const roll = resolveRollDimensions(draft)

  if (roll === null) {
    return { ok: false, generalError: 'NO_ROLL_DIMENSIONS' }
  }

  const patternResult = parsePattern(draft.pattern)

  if (patternResult === 'HALF_DROP' || patternResult === 'INVALID') {
    return { ok: false, generalError: 'PATTERN_PARSE_FAILED' }
  }

  const hasOpenings = parsedOpenings.length > 0
  const isStraight = draft.pattern?.matchType === 'straight'

  if (isStraight && hasOpenings) {
    return { ok: false, unsupportedPatternWithOpenings: true }
  }

  return {
    ok: true,
    input: {
      walls: parsedWalls.map((wall) => ({
        id: wall.id,
        widthMm: wall.widthMm,
        heightMm: wall.heightMm,
      })),
      openings: parsedOpenings.map((opening) => ({
        id: opening.id,
        wallId: opening.wallId,
        offsetXMm: opening.offsetXMm,
        offsetFromFloorMm: opening.offsetFromFloorMm,
        widthMm: opening.widthMm,
        heightMm: opening.heightMm,
      })),
      roll,
      trim: DEFAULT_TRIM_ALLOWANCE,
      pattern: patternResult,
    },
  }
}

/** Creates the next wall id/display index when user adds a wall. */
export function createNewWallDraft(existingWalls: readonly PreciseWallDraft[]): PreciseWallDraft {
  const maxIndex = existingWalls.reduce(
    (max, wall) => Math.max(max, wall.displayIndex),
    0,
  )
  const nextDisplayIndex = maxIndex + 1
  const existingIds = new Set(existingWalls.map((wall) => wall.id))
  let nextIdIndex = existingWalls.reduce((max, wall) => {
    const match = /^wall-(\d+)$/.exec(wall.id)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0) + 1

  while (existingIds.has(`wall-${nextIdIndex}`)) {
    nextIdIndex += 1
  }

  return {
    id: `wall-${nextIdIndex}`,
    displayIndex: nextDisplayIndex,
    width: '',
    height: existingWalls[0]?.height ?? '2,7',
  }
}

/** Creates a blank opening draft attached to the first wall by default. */
export function createNewOpeningDraft(
  kind: PreciseOpeningDraft['kind'],
  walls: readonly PreciseWallDraft[],
): PreciseOpeningDraft {
  const wallId = walls[0]?.id ?? 'wall-1'
  const id = `${kind}-${Date.now()}`

  return {
    id,
    kind,
    wallId,
    width: '',
    height: '',
    offsetFromLeft: '',
    offsetFromFloor: kind === 'window' ? '' : '0',
  }
}

/** Reindexes display numbers after wall removal — keeps labels contiguous. */
export function reindexWallDisplayNumbers(
  walls: PreciseWallDraft[],
): PreciseWallDraft[] {
  return walls.map((wall, index) => ({
    ...wall,
    displayIndex: index + 1,
  }))
}

export type { PreciseWallDraft }
