import type { Millimeters } from '@/units'
import type { Wall } from '../types'
import type { WallStripColumn } from './types'

/**
 * Builds vertical strip columns for one wall.
 * Each wall is planned independently — no perimeter corner merging (Phase 4B1).
 */
export function buildWallStripColumns(
  wall: Wall,
  rollWidthMm: Millimeters,
): WallStripColumn[] {
  const columnCount = Math.ceil(wall.widthMm / rollWidthMm)
  const columns: WallStripColumn[] = []

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    const xStart = columnIndex * rollWidthMm
    const xEnd = Math.min(wall.widthMm, xStart + rollWidthMm) as Millimeters

    columns.push({
      wallId: wall.id,
      columnIndex,
      xStartMm: xStart as Millimeters,
      xEndMm: xEnd,
      columnWidthMm: (xEnd - xStart) as Millimeters,
    })
  }

  return columns
}

/** Builds strip columns for all walls in input order. */
export function buildAllWallStripColumns(
  walls: Wall[],
  rollWidthMm: Millimeters,
): WallStripColumn[] {
  return walls.flatMap((wall) => buildWallStripColumns(wall, rollWidthMm))
}

/** @returns Sorted unique integer breakpoints in [rangeStart, rangeEnd]. */
export function collectBreakpointsInRange(
  rangeStart: number,
  rangeEnd: number,
  extraPoints: number[],
): number[] {
  const points = new Set<number>([rangeStart, rangeEnd])

  for (const point of extraPoints) {
    if (point > rangeStart && point < rangeEnd) {
      points.add(point)
    }
  }

  return [...points].sort((a, b) => a - b)
}

/** True when the cell rectangle lies entirely inside an opening. */
export function isCellInsideOpening(
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
  openings: readonly {
    offsetXMm: number
    widthMm: number
    offsetFromFloorMm: number
    heightMm: number
  }[],
): boolean {
  for (const opening of openings) {
    const oxEnd = opening.offsetXMm + opening.widthMm
    const oyEnd = opening.offsetFromFloorMm + opening.heightMm

    if (
      xStart >= opening.offsetXMm
      && xEnd <= oxEnd
      && yStart >= opening.offsetFromFloorMm
      && yEnd <= oyEnd
    ) {
      return true
    }
  }

  return false
}
