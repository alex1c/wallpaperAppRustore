import { PropsWithChildren } from 'react'
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '@/theme'

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean
  style?: ViewStyle
}

/**
 * Shared screen wrapper with safe area and optional scrolling.
 * Keeps keyboard-friendly layouts consistent across foundation screens.
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
      {content}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
