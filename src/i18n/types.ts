/**
 * Shape of the translation catalog — values are strings, not locale-specific literals.
 */
export interface TranslationTree {
  app: {
    title: string
    subtitle: string
  }
  wallpaper: {
    intro: string
    sections: {
      roomSize: string
      rollSize: string
    }
    fields: {
      length: string
      width: string
      height: string
      rollWidth: string
      rollLength: string
    }
    units: {
      meters: string
      centimeters: string
    }
    rollPresets: {
      popularSizes: string
      sizeHint: string
      custom: string
      labels: {
        wide1060: string
        narrow530: string
      }
    }
    calculate: string
    preciseEntry: {
      title: string
      subtitle: string
    }
    pattern: {
      sheetTitle: string
      sheetIntro: string
      sectionTitle: string
      repeatLabel: string
      repeatHelper: string
      repeatSecondary: string
      calculate: string
      cancel: string
      halfDropDeferred: string
      options: {
        free: { title: string; description: string; hint?: string }
        straight: { title: string; description: string; hint?: string }
        'half-drop': { title: string; description: string; hint?: string }
      }
    }
    labelHelper: {
      link: string
      title: string
      intro: string
      disclaimer: string
      close: string
      entries: readonly { mark: string; meaning: string }[]
    }
    nouns: {
      strip: {
        one: string
        few: string
        many: string
      }
      roll: {
        one: string
        few: string
        many: string
      }
    }
    result: {
      minimumHeading: string
      rollUnitOne: string
      rollUnitFew: string
      rollUnitMany: string
      stripsPrefix: string
      stripsPerRollPrefix: string
      sparePrefix: string
      totalWithSpare: string
      patternAppliedBadge: string
    }
    explanation: {
      toggleLabel: string
      toggleHintCollapsed: string
      toggleHintExpanded: string
      trimHint: string
      phaseAssumptionNote: string
      steps: {
        perimeterTitle: string
        perimeterBody: string
        perimeterWithCornerBody: string
        stripsTitle: string
        stripsBody: string
        stripLengthTitle: string
        stripLengthBody: string
        stripLengthWithPatternBody: string
        patternAlignmentTitle: string
        patternAlignmentBody: string
        patternAlignmentWithGapBody: string
        stripsPerRollTitle: string
        stripsPerRollBody: string
        rollPlanTitle: string
        rollPlanPartialBody: string
        rollPlanEvenBody: string
      }
    }
    errors: {
      field: {
        empty: string
        invalidFormat: string
        invalidCmFormat: string
        notPositive: string
        notFinite: string
        tooLarge: string
      }
      domain: {
        invalidDimension: string
        stripLongerThanRoll: string
        invalidPattern: string
        unsupportedFeature: string
        inputOverflow: string
        invalidInput: string
        generic: string
      }
      general: string
    }
  }
  common: {
    back: string
  }
}
