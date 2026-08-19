import type { WallpaperCalculationError } from '../errors'
import { isPatternMatch } from '../types'
import type { PatternConfig, Wall } from '../types'
import {
  validatePattern,
  validateRoll,
  validateTrim,
  validateWalls,
} from '../validation'
import type { PreciseOpening, PreciseWallpaperCalculationInput } from './types'

function openingError(
  code: import('../errors').WallpaperCalculationErrorCode,
  message: string,
): { ok: false; error: WallpaperCalculationError } {
  return { ok: false, error: { code, message } }
}

/** Returns true when two closed intervals [a,b) and [c,d) overlap with positive measure. */
function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd
}

/** Validates openings against their host walls — geometry, ids, no overlap. */
export function validatePreciseOpenings(
  walls: Wall[],
  openings: unknown,
):
  | { ok: true; openings: PreciseOpening[] }
  | { ok: false; error: WallpaperCalculationError } {
  if (openings === undefined || openings === null) {
    return { ok: true, openings: [] }
  }

  if (!Array.isArray(openings)) {
    return openingError('INVALID_INPUT_STRUCTURE', 'openings must be an array when provided.')
  }

  const wallById = new Map(walls.map((wall) => [wall.id, wall]))
  const parsed: PreciseOpening[] = []
  const seenOpeningIds = new Set<string>()

  for (let index = 0; index < openings.length; index += 1) {
    const entry = openings[index]

    if (entry === null || typeof entry !== 'object') {
      return openingError(
        'INVALID_INPUT_STRUCTURE',
        `openings[${index}] must be an object.`,
      )
    }

    const {
      id,
      wallId,
      offsetXMm,
      offsetFromFloorMm,
      widthMm,
      heightMm,
    } = entry as Partial<PreciseOpening>

    if (typeof id !== 'string' || id.trim().length === 0) {
      return openingError(
        'INVALID_OPENING_GEOMETRY',
        `openings[${index}].id must be a non-empty string.`,
      )
    }

    if (seenOpeningIds.has(id)) {
      return openingError('DUPLICATE_OPENING_ID', `Duplicate opening id: "${id}".`)
    }
    seenOpeningIds.add(id)

    if (typeof wallId !== 'string' || !wallById.has(wallId)) {
      return openingError(
        'INVALID_OPENING_GEOMETRY',
        `openings[${index}] references unknown wallId "${wallId}".`,
      )
    }

    const wall = wallById.get(wallId)!

    const numericFields = [
      { value: offsetXMm, name: 'offsetXMm', allowZero: true },
      { value: offsetFromFloorMm, name: 'offsetFromFloorMm', allowZero: true },
      { value: widthMm, name: 'widthMm' },
      { value: heightMm, name: 'heightMm' },
    ] as const

    for (const field of numericFields) {
      const allowZero = 'allowZero' in field && field.allowZero

      if (
        typeof field.value !== 'number'
        || !Number.isSafeInteger(field.value)
        || (allowZero ? field.value < 0 : field.value <= 0)
      ) {
        return openingError(
          'INVALID_OPENING_GEOMETRY',
          `openings[${index}].${field.name} must be a positive safe integer millimeter value.`,
        )
      }
    }

    const ox = offsetXMm as number
    const oy = offsetFromFloorMm as number
    const ow = widthMm as number
    const oh = heightMm as number

    if (ox + ow > wall.widthMm || oy + oh > wall.heightMm) {
      return openingError(
        'OPENING_OUTSIDE_WALL',
        `Opening "${id}" extends outside wall "${wallId}" bounds.`,
      )
    }

    parsed.push({
      id,
      wallId,
      offsetXMm: ox as PreciseOpening['offsetXMm'],
      offsetFromFloorMm: oy as PreciseOpening['offsetFromFloorMm'],
      widthMm: ow as PreciseOpening['widthMm'],
      heightMm: oh as PreciseOpening['heightMm'],
    })
  }

  const openingsByWall = new Map<string, PreciseOpening[]>()

  for (const opening of parsed) {
    const list = openingsByWall.get(opening.wallId) ?? []
    list.push(opening)
    openingsByWall.set(opening.wallId, list)
  }

  for (const [wallId, wallOpenings] of openingsByWall) {
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
          return openingError(
            'OVERLAPPING_OPENINGS_UNSUPPORTED',
            `Openings "${a.id}" and "${b.id}" overlap on wall "${wallId}".`,
          )
        }
      }
    }
  }

  return { ok: true, openings: parsed }
}

function validatePrecisePattern(
  pattern: unknown,
  openingCount: number,
):
  | { ok: true; pattern: PatternConfig | undefined; patternMatch: import('../types').PatternMatch }
  | { ok: false; error: WallpaperCalculationError } {
  if (pattern === undefined) {
    return { ok: true, pattern: undefined, patternMatch: 'free' }
  }

  if (pattern === null || typeof pattern !== 'object') {
    return openingError('INVALID_INPUT_STRUCTURE', 'pattern must be an object when provided.')
  }

  const { match } = pattern as PatternConfig

  if (!isPatternMatch(match)) {
    return openingError('INVALID_PATTERN_MATCH', `Unknown pattern match: "${String(match)}".`)
  }

  if (match === 'half-drop') {
    return openingError('UNSUPPORTED_PATTERN_MATCH', 'Half-drop is not supported in precise mode.')
  }

  if (match === 'straight' && openingCount > 0) {
    return openingError(
      'UNSUPPORTED_PRECISE_PATTERN_CONFIGURATION',
      'Straight pattern match with openings is not supported in Phase 4B1.',
    )
  }

  const sharedPatternValidation = validatePattern(pattern)
  if (!sharedPatternValidation.ok) return sharedPatternValidation

  return {
    ok: true,
    pattern: sharedPatternValidation.pattern,
    patternMatch: match,
  }
}

/** Validates full precise calculation input. Mixed wall heights are allowed. */
export function validatePreciseCalculationInput(
  input: unknown,
):
  | { ok: true; input: PreciseWallpaperCalculationInput }
  | { ok: false; error: WallpaperCalculationError } {
  if (input === null || typeof input !== 'object') {
    return openingError('INVALID_INPUT_STRUCTURE', 'Input must be an object.')
  }

  const candidate = input as Partial<PreciseWallpaperCalculationInput>
  const wallsValidation = validateWalls(candidate.walls)

  if (!wallsValidation.ok) {
    return wallsValidation
  }

  const openingsValidation = validatePreciseOpenings(
    wallsValidation.walls,
    candidate.openings,
  )

  if (!openingsValidation.ok) {
    return openingsValidation
  }

  const patternValidation = validatePrecisePattern(
    candidate.pattern,
    openingsValidation.openings.length,
  )

  if (!patternValidation.ok) {
    return patternValidation
  }

  const rollValidation = validateRoll(candidate.roll)
  if (!rollValidation.ok) return rollValidation

  const trimValidation = validateTrim(candidate.trim)
  if (!trimValidation.ok) return trimValidation

  return {
    ok: true,
    input: {
      walls: wallsValidation.walls,
      openings: openingsValidation.openings,
      roll: rollValidation.roll,
      trim: trimValidation.trim,
      pattern: patternValidation.pattern,
    },
  }
}
