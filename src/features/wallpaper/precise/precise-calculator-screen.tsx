import { useCallback, useRef, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ScreenContainer } from '@/components/screen-container'
import { calculatePreciseWallpaper } from '@/domain/wallpaper'
import { DimensionField } from '@/features/wallpaper/components/dimension-field'
import { PatternRefinementSheet } from '@/features/wallpaper/components/pattern-refinement-sheet'
import { RollPresetSelector } from '@/features/wallpaper/components/roll-preset-selector'
import { OpeningFormSheet } from '@/features/wallpaper/precise/components/opening-form-sheet'
import { PreciseOpeningsSection } from '@/features/wallpaper/precise/components/precise-openings-section'
import { PreciseResult } from '@/features/wallpaper/precise/components/precise-result'
import { PreciseWallCard } from '@/features/wallpaper/precise/components/precise-wall-card'
import { WallpaperConfigSummary } from '@/features/wallpaper/precise/components/wallpaper-config-summary'
import {
  createNewOpeningDraft,
  createNewWallDraft,
  parsePreciseCalculationForm,
  reindexWallDisplayNumbers,
  type PreciseFormFieldErrors,
} from '@/features/wallpaper/precise/input/parse-precise-form'
import {
  mapPreciseFieldError,
  presentPreciseWallpaperResult,
  type PresentedPreciseWallpaperResult,
} from '@/features/wallpaper/precise/presenter/present-precise-wallpaper-result'
import { consumePendingPreciseDraft } from '@/features/wallpaper/precise/state/precise-draft-store'
import { invalidatePreciseCalculation } from '@/features/wallpaper/precise/state/invalidate-precise-calculation'
import type {
  PreciseDraft,
  PreciseOpeningDraft,
} from '@/features/wallpaper/precise/state/precise-draft-types'
import {
  DEFAULT_PATTERN_FORM_VALUES,
  type PatternFormValues,
} from '@/features/wallpaper/input/parse-pattern-form'
import { mapDomainErrorToMessageKey } from '@/features/wallpaper/presenter'
import { getLocale, t } from '@/i18n'
import { colors, radii, spacing, typography } from '@/theme'

/**
 * Precise Mode screen — per-wall geometry, openings, and conservative roll plan.
 */
export function PreciseCalculatorScreen() {
  const strings = t()
  const locale = getLocale()
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)

  const [draft, setDraft] = useState<PreciseDraft>(() => consumePendingPreciseDraft())
  const [fieldErrors, setFieldErrors] = useState<PreciseFormFieldErrors>({})
  const [domainErrorMessage, setDomainErrorMessage] = useState<string | null>(null)
  const [unsupportedPatternMessage, setUnsupportedPatternMessage] = useState<string | null>(null)
  const [presentedResult, setPresentedResult] = useState<PresentedPreciseWallpaperResult | null>(null)
  const [explanationExpanded, setExplanationExpanded] = useState(false)

  const [rollSheetVisible, setRollSheetVisible] = useState(false)
  const [patternSheetVisible, setPatternSheetVisible] = useState(false)
  const [openingSheetVisible, setOpeningSheetVisible] = useState(false)
  const [editingOpening, setEditingOpening] = useState<PreciseOpeningDraft | null>(null)
  const [openingFormErrors, setOpeningFormErrors] = useState<PreciseFormFieldErrors>({})

  const invalidateResult = useCallback(() => {
    invalidatePreciseCalculation({
      clearPresentedResult: () => setPresentedResult(null),
      collapseExplanation: () => setExplanationExpanded(false),
      clearFieldErrors: () => setFieldErrors({}),
      clearDomainError: () => setDomainErrorMessage(null),
      clearUnsupportedPatternMessage: () => setUnsupportedPatternMessage(null),
    })
  }, [])

  const updateDraft = useCallback((updater: (current: PreciseDraft) => PreciseDraft) => {
    setDraft((current) => updater(current))
    invalidateResult()
  }, [invalidateResult])

  const resolveWallError = (wallId: string, field: 'width' | 'height'): string | undefined => {
    const code = fieldErrors[`wall:${wallId}:${field}`]

    if (!code || code === 'OPENING_OUTSIDE_WALL' || code === 'OVERLAPPING') {
      return code ? mapPreciseFieldError(code) : undefined
    }

    return mapPreciseFieldError(code)
  }

  const handleCalculate = () => {
    Keyboard.dismiss()
    invalidateResult()
    setFieldErrors({})

    const parsed = parsePreciseCalculationForm(draft)

    if (!parsed.ok) {
      if ('unsupportedPatternWithOpenings' in parsed && parsed.unsupportedPatternWithOpenings) {
        setUnsupportedPatternMessage(strings.wallpaper.precise.unsupportedPatternWithOpenings)
        return
      }

      if ('fieldErrors' in parsed && parsed.fieldErrors) {
        setFieldErrors(parsed.fieldErrors)
        return
      }

      setDomainErrorMessage(strings.wallpaper.errors.general)
      return
    }

    const outcome = calculatePreciseWallpaper(parsed.input)

    if (!outcome.ok) {
      const messageKey = mapDomainErrorToMessageKey(outcome.error.code)
      setDomainErrorMessage(strings.wallpaper.errors.domain[messageKey])
      return
    }

    setPresentedResult(
      presentPreciseWallpaperResult(
        outcome.result,
        draft.walls,
        draft.openings,
        locale,
      ),
    )
  }

  const validateAndSaveOpening = (opening: PreciseOpeningDraft) => {
    const trialDraft: PreciseDraft = {
      ...draft,
      openings: draft.openings.some((entry) => entry.id === opening.id)
        ? draft.openings.map((entry) => (entry.id === opening.id ? opening : entry))
        : [...draft.openings, opening],
    }

    const parsed = parsePreciseCalculationForm(trialDraft)

    if (!parsed.ok && 'fieldErrors' in parsed && parsed.fieldErrors) {
      const openingErrors = Object.fromEntries(
        Object.entries(parsed.fieldErrors).filter(([key]) => key.includes(opening.id)),
      ) as PreciseFormFieldErrors

      if (Object.keys(openingErrors).length > 0) {
        setOpeningFormErrors(openingErrors)
        return
      }
    }

    setOpeningFormErrors({})
    setOpeningSheetVisible(false)
    setEditingOpening(null)
    updateDraft(() => trialDraft)
  }

  const openNewOpening = (kind: PreciseOpeningDraft['kind']) => {
    invalidateResult()
    setOpeningFormErrors({})
    setEditingOpening(createNewOpeningDraft(kind, draft.walls))
    setOpeningSheetVisible(true)
  }

  const openEditOpening = (opening: PreciseOpeningDraft) => {
    invalidateResult()
    setOpeningFormErrors({})
    setEditingOpening({ ...opening })
    setOpeningSheetVisible(true)
  }

  const handlePatternCalculate = (patternValues: PatternFormValues) => {
    updateDraft((current) => ({ ...current, pattern: patternValues }))
    setPatternSheetVisible(false)
  }

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
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Text style={styles.backLabel}>
                ← {strings.wallpaper.precise.back}
              </Text>
            </Pressable>

            <Text accessibilityRole="header" style={styles.heading}>
              {strings.wallpaper.precise.screenTitle}
            </Text>
            <Text style={styles.intro}>{strings.wallpaper.precise.intro}</Text>

            <Text style={styles.sectionTitle}>{strings.wallpaper.precise.sections.walls}</Text>

            {draft.walls.map((wall) => (
              <PreciseWallCard
                key={wall.id}
                canRemove={draft.walls.length > 1}
                heightError={resolveWallError(wall.id, 'height')}
                onChangeHeight={(value) => updateDraft((current) => ({
                  ...current,
                  walls: current.walls.map((entry) => (
                    entry.id === wall.id ? { ...entry, height: value } : entry
                  )),
                }))}
                onChangeWidth={(value) => updateDraft((current) => ({
                  ...current,
                  walls: current.walls.map((entry) => (
                    entry.id === wall.id ? { ...entry, width: value } : entry
                  )),
                }))}
                onRemove={() => updateDraft((current) => ({
                  ...current,
                  walls: reindexWallDisplayNumbers(
                    current.walls.filter((entry) => entry.id !== wall.id),
                  ),
                  openings: current.openings.filter((entry) => entry.wallId !== wall.id),
                }))}
                wall={wall}
                widthError={resolveWallError(wall.id, 'width')}
              />
            ))}

            <Pressable
              accessibilityRole="button"
              onPress={() => updateDraft((current) => ({
                ...current,
                walls: [...current.walls, createNewWallDraft(current.walls)],
              }))}
              style={({ pressed }) => [styles.addWallButton, pressed && styles.pressed]}
            >
              <Text style={styles.addWallLabel}>{strings.wallpaper.precise.walls.addWall}</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>{strings.wallpaper.precise.sections.openings}</Text>

            <PreciseOpeningsSection
              onAddDoor={() => openNewOpening('door')}
              onAddWindow={() => openNewOpening('window')}
              onEditOpening={openEditOpening}
              onRemoveOpening={(openingId) => updateDraft((current) => ({
                ...current,
                openings: current.openings.filter((entry) => entry.id !== openingId),
              }))}
              openings={draft.openings}
              walls={draft.walls}
            />

            <Text style={styles.sectionTitle}>{strings.wallpaper.precise.sections.wallpaper}</Text>

            <WallpaperConfigSummary
              draft={draft}
              onChangePattern={() => setPatternSheetVisible(true)}
              onChangeRoll={() => setRollSheetVisible(true)}
            />

            {unsupportedPatternMessage ? (
              <Text accessibilityRole="alert" style={styles.warningBox}>
                {unsupportedPatternMessage}
              </Text>
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
                {strings.wallpaper.precise.calculate}
              </Text>
            </Pressable>

            {presentedResult ? (
              <PreciseResult
                explanationExpanded={explanationExpanded}
                onToggleExplanation={() => setExplanationExpanded((value) => !value)}
                result={presentedResult}
              />
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenContainer>

      <Modal
        animationType="slide"
        onRequestClose={() => setRollSheetVisible(false)}
        transparent
        visible={rollSheetVisible}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{strings.wallpaper.sections.rollSize}</Text>
            <RollPresetSelector
              onSelect={(presetId) => updateDraft((current) => ({
                ...current,
                rollPresetId: presetId,
              }))}
              selectedId={draft.rollPresetId}
            />
            {draft.rollPresetId === 'custom' ? (
              <>
                <DimensionField
                  label={strings.wallpaper.fields.rollWidth}
                  onChangeText={(value) => updateDraft((current) => ({
                    ...current,
                    rollWidth: value,
                  }))}
                  unit={strings.wallpaper.units.meters}
                  value={draft.rollWidth}
                />
                <DimensionField
                  label={strings.wallpaper.fields.rollLength}
                  onChangeText={(value) => updateDraft((current) => ({
                    ...current,
                    rollLength: value,
                  }))}
                  unit={strings.wallpaper.units.meters}
                  value={draft.rollLength}
                />
              </>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => setRollSheetVisible(false)}
              style={({ pressed }) => [styles.modalDone, pressed && styles.pressed]}
            >
              <Text style={styles.modalDoneLabel}>
                {strings.wallpaper.precise.wallpaper.rollDone}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <PatternRefinementSheet
        initialValues={draft.pattern ?? DEFAULT_PATTERN_FORM_VALUES}
        onCalculate={handlePatternCalculate}
        onClose={() => setPatternSheetVisible(false)}
        onDraftChange={invalidateResult}
        visible={patternSheetVisible}
      />

      <OpeningFormSheet
        fieldErrors={openingFormErrors}
        key={editingOpening?.id ?? 'closed'}
        onClose={() => {
          setOpeningSheetVisible(false)
          setEditingOpening(null)
          setOpeningFormErrors({})
        }}
        onDraftChange={() => setOpeningFormErrors({})}
        onSave={validateAndSaveOpening}
        opening={editingOpening}
        visible={openingSheetVisible}
        walls={draft.walls}
      />
    </>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  backLabel: {
    ...typography.subtitle,
    color: colors.accent,
  },
  heading: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
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
  addWallButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  addWallLabel: {
    ...typography.subtitle,
    color: colors.accent,
  },
  warningBox: {
    ...typography.body,
    backgroundColor: '#FEF3C7',
    borderRadius: radii.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
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
  pressed: { opacity: 0.9 },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalDone: {
    alignItems: 'center',
    marginTop: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  modalDoneLabel: {
    ...typography.subtitle,
    color: colors.accent,
  },
})
