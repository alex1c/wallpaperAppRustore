import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ScreenContainer } from '@/components/screen-container'
import { t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

/** Foundation home screen — entry point to the wallpaper calculator feature. */
export default function HomeScreen() {
  const strings = t()

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title} accessibilityRole="header">
          {strings.app.title}
        </Text>
        <Text style={styles.subtitle}>{strings.app.subtitle}</Text>
      </View>

      <Text style={styles.sectionLabel}>{strings.home.heading}</Text>
      <Text style={styles.description}>{strings.home.description}</Text>

      <Link href="/wallpaper" asChild>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonLabel}>{strings.home.openCalculator}</Text>
        </Pressable>
      </Link>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },
  buttonPressed: {
    backgroundColor: colors.accentPressed,
  },
  buttonLabel: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
})
