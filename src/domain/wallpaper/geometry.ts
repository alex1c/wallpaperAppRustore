import type { Millimeters } from '@/units'
import type { QuickRoomInput, Wall } from './types'

/**
 * Converts a rectangular quick-mode room into four walls sharing one height.
 * Quick and Precise modes use the same downstream engine (uniform height only).
 */
export function normalizeQuickRoomToWalls(room: QuickRoomInput): Wall[] {
  return [
    { id: 'wall-north', widthMm: room.lengthMm, heightMm: room.heightMm },
    { id: 'wall-east', widthMm: room.widthMm, heightMm: room.heightMm },
    { id: 'wall-south', widthMm: room.lengthMm, heightMm: room.heightMm },
    { id: 'wall-west', widthMm: room.widthMm, heightMm: room.heightMm },
  ]
}

/** Sum of wall widths — perimeter for a closed rectangular room. */
export function calculateTotalWallWidthMm(walls: Wall[]): Millimeters {
  const total = walls.reduce((sum, wall) => sum + wall.widthMm, 0)
  return total as Millimeters
}

/** Strips needed to cover adjusted horizontal run at the given roll width. */
export function calculateRequiredStrips(
  adjustedWallWidthMm: Millimeters,
  rollWidthMm: Millimeters,
): number {
  return Math.ceil(adjustedWallWidthMm / rollWidthMm)
}

/**
 * Returns the shared wall height when all walls match; null if heights differ.
 * Phase 2.1 rejects differing heights — no silent max(height) fallback.
 */
export function getUniformWallHeightMm(walls: Wall[]): Millimeters | null {
  if (walls.length === 0) {
    return null
  }

  const firstHeight = walls[0].heightMm
  const allMatch = walls.every((wall) => wall.heightMm === firstHeight)

  return allMatch ? firstHeight : null
}

/** @deprecated Use calculateTotalWallWidthMm */
export function calculatePerimeterMm(walls: Wall[]): Millimeters {
  return calculateTotalWallWidthMm(walls)
}

/** @deprecated Use getUniformWallHeightMm — silent max is removed in Phase 2.1 */
export function getMaxWallHeightMm(walls: Wall[]): Millimeters {
  return Math.max(...walls.map((wall) => wall.heightMm)) as Millimeters
}
