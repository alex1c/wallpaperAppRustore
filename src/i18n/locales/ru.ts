/**
 * Russian UI strings — primary locale for the first release.
 */
import type { TranslationTree } from '../types'

export const ru: TranslationTree = {
  app: {
    title: 'Калькулятор обоев',
    subtitle: 'Быстрый расчёт количества рулонов',
  },
  home: {
    heading: 'Calculator Platform',
    description:
      'Первое приложение портфеля — калькулятор обоев для RuStore.',
    openCalculator: 'Открыть калькулятор',
  },
  wallpaper: {
    heading: 'Быстрый расчёт',
    placeholderNote:
      'Демонстрационный расчёт по полотнам (Phase 2). Без учёта рисунка — см. «Сделать точнее» в Phase 3.',
    roomWidth: 'Ширина комнаты',
    roomLength: 'Длина комнаты',
    roomHeight: 'Высота комнаты',
    rollWidth: 'Ширина рулона',
    rollLength: 'Длина рулона',
    unitCm: 'см',
    calculate: 'Рассчитать',
    resultRolls: 'Нужно рулонов (минимум)',
    resultStrips: 'Полотен',
    resultArea: 'Площадь стен',
    resultWithWaste: 'С учётом запаса',
  },
  common: {
    back: 'Назад',
  },
}
