import { MAX_LENGTH_MM } from './defaults'
import type { WallpaperCalculationError } from './errors'
import { isPatternMatch } from './types'
import type {
  PatternConfig,
  QuickWallpaperCalculationInput,
  RollSpec,
  TrimAllowance,
  Wall,
  WallpaperCalculationInput,
} from './types'

function structureError(message: string): { ok: false; error: WallpaperCalculationError } {
  return {
    ok: false,
    error: { code: 'INVALID_INPUT_STRUCTURE', message },
  }
}

function dimensionError(message: string): { ok: false; error: WallpaperCalculationError } {
  return {
    ok: false,
    error: { code: 'INVALID_DIMENSION', message },
  }
}

function overflowError(field: string): { ok: false; error: WallpaperCalculationError } {
  return {
    ok: false,
    error: {
      code: 'INPUT_OVERFLOW',
      message: `${field} exceeds maximum allowed length (${MAX_LENGTH_MM} mm).`,
    },
  }
}

/** Canonical length: positive safe integer (Product Spec integer mm). */
function isValidPositiveCanonicalLength(value: unknown): value is number {
  return (
    typeof value === 'number'
    && Number.isSafeInteger(value)
    && value > 0
  )
}

/** Trim allowance: non-negative safe integer. */
function isValidTrimLength(value: unknown): value is number {
  return (
    typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= 0
  )
}

function validateCanonicalLengthField(
  value: unknown,
  field: string,
  allowZero = false,
):
  | { ok: true; value: number }
  | { ok: false; error: WallpaperCalculationError } {
  const valid = allowZero ? isValidTrimLength(value) : isValidPositiveCanonicalLength(value)

  if (!valid) {
    if (typeof value === 'number' && !Number.isSafeInteger(value)) {
      return dimensionError(`${field} must be a safe integer millimeter value.`)
    }
    return dimensionError(`${field} must be a positive safe integer millimeter value.`)
  }

  const numericValue = value as number

  if (numericValue > MAX_LENGTH_MM) {
    return overflowError(field)
  }

  return { ok: true, value: numericValue }
}

/** Validates wall array — structure, ids, and uniform positive integer dimensions. */
export function validateWalls(
  walls: unknown,
):
  | { ok: true; walls: Wall[] }
  | { ok: false; error: WallpaperCalculationError } {
  if (walls === null || walls === undefined) {
    return structureError('walls is required.')
  }

  if (!Array.isArray(walls)) {
    return structureError('walls must be an array.')
  }

  if (walls.length === 0) {
    return dimensionError('At least one wall is required.')
  }

  const parsed: Wall[] = []
  const seenWallIds = new Set<string>()

  for (let index = 0; index < walls.length; index += 1) {
    const wall = walls[index]

    if (wall === null || typeof wall !== 'object') {
      return structureError(`walls[${index}] must be an object.`)
    }

    const { id, widthMm, heightMm } = wall as Partial<Wall>

    if (typeof id !== 'string' || id.trim().length === 0) {
      return structureError(`walls[${index}].id must be a non-empty string.`)
    }

    if (seenWallIds.has(id)) {
      return structureError(`Duplicate wall id: "${id}".`)
    }
    seenWallIds.add(id)

    const widthValidation = validateCanonicalLengthField(widthMm, `walls[${index}].widthMm`)
    if (!widthValidation.ok) {
      return widthValidation
    }

    const heightValidation = validateCanonicalLengthField(heightMm, `walls[${index}].heightMm`)
    if (!heightValidation.ok) {
      return heightValidation
    }

    parsed.push({
      id,
      widthMm: widthValidation.value as Wall['widthMm'],
      heightMm: heightValidation.value as Wall['heightMm'],
    })
  }

  return { ok: true, walls: parsed }
}

/** Rejects walls with differing heights — per-wall planner deferred to Phase 4. */
export function validateUniformWallHeights(
  walls: Wall[],
):
  | { ok: true; wallHeightMm: Wall['heightMm'] }
  | { ok: false; error: WallpaperCalculationError } {
  const firstHeight = walls[0].heightMm
  const mismatch = walls.find((wall) => wall.heightMm !== firstHeight)

  if (mismatch) {
    return {
      ok: false,
      error: {
        code: 'UNSUPPORTED_DIFFERENT_WALL_HEIGHTS',
        message:
          'Walls with different heights are not supported in Phase 2.1; use uniform height or wait for precise mode.',
      },
    }
  }

  return { ok: true, wallHeightMm: firstHeight }
}

/** Validates roll spec object and dimensions. */
export function validateRoll(
  roll: unknown,
):
  | { ok: true; roll: RollSpec }
  | { ok: false; error: WallpaperCalculationError } {
  if (roll === null || typeof roll !== 'object') {
    return structureError('roll is required and must be an object.')
  }

  const { widthMm, lengthMm } = roll as Partial<RollSpec>
  const widthValidation = validateCanonicalLengthField(widthMm, 'roll.widthMm')
  if (!widthValidation.ok) {
    return widthValidation
  }

  const lengthValidation = validateCanonicalLengthField(lengthMm, 'roll.lengthMm')
  if (!lengthValidation.ok) {
    return lengthValidation
  }

  return {
    ok: true,
    roll: {
      widthMm: widthValidation.value as RollSpec['widthMm'],
      lengthMm: lengthValidation.value as RollSpec['lengthMm'],
    },
  }
}

/** Validates trim allowance object — top/bottom may be zero. */
export function validateTrim(
  trim: unknown,
):
  | { ok: true; trim: TrimAllowance }
  | { ok: false; error: WallpaperCalculationError } {
  if (trim === null || typeof trim !== 'object') {
    return structureError('trim is required and must be an object.')
  }

  const { topMm, bottomMm } = trim as Partial<TrimAllowance>
  const topValidation = validateCanonicalLengthField(topMm, 'trim.topMm', true)
  if (!topValidation.ok) {
    return topValidation
  }

  const bottomValidation = validateCanonicalLengthField(bottomMm, 'trim.bottomMm', true)
  if (!bottomValidation.ok) {
    return bottomValidation
  }

  return {
    ok: true,
    trim: {
      topMm: topValidation.value as TrimAllowance['topMm'],
      bottomMm: bottomValidation.value as TrimAllowance['bottomMm'],
    },
  }
}

/** Validates corner allowance policy when provided. */
export function validateCornerAllowance(
  cornerAllowance: unknown,
):
  | { ok: true; cornerAllowance?: { totalCornerAllowanceMm: number } }
  | { ok: false; error: WallpaperCalculationError } {
  if (cornerAllowance === undefined) {
    return { ok: true }
  }

  if (cornerAllowance === null || typeof cornerAllowance !== 'object') {
    return structureError('cornerAllowance must be an object when provided.')
  }

  const { totalCornerAllowanceMm } = cornerAllowance as {
    totalCornerAllowanceMm?: unknown
  }

  const allowanceValidation = validateCanonicalLengthField(
    totalCornerAllowanceMm,
    'cornerAllowance.totalCornerAllowanceMm',
    true,
  )
  if (!allowanceValidation.ok) {
    return allowanceValidation
  }

  return {
    ok: true,
    cornerAllowance: {
      totalCornerAllowanceMm: allowanceValidation.value,
    },
  }
}

/** Exhaustive pattern validation — unknown values and ambiguous configs rejected. */
export function validatePattern(
  pattern: unknown,
):
  | { ok: true; pattern?: PatternConfig }
  | { ok: false; error: WallpaperCalculationError } {
  if (pattern === undefined) {
    return { ok: true }
  }

  if (pattern === null || typeof pattern !== 'object') {
    return structureError('pattern must be an object when provided.')
  }

  const { match, repeatMm, offsetMm } = pattern as Partial<PatternConfig>

  if (!isPatternMatch(match)) {
    return {
      ok: false,
      error: {
        code: 'INVALID_PATTERN_MATCH',
        message: `pattern.match must be one of: free, straight, half-drop. Received: ${String(match)}`,
      },
    }
  }

  if (match === 'half-drop') {
    return {
      ok: false,
      error: {
        code: 'UNSUPPORTED_PATTERN_MATCH',
        message:
          'Half-drop pattern matching is not implemented yet; use free or straight.',
      },
    }
  }

  if (match === 'straight') {
    const repeatValidation = validateCanonicalLengthField(
      repeatMm,
      'pattern.repeatMm',
    )
    if (!repeatValidation.ok) {
      return {
        ok: false,
        error: {
          code: 'INVALID_REPEAT',
          message: 'Straight match requires a positive integer pattern repeat in millimeters.',
        },
      }
    }

    if (offsetMm !== undefined && offsetMm !== 0) {
      const offsetValidation = validateCanonicalLengthField(offsetMm, 'pattern.offsetMm', true)
      if (!offsetValidation.ok) {
        return offsetValidation
      }

      if (offsetValidation.value !== 0) {
        return {
          ok: false,
          error: {
            code: 'INCONSISTENT_PATTERN_CONFIG',
            message:
              'Straight match with non-zero offset is not supported; use half-drop when implemented or remove offset.',
          },
        }
      }
    }

    return {
      ok: true,
      pattern: {
        match,
        repeatMm: repeatValidation.value as PatternConfig['repeatMm'],
      },
    }
  }

  if (repeatMm !== undefined) {
    const repeatValidation = validateCanonicalLengthField(repeatMm, 'pattern.repeatMm')
    if (!repeatValidation.ok) {
      return repeatValidation
    }
  }

  if (offsetMm !== undefined) {
    const offsetValidation = validateCanonicalLengthField(offsetMm, 'pattern.offsetMm', true)
    if (!offsetValidation.ok) {
      return offsetValidation
    }
  }

  return {
    ok: true,
    pattern: { match },
  }
}

/** Validates quick-mode room object. */
export function validateQuickRoom(
  room: unknown,
):
  | { ok: true; room: QuickWallpaperCalculationInput['room'] }
  | { ok: false; error: WallpaperCalculationError } {
  if (room === null || typeof room !== 'object') {
    return structureError('room is required and must be an object.')
  }

  const { lengthMm, widthMm, heightMm } = room as Partial<QuickWallpaperCalculationInput['room']>
  const fields: [unknown, string][] = [
    [lengthMm, 'room.lengthMm'],
    [widthMm, 'room.widthMm'],
    [heightMm, 'room.heightMm'],
  ]

  const parsed: Partial<QuickWallpaperCalculationInput['room']> = {}

  for (const [value, field] of fields) {
    const validation = validateCanonicalLengthField(value, field)
    if (!validation.ok) {
      return validation
    }
    if (field === 'room.lengthMm') parsed.lengthMm = validation.value as QuickWallpaperCalculationInput['room']['lengthMm']
    if (field === 'room.widthMm') parsed.widthMm = validation.value as QuickWallpaperCalculationInput['room']['widthMm']
    if (field === 'room.heightMm') parsed.heightMm = validation.value as QuickWallpaperCalculationInput['room']['heightMm']
  }

  return { ok: true, room: parsed as QuickWallpaperCalculationInput['room'] }
}

/** Validates count of owned identical full unused rolls. */
export function validateOwnedFullRolls(
  ownedFullRolls: unknown,
):
  | { ok: true }
  | { ok: false; error: WallpaperCalculationError } {
  if (
    typeof ownedFullRolls !== 'number'
    || !Number.isSafeInteger(ownedFullRolls)
    || ownedFullRolls < 0
  ) {
    return dimensionError('ownedFullRolls must be a non-negative safe integer.')
  }

  return { ok: true }
}

/** Validates minimumRolls for direct recommendation policy input. */
export function validateMinimumRollsForRecommendation(
  minimumRolls: unknown,
):
  | { ok: true; minimumRolls: number }
  | { ok: false; error: WallpaperCalculationError } {
  if (
    typeof minimumRolls !== 'number'
    || !Number.isSafeInteger(minimumRolls)
    || minimumRolls < 0
  ) {
    return dimensionError('minimumRolls must be a non-negative safe integer.')
  }

  return { ok: true, minimumRolls }
}

/** @deprecated Use validateOwnedFullRolls */
export function validateOwnedRolls(ownedRolls: number) {
  return validateOwnedFullRolls(ownedRolls)
}

/** Validates that at least one physical strip fits on a roll. */
export function validateStripFitsOnRoll(
  stripsPerFullRoll: number,
  rawStripLengthMm: number,
  rollLengthMm: number,
):
  | { ok: true }
  | { ok: false; error: WallpaperCalculationError } {
  if (stripsPerFullRoll < 1) {
    return {
      ok: false,
      error: {
        code: 'STRIP_LONGER_THAN_ROLL',
        message: `Physical strip length (${rawStripLengthMm} mm) exceeds roll length (${rollLengthMm} mm).`,
      },
    }
  }

  return { ok: true }
}

/** Full validation and normalization for shared engine input. */
export function validateCalculationInput(
  input: unknown,
):
  | { ok: true; input: WallpaperCalculationInput }
  | { ok: false; error: WallpaperCalculationError } {
  if (input === null || typeof input !== 'object') {
    return structureError('Calculation input must be an object.')
  }

  const raw = input as Partial<WallpaperCalculationInput>
  const wallsValidation = validateWalls(raw.walls)
  if (!wallsValidation.ok) {
    return wallsValidation
  }

  const uniformHeight = validateUniformWallHeights(wallsValidation.walls)
  if (!uniformHeight.ok) {
    return uniformHeight
  }

  const rollValidation = validateRoll(raw.roll)
  if (!rollValidation.ok) {
    return rollValidation
  }

  const trimValidation = validateTrim(raw.trim)
  if (!trimValidation.ok) {
    return trimValidation
  }

  const patternValidation = validatePattern(raw.pattern)
  if (!patternValidation.ok) {
    return patternValidation
  }

  const cornerValidation = validateCornerAllowance(raw.cornerAllowance)
  if (!cornerValidation.ok) {
    return cornerValidation
  }

  return {
    ok: true,
    input: {
      walls: wallsValidation.walls,
      roll: rollValidation.roll,
      trim: trimValidation.trim,
      pattern: patternValidation.pattern,
      cornerAllowance: cornerValidation.cornerAllowance as WallpaperCalculationInput['cornerAllowance'],
    },
  }
}

/** Full validation for quick-mode entry. */
export function validateQuickCalculationInput(
  input: unknown,
  trim: TrimAllowance,
  cornerAllowance: WallpaperCalculationInput['cornerAllowance'],
):
  | { ok: true; input: QuickWallpaperCalculationInput }
  | { ok: false; error: WallpaperCalculationError } {
  if (input === null || typeof input !== 'object') {
    return structureError('Calculation input must be an object.')
  }

  const raw = input as Partial<QuickWallpaperCalculationInput>
  const roomValidation = validateQuickRoom(raw.room)
  if (!roomValidation.ok) {
    return roomValidation
  }

  const rollValidation = validateRoll(raw.roll)
  if (!rollValidation.ok) {
    return rollValidation
  }

  const trimValidation = validateTrim(trim)
  if (!trimValidation.ok) {
    return trimValidation
  }

  const patternValidation = validatePattern(raw.pattern ?? undefined)
  if (!patternValidation.ok) {
    return patternValidation
  }

  const cornerValidation = validateCornerAllowance(
    raw.cornerAllowance ?? cornerAllowance,
  )
  if (!cornerValidation.ok) {
    return cornerValidation
  }

  return {
    ok: true,
    input: {
      room: roomValidation.room,
      roll: rollValidation.roll,
      trim: trimValidation.trim,
      pattern: patternValidation.pattern,
      cornerAllowance: cornerValidation.cornerAllowance as QuickWallpaperCalculationInput['cornerAllowance'],
    },
  }
}

/** @deprecated Use validateRoll + validateTrim separately */
export function validateRollAndTrim(roll: RollSpec, trim: TrimAllowance) {
  const rollValidation = validateRoll(roll)
  if (!rollValidation.ok) return rollValidation
  return validateTrim(trim)
}
