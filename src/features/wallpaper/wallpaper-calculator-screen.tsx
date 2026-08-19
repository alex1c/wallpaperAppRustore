import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ScreenContainer } from '@/components/screen-container'
import type { WallpaperRollPresetId } from '@/config/wallpaper-roll-presets'
import {
  calculateQuickWallpaper,
  recommendRollPurchaseFromResult,
} from '@/domain/wallpaper'
import { CalculationResult } from '@/features/wallpaper/components/calculation-result'
import { DimensionField } from '@/features/wallpaper/components/dimension-field'
import { PatternEntryCard } from '@/features/wallpaper/components/pattern-entry-card'
import { PatternRefinementSheet } from '@/features/wallpaper/components/pattern-refinement-sheet'
import { PreciseEntryCard } from '@/features/wallpaper/components/precise-entry-card'
import { RollPresetSelector } from '@/features/wallpaper/components/roll-preset-selector'
import { buildPreciseDraftFromQuickForm } from '@/features/wallpaper/precise/input/build-precise-draft-from-quick'
import { setPendingPreciseDraft } from '@/features/wallpaper/precise/state/precise-draft-store'
import {
  parsePatternForm,
  withPatternInput,
  type PatternFormValues,
} from '@/features/wallpaper/input/parse-pattern-form'
import {
  DEFAULT_QUICK_FORM_VALUES,
  parseQuickCalculationForm,
  QUICK_FORM_FIELD_ORDER,
  type QuickFormFieldErrors,
  type QuickFormFieldKey,
} from '@/features/wallpaper/input/parse-quick-form'
import {
  mapDomainErrorToMessageKey,
  presentWallpaperQuickResult,
  type PresentedWallpaperResult,
} from '@/features/wallpaper/presenter'
import { getLocale, t } from '@/i18n'
import { getAnalyticsService } from '@/services'
import { colors, radii, spacing, typography } from '@/theme'
import type { ParseDecimalInputErrorCode } from '@/units/parse-decimal-input'

/**
 * Phase 3 Quick Mode — room input, roll presets, result, and explanation.
 * Domain math stays in `src/domain/wallpaper`; this screen orchestrates UX only.
 */
export function WallpaperCalculatorScreen() {
  const strings = t()
  const locale = getLocale()
  const router = useRouter()

  const [formValues, setFormValues] = useState(DEFAULT_QUICK_FORM_VALUES)
  const [fieldErrors, setFieldErrors] = useState<QuickFormFieldErrors>({})
  const [domainErrorMessage, setDomainErrorMessage] = useState<string | null>(null)
  const [presentedResult, setPresentedResult] = useState<PresentedWallpaperResult | null>(null)
  const [explanationExpanded, setExplanationExpanded] = useState(false)
  const [patternSheetVisible, setPatternSheetVisible] = useState(false)
  const [resultScrollY, setResultScrollY] = useState(0)

  const scrollRef = useRef<ScrollView>(null)
  const fieldRefs = useRef<Partial<Record<QuickFormFieldKey, TextInput | null>>>({})

  const registerFieldRef = useCallback(
    (key: QuickFormFieldKey) => (ref: TextInput | null) => {
      fieldRefs.current[key] = ref
    },
    [],
  )

  useEffect(() => {
    if (presentedResult && resultScrollY > 0) {
      scrollRef.current?.scrollTo({ animated: true, y: resultScrollY })
    }
  }, [presentedResult, resultScrollY])

  const updateField = useCallback((key: keyof typeof formValues, value: string) => {
    setFormValues((current) => ({ ...current, [key]: value }))
    setPresentedResult(null)
    setExplanationExpanded(false)
    setFieldErrors((current) => {
      if (!(key in current)) {
        return current
      }

      const next = { ...current }
      delete next[key as QuickFormFieldKey]
      return next
    })
    setDomainErrorMessage(null)
  }, [
    setDomainErrorMessage,
    setExplanationExpanded,
    setFieldErrors,
    setFormValues,
    setPresentedResult,
  ])

  const handlePresetSelect = useCallback((presetId: WallpaperRollPresetId) => {
    setFormValues((current) => ({ ...current, rollPresetId: presetId }))
    setPresentedResult(null)
    setExplanationExpanded(false)
    setDomainErrorMessage(null)
    setFieldErrors((current) => {
      const next = { ...current }
      delete next.rollWidth
      delete next.rollLength
      return next
    })
  }, [
    setDomainErrorMessage,
    setExplanationExpanded,
    setFieldErrors,
    setFormValues,
    setPresentedResult,
  ])

  const resolveFieldErrorMessage = (
    code: ParseDecimalInputErrorCode,
    fieldKey: QuickFormFieldKey,
  ): string => {
    const fieldStrings = strings.wallpaper.errors.field

    if (fieldKey === 'rollWidth' && code === 'INVALID_FORMAT') {
      return fieldStrings.invalidFormat
    }

    switch (code) {
      case 'EMPTY':
        return fieldStrings.empty
      case 'INVALID_FORMAT':
        return fieldStrings.invalidFormat
      case 'NOT_POSITIVE':
        return fieldStrings.notPositive
      case 'NOT_FINITE':
        return fieldStrings.notFinite
      case 'TOO_LARGE':
        return fieldStrings.tooLarge
      default:
        return fieldStrings.invalidFormat
    }
  }

  const focusFirstInvalidField = (errors: QuickFormFieldErrors) => {
    const firstKey = QUICK_FORM_FIELD_ORDER.find((key) => errors[key])

    if (!firstKey) {
      return
    }

    fieldRefs.current[firstKey]?.focus()
  }

  const runCalculation = (
    parsedInput: import('@/domain/wallpaper').QuickWallpaperCalculationInput,
  ) => {
    getAnalyticsService().track({ name: 'calculation_start' })

    const outcome = calculateQuickWallpaper(parsedInput)

    if (!outcome.ok) {
      const messageKey = mapDomainErrorToMessageKey(outcome.error.code)
      setDomainErrorMessage(strings.wallpaper.errors.domain[messageKey])
      return
    }

    const recommendation = recommendRollPurchaseFromResult(outcome.result)

    if (!recommendation.ok) {
      const messageKey = mapDomainErrorToMessageKey(recommendation.error.code)
      setDomainErrorMessage(strings.wallpaper.errors.domain[messageKey])
      return
    }

    const presented = presentWallpaperQuickResult(
      outcome.result,
      recommendation.result,
      locale,
    )

    setPresentedResult(presented)

    getAnalyticsService().track({
      name: 'calculation_complete',
      params: { rolls: outcome.result.minimumRolls },
    })
    getAnalyticsService().track({ name: 'result_view' })
  }

  const handleCalculate = () => {
    Keyboard.dismiss()
    setDomainErrorMessage(null)
    setPresentedResult(null)
    setExplanationExpanded(false)

    const parsed = parseQuickCalculationForm(formValues)

    if (!parsed.ok) {
      if (parsed.fieldErrors) {
        setFieldErrors(parsed.fieldErrors)
        focusFirstInvalidField(parsed.fieldErrors)
        return
      }

      setDomainErrorMessage(strings.wallpaper.errors.general)
      return
    }

    setFieldErrors({})
    runCalculation(parsed.input)
  }

  const handlePatternCalculate = (patternValues: PatternFormValues) => {
    Keyboard.dismiss()
    setDomainErrorMessage(null)
    setPresentedResult(null)
    setExplanationExpanded(false)

    const parsed = parseQuickCalculationForm(formValues)

    if (!parsed.ok) {
      if (parsed.fieldErrors) {
        setFieldErrors(parsed.fieldErrors)
        setPatternSheetVisible(false)
        focusFirstInvalidField(parsed.fieldErrors)
        setDomainErrorMessage(strings.wallpaper.errors.general)
        return
      }

      setDomainErrorMessage(strings.wallpaper.errors.general)
      return
    }

    const patternParsed = parsePatternForm(patternValues)

    if (!patternParsed.ok) {
      return
    }

    setFieldErrors({})
    runCalculation(withPatternInput(parsed.input, patternParsed.pattern))
  }

  const invalidatePresentedCalculation = useCallback(() => {
    setPresentedResult(null)
    setExplanationExpanded(false)
    setDomainErrorMessage(null)
  }, [
    setDomainErrorMessage,
    setExplanationExpanded,
    setPresentedResult,
  ])

  const handleOpenPreciseMode = () => {
    setPendingPreciseDraft(buildPreciseDraftFromQuickForm(formValues))
    router.push('/precise')
  }

  const showCustomRollFields = formValues.rollPresetId === 'custom'

  return (
    <>
      <ScreenContainer scroll={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          style={styles.flex}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={Keyboard.dismiss}
          >
            <Text accessibilityRole="header" style={styles.heading}>
              {strings.app.title}
            </Text>
            <Text style={styles.intro}>{strings.wallpaper.intro}</Text>

            <Text style={styles.sectionTitle}>{strings.wallpaper.sections.roomSize}</Text>

            <DimensionField
              errorMessage={
                fieldErrors.roomLength
                  ? resolveFieldErrorMessage(fieldErrors.roomLength, 'roomLength')
                  : undefined
              }
              label={strings.wallpaper.fields.length}
              onChangeText={(value) => updateField('roomLength', value)}
              onInputRef={registerFieldRef('roomLength')}
              unit={strings.wallpaper.units.meters}
              value={formValues.roomLength}
            />
            <DimensionField
              errorMessage={
                fieldErrors.roomWidth
                  ? resolveFieldErrorMessage(fieldErrors.roomWidth, 'roomWidth')
                  : undefined
              }
              label={strings.wallpaper.fields.width}
              onChangeText={(value) => updateField('roomWidth', value)}
              onInputRef={registerFieldRef('roomWidth')}
              unit={strings.wallpaper.units.meters}
              value={formValues.roomWidth}
            />
            <DimensionField
              errorMessage={
                fieldErrors.roomHeight
                  ? resolveFieldErrorMessage(fieldErrors.roomHeight, 'roomHeight')
                  : undefined
              }
              label={strings.wallpaper.fields.height}
              onChangeText={(value) => updateField('roomHeight', value)}
              onInputRef={registerFieldRef('roomHeight')}
              unit={strings.wallpaper.units.meters}
              value={formValues.roomHeight}
            />

            <Text style={styles.sectionTitle}>{strings.wallpaper.sections.rollSize}</Text>

            <RollPresetSelector
              onSelect={handlePresetSelect}
              selectedId={formValues.rollPresetId}
            />

            {showCustomRollFields ? (
              <View style={styles.customRollFields}>
                <DimensionField
                  errorMessage={
                    fieldErrors.rollWidth
                      ? resolveFieldErrorMessage(fieldErrors.rollWidth, 'rollWidth')
                      : undefined
                  }
                  label={strings.wallpaper.fields.rollWidth}
                  onChangeText={(value) => updateField('rollWidth', value)}
                  onInputRef={registerFieldRef('rollWidth')}
                  unit={strings.wallpaper.units.meters}
                  value={formValues.rollWidth}
                />
                <DimensionField
                  errorMessage={
                    fieldErrors.rollLength
                      ? resolveFieldErrorMessage(fieldErrors.rollLength, 'rollLength')
                      : undefined
                  }
                  label={strings.wallpaper.fields.rollLength}
                  onChangeText={(value) => updateField('rollLength', value)}
                  onInputRef={registerFieldRef('rollLength')}
                  unit={strings.wallpaper.units.meters}
                  value={formValues.rollLength}
                />
              </View>
            ) : null}

            {domainErrorMessage ? (
              <Text accessibilityRole="alert" style={styles.domainError}>
                {domainErrorMessage}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={handleCalculate}
              style={({ pressed }) => [
                styles.calculateButton,
                pressed && styles.calculateButtonPressed,
              ]}
            >
              <Text style={styles.calculateButtonLabel}>
                {strings.wallpaper.calculate}
              </Text>
            </Pressable>

            {presentedResult ? (
              <View
                onLayout={(event) => {
                  setResultScrollY(event.nativeEvent.layout.y)
                }}
              >
                <CalculationResult
                  explanationExpanded={explanationExpanded}
                  onToggleExplanation={() => setExplanationExpanded((value) => !value)}
                  result={presentedResult}
                />
              </View>
            ) : null}

            <PatternEntryCard onPress={() => setPatternSheetVisible(true)} />
            <PreciseEntryCard onPress={handleOpenPreciseMode} />
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenContainer>

      <PatternRefinementSheet
        onCalculate={handlePatternCalculate}
        onClose={() => setPatternSheetVisible(false)}
        onDraftChange={invalidatePresentedCalculation}
        visible={patternSheetVisible}
      />
    </>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  heading: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  customRollFields: {
    marginTop: spacing.md,
  },
  domainError: {
    ...typography.body,
    backgroundColor: '#FEE2E2',
    borderRadius: radii.md,
    color: colors.error,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  calculateButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    marginTop: spacing.md,
    minHeight: 52,
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
})
