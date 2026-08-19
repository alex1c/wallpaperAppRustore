import { Modal, Pressable, StyleSheet, Text } from 'react-native'
import { t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

interface InfoSheetProps {
  visible: boolean
  onClose: () => void
}

/**
 * Informational sheet for features not yet available in Phase 3.
 * Avoids broken navigation to unimplemented precise/pattern flows.
 */
export function InfoSheet({ visible, onClose }: InfoSheetProps) {
  const strings = t()

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onClose}
        style={styles.backdrop}
      >
        <Pressable
          accessibilityRole="none"
          onPress={(event) => event.stopPropagation()}
          style={styles.sheet}
        >
          <Text style={styles.title}>{strings.wallpaper.preciseSheet.title}</Text>
          <Text style={styles.body}>{strings.wallpaper.preciseSheet.body}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonLabel}>{strings.wallpaper.preciseSheet.close}</Text>
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
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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
