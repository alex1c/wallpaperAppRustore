import type { Millimeters } from '@/units'
import type { Wall } from '../types'
import type { PreciseOpening, RequiredVerticalSegment } from './types'
import {
  collectBreakpointsInRange,
  isCellInsideOpening,
} from './wall-columns'

interface RawSegmentRect {
  xStart: number
  xEnd: number
  yStart: number
  yEnd: number
}

/** Merges adjacent rectangles with the same X span and contiguous Y spans. */
function mergeSegmentRects(rects: RawSegmentRect[]): RawSegmentRect[] {
  if (rects.length === 0) {
    return []
  }

  const sorted = [...rects].sort((a, b) => {
    if (a.xStart !== b.xStart) return a.xStart - b.xStart
    if (a.xEnd !== b.xEnd) return a.xEnd - b.xEnd
    return a.yStart - b.yStart
  })

  const merged: RawSegmentRect[] = []
  let current = { ...sorted[0] }

  for (let index = 1; index < sorted.length; index += 1) {
    const next = sorted[index]

    if (
      next.xStart === current.xStart
      && next.xEnd === current.xEnd
      && next.yStart === current.yEnd
    ) {
      current.yEnd = next.yEnd
    } else {
      merged.push(current)
      current = { ...next }
    }
  }

  merged.push(current)
  return merged
}

/**
 * Decomposes one strip column into required vertical segments using a rectilinear
 * grid at opening boundaries. Avoids area subtraction and handles partial
 * horizontal opening overlap correctly.
 */
export function buildRequiredSegmentsForColumn(
  wall: Wall,
  column: { columnIndex: number; xStartMm: number; xEndMm: number; columnWidthMm: number },
  wallOpenings: readonly PreciseOpening[],
): RequiredVerticalSegment[] {
  const xBreaks = collectBreakpointsInRange(
    column.xStartMm,
    column.xEndMm,
    wallOpenings.flatMap((opening) => [
      opening.offsetXMm,
      opening.offsetXMm + opening.widthMm,
    ]),
  )

  const yBreaks = collectBreakpointsInRange(
    0,
    wall.heightMm,
    wallOpenings.flatMap((opening) => [
      opening.offsetFromFloorMm,
      opening.offsetFromFloorMm + opening.heightMm,
    ]),
  )

  const rawRects: RawSegmentRect[] = []

  for (let xi = 0; xi < xBreaks.length - 1; xi += 1) {
    const xStart = xBreaks[xi]
    const xEnd = xBreaks[xi + 1]

    for (let yi = 0; yi < yBreaks.length - 1; yi += 1) {
      const yStart = yBreaks[yi]
      const yEnd = yBreaks[yi + 1]

      if (yEnd <= yStart || xEnd <= xStart) {
        continue
      }

      if (!isCellInsideOpening(xStart, xEnd, yStart, yEnd, wallOpenings)) {
        rawRects.push({ xStart, xEnd, yStart, yEnd })
      }
    }
  }

  const merged = mergeSegmentRects(rawRects)

  return merged.map((rect, segmentIndex) => ({
    wallId: wall.id,
    columnIndex: column.columnIndex,
    segmentIndex,
    xStartMm: rect.xStart as Millimeters,
    xEndMm: rect.xEnd as Millimeters,
    yStartMm: rect.yStart as Millimeters,
    yEndMm: rect.yEnd as Millimeters,
    wallCoverageLengthMm: (rect.yEnd - rect.yStart) as Millimeters,
    columnWidthMm: (rect.xEnd - rect.xStart) as Millimeters,
  }))
}

/** Full-height baseline segment for one column (no openings). */
export function buildBaselineSegmentForColumn(
  wall: Wall,
  column: { columnIndex: number; xStartMm: number; xEndMm: number; columnWidthMm: number },
): RequiredVerticalSegment {
  return {
    wallId: wall.id,
    columnIndex: column.columnIndex,
    segmentIndex: 0,
    xStartMm: column.xStartMm as Millimeters,
    xEndMm: column.xEndMm as Millimeters,
    yStartMm: 0 as Millimeters,
    yEndMm: wall.heightMm,
    wallCoverageLengthMm: wall.heightMm,
    columnWidthMm: column.columnWidthMm as Millimeters,
  }
}

/** Adds trim allowance to wall coverage for a physical cut length. */
export function physicalCutLengthFromCoverage(
  wallCoverageLengthMm: Millimeters,
  topTrimMm: Millimeters,
  bottomTrimMm: Millimeters,
): Millimeters {
  return (wallCoverageLengthMm + topTrimMm + bottomTrimMm) as Millimeters
}

/** Width-weighted wall coverage area for one segment (mm²). */
export function segmentCoverageAreaMm2(segment: RequiredVerticalSegment): number {
  const width = segment.xEndMm - segment.xStartMm
  return width * segment.wallCoverageLengthMm
}

/** Sum of segment coverage areas. */
export function totalCoverageAreaMm2(segments: readonly RequiredVerticalSegment[]): number {
  return segments.reduce((sum, segment) => sum + segmentCoverageAreaMm2(segment), 0)
}

/** Sum of physical cut lengths for segments (roll linear consumption). */
export function totalPhysicalMaterialMm(
  segments: readonly RequiredVerticalSegment[],
  topTrimMm: Millimeters,
  bottomTrimMm: Millimeters,
): Millimeters {
  const total = segments.reduce(
    (sum, segment) => sum + physicalCutLengthFromCoverage(
      segment.wallCoverageLengthMm,
      topTrimMm,
      bottomTrimMm,
    ),
    0,
  )

  return total as Millimeters
}
