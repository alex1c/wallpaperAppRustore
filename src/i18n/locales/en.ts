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
    patternEntry: {
      title: 'Does the wallpaper have a pattern? Refine →',
      subtitle: 'We will account for pattern repeat from the roll label',
    },
    preciseEntry: {
      title: 'Make the calculation more precise →',
      subtitle: 'Account for individual walls, doors, and windows',
    },
    precise: {
      screenTitle: 'Precise calculation',
      back: 'Back',
      intro: 'Refine wall sizes and add doors or windows if needed.',
      sections: {
        walls: 'Walls',
        openings: 'Doors and windows',
        wallpaper: 'Wallpaper',
      },
      walls: {
        wallTitle: 'Wall {number}',
        width: 'Width',
        height: 'Height',
        addWall: '+ Add wall',
        removeWall: 'Remove',
        removeWallHint: 'Remove this wall from the calculation',
      },
      openings: {
        emptyTitle: 'No doors or windows yet',
        emptyBody:
          'Adding their sizes helps estimate wallpaper coverage more accurately.',
        addDoor: '+ Add door',
        addWindow: '+ Add window',
        editDoor: 'Door',
        editWindow: 'Window',
        remove: 'Remove',
        removeHint: 'Remove this opening from the calculation',
        doorLabel: 'Door',
        windowLabel: 'Window',
        onWall: 'On which wall',
        width: 'Width',
        height: 'Height',
        offsetFromLeft: 'From the left edge of the wall',
        offsetFromLeftHint:
          'Measure from the left edge of the selected wall to the start of the opening.',
        offsetFromFloor: 'From the floor',
        offsetFromFloorHint:
          'Measure from the floor to the bottom edge of the window.',
        save: 'Save',
        cancel: 'Cancel',
        previewLabel: 'Wall sketch',
        previewHint: 'Check that the opening is positioned as you measured.',
      },
      wallpaper: {
        rollSummary: 'Roll size',
        changeRoll: 'Change',
        rollDone: 'Done',
        patternSummary: 'Pattern',
        noPattern: 'No pattern matching',
        changePattern: 'Change',
      },
      calculate: 'Calculate',
      unsupportedPatternWithOpenings:
        'Precise calculation with doors and windows is not supported for pattern-matched wallpaper yet. You can calculate walls without openings or run the calculation without pattern matching.',
      result: {
        plannedHeading: 'By planned cutting layout',
        plannedHelper:
          'This uses a practical conservative cutting plan. Manual offcut optimization may use material more efficiently.',
        coverageAreaLabel: 'Coverage area',
        conservativeNote:
          'We use a conservative cutting plan so material is not underestimated. An experienced installer may reuse offcuts more efficiently.',
        openingImpactsTitle: 'What openings changed',
        wallCount: { one: 'wall', few: 'walls', many: 'walls' },
        doorCount: { one: 'door', few: 'doors', many: 'doors' },
        windowCount: { one: 'window', few: 'windows', many: 'windows' },
        openingImpact: {
          doorOnWall: 'Door on wall {wallNumber}',
          windowOnWall: 'Window on wall {wallNumber}',
          areaNotNeeded: 'No wallpaper needed: {area}',
        },
        comparison: {
          title: 'Compared to calculation without openings',
          reducedBody:
            'Without doors/windows: {baselineRolls} rolls. With openings: {actualRolls} rolls. Coverage reduced by {areaSaved}.',
          unchangedBody:
            'Roll count unchanged ({rolls} rolls), but coverage reduced by {areaSaved}.',
          increasedBody:
            'Openings reduced coverage by {areaSaved}, but the planned layout needs {actualRolls} rolls instead of {baselineRolls}.',
        },
      },
      explanation: {
        toggleLabel: 'How we calculated this',
        toggleHintCollapsed: 'Tap to expand the explanation',
        toggleHintExpanded: 'Tap to collapse the explanation',
        openingCount: { one: 'opening', few: 'openings', many: 'openings' },
        steps: {
          wallsTitle: 'Split the room into walls',
          wallsBody: '{wallCount} walls. Total coverage area — {totalArea}.',
          columnsTitle: 'Accounted for roll width',
          columnsBody: '{columnCount} vertical strips across all walls.',
          openingsTitle: 'Accounted for doors and windows',
          openingsBody: 'Added {openingCount}. Coverage reduced by {areaSaved}.',
          segmentsTitle: 'Prepared cut pieces',
          segmentsBody:
            'Areas above, below, and beside openings need separate pieces with trim allowance.',
          rollPlanTitle: 'Placed cuts on rolls',
          rollPlanBody: 'Planned cutting layout requires {plannedRolls}.',
          conservativeTitle: 'Why this is not always the most economical layout',
          conservativeBody:
            'We use a safe cutting plan to avoid underestimating material. An experienced installer may reuse offcuts more efficiently.',
        },
      },
      errors: {
        openingOutsideWall: 'The opening extends outside the wall.',
        overlappingOpenings: 'These openings overlap.',
        offsetTooWide: 'Offset from the left plus width exceeds the wall width.',
        doorTooTall: 'Door height exceeds wall height.',
      },
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
        'Offset pattern calculation is not available yet — we will not show an inaccurate result. See the label helper for 64/32 notation.',
      options: {
        free: {
          title: 'No need to match the pattern',
          description: 'One strip can be cut right after another.',
        },
        straight: {
          title: 'Pattern needs to be matched',
          description: 'The pattern on neighbouring strips must sit at the same height.',
        },
        'half-drop': {
          title: 'Pattern with offset',
          description: 'Each next strip is hung with a pattern shift.',
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
    share: {
      button: 'Share calculation',
      sheetTitle: 'Share calculation',
      textAction: 'Send result',
      textActionHint: 'Short text for messenger or email',
      pdfAction: 'Detailed PDF',
      pdfActionHint: 'A clean report to save or print',
      cancel: 'Cancel',
      reportTitle: 'Wallpaper calculation',
      footer: 'Calculated in Wallpaper Calculator.',
      sections: {
        room: 'Room',
        walls: 'Walls',
        wallpaper: 'Wallpaper',
        openings: 'Doors and windows',
        explanation: 'How the result was calculated',
      },
      errors: {
        generic: 'Could not share. Please try again.',
        unavailable: 'Sharing is unavailable on this device.',
        pdfFailed: 'Could not create the PDF. Please try again.',
        halfDropBlocked:
          'A report for offset pattern matching is not available yet — numeric calculation is not supported for this mode.',
      },
      status: {
        generatingPdf: 'Preparing PDF…',
      },
    },
    adsDev: {
      rewardedTestButton: 'Test rewarded (dev)',
      rewardedTestHint: 'Development only — hidden in production builds.',
      rewardedEarned: 'Reward earned (dev).',
      rewardedClosed: 'Rewarded closed without reward (dev).',
      rewardedUnavailable: 'Rewarded unavailable (dev).',
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
        openingOutsideWall: 'The opening extends outside the wall.',
        overlappingOpenings: 'These openings overlap.',
        generic: 'Calculation failed. Please check your inputs.',
      },
      general: 'Fix the errors in the form and try again.',
    },
  },
  common: {
    back: 'Back',
  },
}
