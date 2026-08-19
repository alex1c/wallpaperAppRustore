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
      custom: 'Custom size',
      labels: {
        wide1060: '1.06 × 10.05 m',
        narrow530: '0.53 × 10.05 m',
      },
    },
    calculate: 'Calculate',
    preciseEntry: {
      title: 'Make calculation more precise →',
      subtitle: 'Pattern, individual walls, doors and windows',
    },
    preciseSheet: {
      title: 'Precise calculation',
      body:
        'The next mode will support pattern matching, individual walls, doors, and windows.',
      close: 'Got it',
    },
    nouns: {
      strip: {
        one: 'strip',
        few: 'strips',
        many: 'strips',
      },
      roll: {
        one: 'roll',
        few: 'rolls',
        many: 'rolls',
      },
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
    },
    explanation: {
      toggleLabel: 'How we calculated this',
      toggleHintCollapsed: 'Tap to expand the explanation',
      toggleHintExpanded: 'Tap to collapse the explanation',
      trimHint:
        'This allowance helps cover small unevenness at the ceiling and floor.',
      phaseAssumptionNote:
        'If the wallpaper has a pattern, the exact roll count may differ slightly depending on pattern alignment at seams.',
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
        stripsPerRollTitle: 'Strips per roll',
        stripsPerRollBody:
          'A {rollLength} roll yields {stripsPerRollLabel}.',
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
        invalidCmFormat: 'Enter width in centimeters, e.g. 106',
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
        unsupportedFeature:
          'This calculation option is not available in quick mode yet.',
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
