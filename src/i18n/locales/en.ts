/**
 * English locale — structural placeholder for future internationalization.
 */
import type { TranslationTree } from '../types'

export const en: TranslationTree = {
  app: {
    title: 'Wallpaper Calculator',
    subtitle: 'Quick roll quantity estimate',
  },
  home: {
    heading: 'Calculator Platform',
    description:
      'First app in the portfolio — wallpaper calculator for RuStore.',
    openCalculator: 'Open calculator',
  },
  wallpaper: {
    heading: 'Quick estimate',
    placeholderNote:
      'Demo calculation for architecture validation. Full formula arrives in Phase 2.',
    roomWidth: 'Room width',
    roomLength: 'Room length',
    roomHeight: 'Room height',
    rollWidth: 'Roll width',
    rollLength: 'Roll length',
    unitCm: 'cm',
    calculate: 'Calculate',
    resultRolls: 'Rolls required',
    resultArea: 'Wall area',
    resultWithWaste: 'Including waste allowance',
  },
  common: {
    back: 'Back',
  },
}
