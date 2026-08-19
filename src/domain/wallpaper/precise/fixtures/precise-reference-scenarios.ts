import type { PreciseWallpaperCalculationInput } from '../types'
import { DEFAULT_TRIM_ALLOWANCE } from '../../defaults'
import type { Millimeters } from '@/units'

const mm = (value: number) => value as Millimeters

/** Shared wide roll for precise reference scenarios. */
export const PRECISE_ROLL_WIDE = {
  widthMm: mm(1060),
  lengthMm: mm(10050),
} as const

/** P1 — single wall, no openings, free match. */
export const P1_INPUT: PreciseWallpaperCalculationInput = {
  walls: [{ id: 'wall-a', widthMm: mm(4000), heightMm: mm(2700) }],
  roll: PRECISE_ROLL_WIDE,
  trim: DEFAULT_TRIM_ALLOWANCE,
}

/** P1 expected — hand calculated with trim 50+50. */
export const P1_EXPECTED = {
  stripColumnCount: 4,
  requiredSegmentCount: 4,
  physicalCutLengthMm: 2800,
  totalMaterialMm: 11_200,
  plannedRolls: 2,
  lastColumnWidthMm: 820,
}

/** P2 — floor door, partial column overlap. */
export const P2_INPUT: PreciseWallpaperCalculationInput = {
  walls: [{ id: 'wall-a', widthMm: mm(4000), heightMm: mm(2700) }],
  openings: [{
    id: 'door-1',
    wallId: 'wall-a',
    offsetXMm: mm(1550),
    offsetFromFloorMm: mm(0),
    widthMm: mm(900),
    heightMm: mm(2100),
  }],
  roll: PRECISE_ROLL_WIDE,
  trim: DEFAULT_TRIM_ALLOWANCE,
}

export const P2_EXPECTED = {
  stripColumnCount: 4,
  requiredSegmentCount: 6,
  totalMaterialMm: 12_600,
  physicalCutLengthSavedMm: -1_400,
  coverageAreaSavedMm2: 1_890_000,
  plannedRolls: 2,
  baselinePlannedRolls: 2,
}

/** P3 — window fully inside wall. */
export const P3_INPUT: PreciseWallpaperCalculationInput = {
  walls: [{ id: 'wall-a', widthMm: mm(4000), heightMm: mm(2700) }],
  openings: [{
    id: 'window-1',
    wallId: 'wall-a',
    offsetXMm: mm(1400),
    offsetFromFloorMm: mm(900),
    widthMm: mm(1200),
    heightMm: mm(1200),
  }],
  roll: PRECISE_ROLL_WIDE,
  trim: DEFAULT_TRIM_ALLOWANCE,
}

/** P4 — material savings but same roll count (subset of P2 geometry). */
export const P4_EXPECTED = {
  coverageAreaSavedMm2: 1_890_000,
  plannedRolls: 2,
  baselinePlannedRolls: 2,
}

/** P5 — opening reduces the conservative planned roll count. */
export const P5_INPUT: PreciseWallpaperCalculationInput = {
  walls: [{ id: 'wall-tall', widthMm: mm(2120), heightMm: mm(9000) }],
  openings: [{
    id: 'door-full',
    wallId: 'wall-tall',
    offsetXMm: mm(0),
    offsetFromFloorMm: mm(0),
    widthMm: mm(2120),
    heightMm: mm(6000),
  }],
  roll: PRECISE_ROLL_WIDE,
  trim: { topMm: mm(0), bottomMm: mm(0) },
}

export const P5_EXPECTED = {
  stripColumnCount: 2,
  requiredSegmentCount: 2,
  segmentHeightMm: 3000,
  plannedRolls: 1,
  baselinePlannedRolls: 2,
}

/** P6 — mixed wall heights (Codex counterexample). */
export const P6_INPUT: PreciseWallpaperCalculationInput = {
  walls: [
    { id: 'w1', widthMm: mm(10_000), heightMm: mm(2500) },
    { id: 'w2', widthMm: mm(1000), heightMm: mm(5000) },
  ],
  roll: PRECISE_ROLL_WIDE,
  trim: DEFAULT_TRIM_ALLOWANCE,
}

export const P6_EXPECTED = {
  stripColumnCount: 11,
  w1Columns: 10,
  w2Columns: 1,
  w1CutLengthMm: 2600,
  w2CutLengthMm: 5100,
}

/** P7 — opening outside wall. */
export const P7_INPUT: PreciseWallpaperCalculationInput = {
  walls: [{ id: 'wall-a', widthMm: mm(4000), heightMm: mm(2700) }],
  openings: [{
    id: 'bad-window',
    wallId: 'wall-a',
    offsetXMm: mm(3000),
    offsetFromFloorMm: mm(0),
    widthMm: mm(1500),
    heightMm: mm(1200),
  }],
  roll: PRECISE_ROLL_WIDE,
  trim: DEFAULT_TRIM_ALLOWANCE,
}

/** P8 — overlapping openings. */
export const P8_INPUT: PreciseWallpaperCalculationInput = {
  walls: [{ id: 'wall-a', widthMm: mm(4000), heightMm: mm(2700) }],
  openings: [
    {
      id: 'open-a',
      wallId: 'wall-a',
      offsetXMm: mm(1000),
      offsetFromFloorMm: mm(500),
      widthMm: mm(800),
      heightMm: mm(1200),
    },
    {
      id: 'open-b',
      wallId: 'wall-a',
      offsetXMm: mm(1400),
      offsetFromFloorMm: mm(800),
      widthMm: mm(600),
      heightMm: mm(900),
    },
  ],
  roll: PRECISE_ROLL_WIDE,
  trim: DEFAULT_TRIM_ALLOWANCE,
}

/** P9 — exact strip-width boundary: 5300 / 1060 = 5 columns. */
export const P9_INPUT: PreciseWallpaperCalculationInput = {
  walls: [{ id: 'wall-a', widthMm: mm(5300), heightMm: mm(2700) }],
  roll: PRECISE_ROLL_WIDE,
  trim: DEFAULT_TRIM_ALLOWANCE,
}

export const P9_EXPECTED = {
  stripColumnCount: 5,
}

/** P10 — +1 mm adds a column. */
export const P10_INPUT: PreciseWallpaperCalculationInput = {
  walls: [{ id: 'wall-a', widthMm: mm(5301), heightMm: mm(2700) }],
  roll: PRECISE_ROLL_WIDE,
  trim: DEFAULT_TRIM_ALLOWANCE,
}

export const P10_EXPECTED = {
  stripColumnCount: 6,
}
