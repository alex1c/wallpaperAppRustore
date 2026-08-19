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
    preciseSheet: {
      title: string
      body: string
      close: string
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
