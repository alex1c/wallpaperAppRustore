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
      'Demo strip-based calculation (Phase 2). Pattern matching not applied — see Phase 3 advanced flow.',
    roomWidth: 'Room width',
    roomLength: 'Room length',
    roomHeight: 'Room height',
    rollWidth: 'Roll width',
    rollLength: 'Roll length',
    unitCm: 'cm',
    calculate: 'Calculate',
    resultRolls: 'Minimum rolls',
    resultStrips: 'Strips',
    resultArea: 'Wall area',
    resultWithWaste: 'Including waste allowance',
  },
  common: {
    back: 'Back',
  },
}
