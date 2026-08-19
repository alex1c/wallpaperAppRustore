import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

interface RollLabelHelperSheetProps {
  visible: boolean
  onClose: () => void
}

/**
 * Compact helper explaining common wallpaper roll label notations.
 * Not an exhaustive international standard — examples only.
 */
export function RollLabelHelperSheet({ visible, onClose }: RollLabelHelperSheetProps) {
  const strings = t()
  const entries = strings.wallpaper.labelHelper.entries

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.backdrop}>
        <Pressable
          accessibilityRole="none"
          onPress={(event) => event.stopPropagation()}
          style={styles.sheet}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{strings.wallpaper.labelHelper.title}</Text>
            <Text style={styles.intro}>{strings.wallpaper.labelHelper.intro}</Text>

            {entries.map((entry) => (
              <View key={entry.mark} style={styles.entryCard}>
                <Text style={styles.entryMark}>{entry.mark}</Text>
                <Text style={styles.entryMeaning}>{entry.meaning}</Text>
              </View>
            ))}

            <Text style={styles.disclaimer}>{strings.wallpaper.labelHelper.disclaimer}</Text>
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonLabel}>{strings.wallpaper.labelHelper.close}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '85%',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  entryCard: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  entryMark: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  entryMeaning: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    minHeight: 48,
    justifyContent: 'center',
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
