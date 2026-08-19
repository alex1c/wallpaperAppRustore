/**
 * English locale — functional structural coverage for development and future use.
 */
import type { TranslationTree } from '../types'

export const en: TranslationTree = {
  app: {
    title: 'Wallpaper Calculator',
    subtitle: 'Quick roll quantity estimate',
  },
  wallpaper: {
    intro: 'Estimate how many rolls you need for a room.',
    sections: {
      roomSize: 'Room size',
      rollSize: 'Roll size',
    },
    fields: {
      length: 'Length',
      width: 'Width',
      height: 'Height',
      rollWidth: 'Roll width',
      rollLength: 'Roll length',
    },
    units: {
      meters: 'm',
      centimeters: 'cm',
    },
    rollPresets: {
      popularSizes: 'Popular sizes',
      sizeHint: 'Roll size is usually shown on the label as width × length.',
      custom: 'Custom size',
      labels: {
        wide1060: '1.06 × 10.05 m',
        narrow530: '0.53 × 10.05 m',
      },
    },
    calculate: 'Calculate',
    preciseEntry: {
      title: 'Does the wallpaper have a pattern? Refine →',
      subtitle: 'We will account for pattern repeat from the roll label',
    },
    pattern: {
      sheetTitle: 'Refine calculation with pattern',
      sheetIntro:
        'Choose how your wallpaper is hung. Room and roll sizes come from the main form.',
      sectionTitle: 'How is your wallpaper hung?',
      repeatLabel: 'Pattern repeat',
      repeatHelper:
        'The distance at which the pattern repeats on the wallpaper. Usually shown on the roll label.',
      repeatSecondary:
        'On the label this may look like 64 or 64/32. Also called rapport.',
      calculate: 'Calculate with pattern',
      cancel: 'Cancel',
      halfDropDeferred:
        'Half-drop calculation is not available yet — we will not show an inaccurate result. See the label helper for 64/32 notation.',
      options: {
        free: {
          title: 'No pattern matching',
          description: 'Strips can be cut one after another without aligning the pattern.',
        },
        straight: {
          title: 'Pattern repeats evenly',
          description: 'Neighbouring strips align at the same height.',
          hint: 'Straight match',
        },
        'half-drop': {
          title: 'Pattern shifts every other strip',
          description: 'Each next strip must be offset to match the pattern.',
          hint: 'Half-drop match',
        },
      },
    },
    labelHelper: {
      link: 'How to read a wallpaper label?',
      title: 'How to read a wallpaper label?',
      intro:
        'Labels often use notation like below. These are examples — not a complete standard.',
      disclaimer: 'Notation may differ slightly between manufacturers.',
      close: 'Got it',
      entries: [
        { mark: '53 cm × 10.05 m', meaning: 'Roll width and length.' },
        { mark: '64 cm', meaning: 'Pattern repeats every 64 cm.' },
        { mark: '64/0', meaning: 'Straight match — strips at the same height.' },
        { mark: '64/32', meaning: '64 cm repeat, next strip offset by 32 cm.' },
        { mark: '0', meaning: 'No pattern matching required.' },
      ],
    },
    nouns: {
      strip: { one: 'strip', few: 'strips', many: 'strips' },
      roll: { one: 'roll', few: 'rolls', many: 'rolls' },
    },
    result: {
      minimumHeading: 'Minimum needed',
      rollUnitOne: 'roll',
      rollUnitFew: 'rolls',
      rollUnitMany: 'rolls',
      stripsPrefix: '',
      stripsPerRollPrefix: '',
      sparePrefix: 'Consider',
      totalWithSpare: 'Total with spare:',
      patternAppliedBadge: 'Pattern included',
    },
    explanation: {
      toggleLabel: 'How we calculated this',
      toggleHintCollapsed: 'Tap to expand the explanation',
      toggleHintExpanded: 'Tap to collapse the explanation',
      trimHint:
        'This allowance helps cover small unevenness at the ceiling and floor.',
      phaseAssumptionNote:
        'For patterned wallpaper, actual usage may depend on where the pattern starts on a new roll. Consider extra spare when buying.',
      steps: {
        perimeterTitle: 'Wall run',
        perimeterBody: 'Total wall run — {totalWidth}.',
        perimeterWithCornerBody:
          'Total wall run — {totalWidth}. Added a small allowance for four corners — {perCorner} per corner: {adjustedWidth}.',
        stripsTitle: 'How many strips',
        stripsBody: '{adjustedWidth} ÷ {stripWidth} → {stripCountLabel}',
        stripLengthTitle: 'Length of one strip',
        stripLengthBody:
          'Wall height — {wallHeight}. Added {topTrim} top and {bottomTrim} bottom trim: strip length — {stripLength}.',
        stripLengthWithPatternBody:
          'Wall height — {wallHeight}. Added {topTrim} top and {bottomTrim} bottom trim. Physical strip length — {stripLength}.',
        patternAlignmentTitle: 'Pattern alignment',
        patternAlignmentBody:
          'Pattern repeats every {repeatSize}. To align neighbouring strips, the next strip starts {patternStep} along the roll.',
        patternAlignmentWithGapBody:
          'Pattern repeats every {repeatSize}. To align neighbouring strips, the next strip starts {patternStep} along the roll. The {alignmentGap} difference is used for pattern matching.',
        stripsPerRollTitle: 'Strips per roll',
        stripsPerRollBody: 'A {rollLength} roll yields {stripsPerRollLabel}.',
        rollPlanTitle: 'Total',
        rollPlanPartialBody:
          '{stripCountLabel}: {fullRollCount} rolls × {stripsPerRoll} strips = {fullRollsStrips}, plus {partialStripsLabel} from another roll. Minimum {minimumRollsLabel}.',
        rollPlanEvenBody:
          '{stripCountLabel} — minimum {minimumRollsLabel} at {stripsPerRoll} strips each.',
      },
    },
    errors: {
      field: {
        empty: 'Enter a value',
        invalidFormat: 'Enter a number, e.g. 2.7 or 3',
        invalidCmFormat: 'Enter size in centimeters, e.g. 64',
        notPositive: 'Value must be greater than zero',
        notFinite: 'Invalid number',
        tooLarge: 'Value is too large',
      },
      domain: {
        invalidDimension:
          'Check your dimensions. All values must be greater than zero.',
        stripLongerThanRoll:
          'This roll is too short for the required strip length. Check wall height and roll length.',
        invalidPattern: 'Check pattern settings.',
        unsupportedFeature: 'This calculation option is not available yet.',
        inputOverflow: 'One of the values is too large.',
        invalidInput: 'Check the values you entered.',
        generic: 'Calculation failed. Please check your inputs.',
      },
      general: 'Fix the errors in the form and try again.',
    },
  },
  common: {
    back: 'Back',
  },
}
