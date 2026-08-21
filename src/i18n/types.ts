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
    patternEntry: {
      title: string
      subtitle: string
    }
    preciseEntry: {
      title: string
      subtitle: string
    }
    precise: {
      screenTitle: string
      back: string
      intro: string
      sections: {
        walls: string
        openings: string
        wallpaper: string
      }
      walls: {
        wallTitle: string
        width: string
        height: string
        addWall: string
        removeWall: string
        removeWallHint: string
      }
      openings: {
        emptyTitle: string
        emptyBody: string
        addDoor: string
        addWindow: string
        editDoor: string
        editWindow: string
        remove: string
        removeHint: string
        doorLabel: string
        windowLabel: string
        onWall: string
        width: string
        height: string
        offsetFromLeft: string
        offsetFromLeftHint: string
        offsetFromFloor: string
        offsetFromFloorHint: string
        save: string
        cancel: string
        previewLabel: string
        previewHint: string
      }
      wallpaper: {
        rollSummary: string
        changeRoll: string
        rollDone: string
        patternSummary: string
        noPattern: string
        changePattern: string
      }
      calculate: string
      unsupportedPatternWithOpenings: string
      result: {
        plannedHeading: string
        plannedHelper: string
        coverageAreaLabel: string
        conservativeNote: string
        openingImpactsTitle: string
        wallCount: { one: string; few: string; many: string }
        doorCount: { one: string; few: string; many: string }
        windowCount: { one: string; few: string; many: string }
        openingImpact: {
          doorOnWall: string
          windowOnWall: string
          areaNotNeeded: string
        }
        comparison: {
          title: string
          reducedBody: string
          unchangedBody: string
          increasedBody: string
        }
      }
      explanation: {
        toggleLabel: string
        toggleHintCollapsed: string
        toggleHintExpanded: string
        openingCount: { one: string; few: string; many: string }
        steps: {
          wallsTitle: string
          wallsBody: string
          columnsTitle: string
          columnsBody: string
          openingsTitle: string
          openingsBody: string
          segmentsTitle: string
          segmentsBody: string
          rollPlanTitle: string
          rollPlanBody: string
          conservativeTitle: string
          conservativeBody: string
        }
      }
      errors: {
        openingOutsideWall: string
        overlappingOpenings: string
        offsetTooWide: string
        doorTooTall: string
      }
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
    share: {
      button: string
      sheetTitle: string
      textAction: string
      textActionHint: string
      pdfAction: string
      pdfActionHint: string
      cancel: string
      reportTitle: string
      footer: string
      sections: {
        room: string
        walls: string
        wallpaper: string
        openings: string
        explanation: string
      }
      errors: {
        generic: string
        unavailable: string
        pdfFailed: string
        halfDropBlocked: string
      }
      status: {
        generatingPdf: string
      }
    }
    /** Development-only rewarded verification — never shown in production UI. */
    adsDev: {
      rewardedTestButton: string
      rewardedTestHint: string
      rewardedEarned: string
      rewardedClosed: string
      rewardedUnavailable: string
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
        openingOutsideWall: string
        overlappingOpenings: string
        generic: string
      }
      general: string
    }
  }
  common: {
    back: string
  }
}
