/**
 * Shape of the translation catalog — values are strings, not locale-specific literals.
 */
export interface TranslationTree {
  app: {
    title: string
    subtitle: string
  }
  home: {
    heading: string
    description: string
    openCalculator: string
  }
  wallpaper: {
    heading: string
    placeholderNote: string
    roomWidth: string
    roomLength: string
    roomHeight: string
    rollWidth: string
    rollLength: string
    unitCm: string
    calculate: string
    resultRolls: string
    resultStrips: string
    resultArea: string
    resultWithWaste: string
  }
  common: {
    back: string
  }
}
