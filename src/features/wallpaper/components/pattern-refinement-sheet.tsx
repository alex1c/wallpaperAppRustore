import { useCallback, useState } from 'react'
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { DimensionField } from '@/features/wallpaper/components/dimension-field'
import { PatternMatchSelector } from '@/features/wallpaper/components/pattern-match-selector'
import { RollLabelHelperSheet } from '@/features/wallpaper/components/roll-label-helper-sheet'
import {
  DEFAULT_PATTERN_FORM_VALUES,
  parsePatternForm,
  type PatternFormValues,
} from '@/features/wallpaper/input/parse-pattern-form'
import type { UiPatternMatchId } from '@/features/wallpaper/pattern/pattern-match-types'
import {
  changePatternMatchDraft,
  changePatternRepeatDraft,
} from '@/features/wallpaper/pattern/pattern-draft'
import { t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'
import type { ParseDecimalInputErrorCode } from '@/units/parse-decimal-input'

interface PatternRefinementSheetProps {
  visible: boolean
  onClose: () => void
  onCalculate: (patternValues: PatternFormValues) => void
  onDraftChange: () => void
}

/**
 * Progressive-disclosure sheet for pattern-aware calculation.
 * Keeps the main Quick form simple — pattern inputs live here only.
 */
export function PatternRefinementSheet({
  visible,
  onClose,
  onCalculate,
  onDraftChange,
}: PatternRefinementSheetProps) {
  const strings = t()
  const [patternValues, setPatternValues] = useState<PatternFormValues>(DEFAULT_PATTERN_FORM_VALUES)
  const [repeatError, setRepeatError] = useState<string | null>(null)
  const [halfDropMessage, setHalfDropMessage] = useState<string | null>(null)
  const [labelHelperVisible, setLabelHelperVisible] = useState(false)

  const resetTransientErrors = useCallback(() => {
    setRepeatError(null)
    setHalfDropMessage(null)
  }, [])

  const handleSelectMatch = useCallback((matchType: UiPatternMatchId) => {
    setPatternValues(changePatternMatchDraft(patternValues, matchType, onDraftChange))
    resetTransientErrors()
  }, [onDraftChange, patternValues, resetTransientErrors])

  const handleRepeatChange = useCallback((repeatCm: string) => {
    setPatternValues(changePatternRepeatDraft(patternValues, repeatCm, onDraftChange))
    setRepeatError(null)
    setHalfDropMessage(null)
  }, [onDraftChange, patternValues])

  const resolveRepeatError = (code: ParseDecimalInputErrorCode): string => {
    const fieldStrings = strings.wallpaper.errors.field

    switch (code) {
      case 'EMPTY':
        return fieldStrings.empty
      case 'INVALID_FORMAT':
        return fieldStrings.invalidCmFormat
      case 'NOT_POSITIVE':
        return fieldStrings.notPositive
      default:
        return fieldStrings.invalidCmFormat
    }
  }

  const handleCalculate = () => {
    Keyboard.dismiss()
    resetTransientErrors()

    const parsed = parsePatternForm(patternValues)

    if (!parsed.ok) {
      if ('halfDropDeferred' in parsed && parsed.halfDropDeferred) {
        setHalfDropMessage(strings.wallpaper.pattern.halfDropDeferred)
        return
      }

      if ('fieldErrors' in parsed && parsed.fieldErrors.repeatCm) {
        setRepeatError(resolveRepeatError(parsed.fieldErrors.repeatCm))
        return
      }

      return
    }

    onCalculate(patternValues)
    onClose()
  }

  const showRepeatField = patternValues.matchType === 'straight'

  return (
    <>
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
              <Text style={styles.title}>{strings.wallpaper.pattern.sheetTitle}</Text>
              <Text style={styles.intro}>{strings.wallpaper.pattern.sheetIntro}</Text>

              <PatternMatchSelector
                onSelect={handleSelectMatch}
                selectedId={patternValues.matchType}
              />

              {showRepeatField ? (
                <View style={styles.repeatSection}>
                  <DimensionField
                    errorMessage={repeatError ?? undefined}
                    inputMode="decimal"
                    label={strings.wallpaper.pattern.repeatLabel}
                    onChangeText={handleRepeatChange}
                    unit={strings.wallpaper.units.centimeters}
                    value={patternValues.repeatCm}
                  />
                  <Text style={styles.repeatHelper}>{strings.wallpaper.pattern.repeatHelper}</Text>
                  <Text style={styles.repeatSecondary}>{strings.wallpaper.pattern.repeatSecondary}</Text>
                </View>
              ) : null}

              {halfDropMessage ? (
                <Text accessibilityRole="alert" style={styles.infoMessage}>
                  {halfDropMessage}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                onPress={() => setLabelHelperVisible(true)}
                style={({ pressed }) => [styles.helperLink, pressed && styles.helperLinkPressed]}
              >
                <Text style={styles.helperLinkText}>
                  {strings.wallpaper.labelHelper.link}
                </Text>
              </Pressable>
            </ScrollView>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={handleCalculate}
                style={({ pressed }) => [
                  styles.calculateButton,
                  pressed && styles.calculateButtonPressed,
                ]}
              >
                <Text style={styles.calculateButtonLabel}>
                  {strings.wallpaper.pattern.calculate}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelPressed]}
              >
                <Text style={styles.cancelLabel}>{strings.wallpaper.pattern.cancel}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <RollLabelHelperSheet
        onClose={() => setLabelHelperVisible(false)}
        visible={labelHelperVisible}
      />
    </>
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
    maxHeight: '92%',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  repeatSection: {
    marginTop: spacing.md,
  },
  repeatHelper: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  repeatSecondary: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoMessage: {
    ...typography.body,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    color: colors.textPrimary,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  helperLink: {
    marginTop: spacing.md,
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  helperLinkPressed: {
    opacity: 0.85,
  },
  helperLinkText: {
    ...typography.subtitle,
    color: colors.accent,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  calculateButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  calculateButtonPressed: {
    backgroundColor: colors.accentPressed,
  },
  calculateButtonLabel: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
  cancelButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  cancelPressed: {
    opacity: 0.85,
  },
  cancelLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
})
