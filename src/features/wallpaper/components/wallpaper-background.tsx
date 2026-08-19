import { StyleSheet, View } from 'react-native'

/** Number of diagonal ornament lines — kept small for performance. */
const LINE_COUNT = 14
const LINE_SPACING = 28

/**
 * Very subtle decorative wallpaper-like background.
 * Low-contrast lines sit behind opaque content cards — must not compete with inputs.
 */
export function WallpaperBackground() {
  return (
    <View pointerEvents="none" style={styles.container}>
      {Array.from({ length: LINE_COUNT }, (_, index) => (
        <View
          key={index}
          style={[
            styles.line,
            { left: index * LINE_SPACING - 40 },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  line: {
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
    bottom: -200,
    position: 'absolute',
    top: -200,
    transform: [{ rotate: '24deg' }],
    width: 1,
  },
})
