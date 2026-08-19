import { StyleSheet, Text, View } from 'react-native'
import {
  parseMetersInputToMillimeters,
  parseMetersInputToNonNegativeMillimeters,
} from '@/units/parse-decimal-input'
import { colors, radii, spacing, typography } from '@/theme'

interface WallPreviewOpening {
  width: string
  height: string
  offsetFromLeft: string
  offsetFromFloor: string
  kind: 'door' | 'window'
}

interface WallPreviewProps {
  wallWidth: string
  wallHeight: string
  opening: WallPreviewOpening
  label: string
  hint: string
}

const PREVIEW_WIDTH = 280
const PREVIEW_HEIGHT = 160

/**
 * Simple proportional wall sketch — decorative aid, not a CAD editor.
 * Uses parsed mm ratios when valid; falls back to centered placeholder.
 */
export function WallPreview({
  wallWidth,
  wallHeight,
  opening,
  label,
  hint,
}: WallPreviewProps) {
  const wallWidthMm = parseMetersInputToMillimeters(wallWidth)
  const wallHeightMm = parseMetersInputToMillimeters(wallHeight)
  const openingWidthMm = parseMetersInputToMillimeters(opening.width)
  const openingHeightMm = parseMetersInputToMillimeters(opening.height)
  const offsetXMm = parseMetersInputToNonNegativeMillimeters(opening.offsetFromLeft)
  const offsetYMm = opening.kind === 'door'
    ? { ok: true as const, valueMm: 0 }
    : parseMetersInputToNonNegativeMillimeters(opening.offsetFromFloor)

  const canRender = wallWidthMm.ok
    && wallHeightMm.ok
    && openingWidthMm.ok
    && openingHeightMm.ok
    && offsetXMm.ok
    && offsetYMm.ok
    && wallWidthMm.valueMm > 0
    && wallHeightMm.valueMm > 0

  const scale = canRender
    ? Math.min(
      PREVIEW_WIDTH / wallWidthMm.valueMm,
      PREVIEW_HEIGHT / wallHeightMm.valueMm,
    )
    : 1

  const wallBoxWidth = canRender ? wallWidthMm.valueMm * scale : PREVIEW_WIDTH
  const wallBoxHeight = canRender ? wallHeightMm.valueMm * scale : PREVIEW_HEIGHT

  const rawOpeningLeft = canRender ? offsetXMm.valueMm * scale : PREVIEW_WIDTH * 0.35
  const rawOpeningBottom = canRender ? offsetYMm.valueMm * scale : 0
  const openingLeft = Math.min(Math.max(0, rawOpeningLeft), wallBoxWidth)
  const openingBottom = Math.min(Math.max(0, rawOpeningBottom), wallBoxHeight)
  const rawOpeningWidth = canRender ? openingWidthMm.valueMm * scale : PREVIEW_WIDTH * 0.25
  const rawOpeningHeight = canRender ? openingHeightMm.valueMm * scale : PREVIEW_HEIGHT * 0.55
  const openingWidth = Math.min(Math.max(0, rawOpeningWidth), wallBoxWidth - openingLeft)
  const openingHeight = Math.min(
    Math.max(0, rawOpeningHeight),
    wallBoxHeight - openingBottom,
  )

  const openingTop = wallBoxHeight - openingBottom - openingHeight

  return (
    <View
      accessibilityLabel={label}
      accessibilityHint={hint}
      importantForAccessibility="yes"
      style={styles.container}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.canvas}>
        <View
          style={[
            styles.wall,
            { width: wallBoxWidth, height: wallBoxHeight },
          ]}
        >
          <View
            style={[
              styles.opening,
              {
                left: openingLeft,
                top: Math.max(0, openingTop),
                width: openingWidth,
                height: openingHeight,
              },
            ]}
          />
        </View>
      </View>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  label: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  canvas: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.md,
    minHeight: PREVIEW_HEIGHT + spacing.md * 2,
    justifyContent: 'center',
    padding: spacing.md,
  },
  wall: {
    backgroundColor: '#E8EDF5',
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    position: 'relative',
  },
  opening: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
    borderRadius: radii.sm,
    borderStyle: 'dashed',
    borderWidth: 1,
    position: 'absolute',
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
})
