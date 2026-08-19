import { PropsWithChildren } from 'react'
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WallpaperBackground } from '@/features/wallpaper/components/wallpaper-background'
import { colors, spacing } from '@/theme'

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean
  style?: ViewStyle
}

/**
 * Shared screen wrapper with safe area, optional scrolling,
 * and a subtle decorative wallpaper background behind content.
 */
export function ScreenContainer({
  children,
  scroll = false,
  style,
}: ScreenContainerProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, style]}>{children}</View>
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <WallpaperBackground />
      {content}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
})
