/**
 * Russian UI strings — primary locale for the first release.
 */
import type { TranslationTree } from '../types'

export const ru: TranslationTree = {
  app: {
    title: 'Калькулятор обоев',
    subtitle: 'Быстрый расчёт количества рулонов',
  },
  wallpaper: {
    intro: 'Рассчитайте, сколько рулонов понадобится для комнаты.',
    sections: {
      roomSize: 'Размер комнаты',
      rollSize: 'Размер рулона',
    },
    fields: {
      length: 'Длина',
      width: 'Ширина',
      height: 'Высота',
      rollWidth: 'Ширина рулона',
      rollLength: 'Длина рулона',
    },
    units: {
      meters: 'м',
      centimeters: 'см',
    },
    rollPresets: {
      popularSizes: 'Популярные размеры',
      custom: 'Другой размер',
      labels: {
        wide1060: '1,06 × 10,05 м',
        narrow530: '0,53 × 10,05 м',
      },
    },
    calculate: 'Рассчитать',
    preciseEntry: {
      title: 'Сделать расчёт точнее →',
      subtitle: 'Рисунок, отдельные стены, двери и окна',
    },
    preciseSheet: {
      title: 'Точный расчёт',
      body:
        'В следующем режиме можно будет учесть рисунок, отдельные стены, двери и окна.',
      close: 'Понятно',
    },
    nouns: {
      strip: {
        one: 'полотно',
        few: 'полотна',
        many: 'полотен',
      },
      roll: {
        one: 'рулон',
        few: 'рулона',
        many: 'рулонов',
      },
    },
    result: {
      minimumHeading: 'Нужно минимум',
      rollUnitOne: 'рулон',
      rollUnitFew: 'рулона',
      rollUnitMany: 'рулонов',
      stripsPrefix: '',
      stripsPerRollPrefix: 'По',
      sparePrefix: 'Для запаса можно взять ещё',
      totalWithSpare: 'Итого с запасом:',
    },
    explanation: {
      toggleLabel: 'Как мы это посчитали?',
      toggleHintCollapsed: 'Нажмите, чтобы раскрыть пояснение',
      toggleHintExpanded: 'Нажмите, чтобы скрыть пояснение',
      trimHint:
        'Этот запас помогает компенсировать небольшую неровность потолка и пола.',
      phaseAssumptionNote:
        'Если на обоях есть рисунок, точное количество рулонов может немного отличаться в зависимости от совмещения рисунка на стыках.',
      steps: {
        perimeterTitle: 'Длина стен',
        perimeterBody: 'Общая длина стен — {totalWidth}.',
        perimeterWithCornerBody:
          'Общая длина стен — {totalWidth}. Добавили небольшой запас на прохождение четырёх углов — по {perCorner} на угол: получилось {adjustedWidth}.',
        stripsTitle: 'Сколько нужно полотен',
        stripsBody: '{adjustedWidth} ÷ {stripWidth} → {stripCountLabel}',
        stripLengthTitle: 'Длина одного полотна',
        stripLengthBody:
          'Высота стены — {wallHeight}. Добавили {topTrim} сверху и {bottomTrim} снизу на подрезку: длина полотна — {stripLength}.',
        stripsPerRollTitle: 'Сколько полотен в рулоне',
        stripsPerRollBody:
          'Из рулона длиной {rollLength} получается {stripsPerRollLabel}.',
        rollPlanTitle: 'Итог',
        rollPlanPartialBody:
          'Нужно {stripCountLabel}: {fullRollCount} рулона × {stripsPerRoll} полотна = {fullRollsStrips}, ещё {partialStripsLabel} — из следующего рулона. Поэтому минимально нужно {minimumRollsLabel}.',
        rollPlanEvenBody:
          'Нужно {stripCountLabel} — минимально {minimumRollsLabel} по {stripsPerRoll} полотна из каждого.',
      },
    },
    errors: {
      field: {
        empty: 'Укажите значение',
        invalidFormat: 'Введите число, например 2,7 или 3',
        invalidCmFormat: 'Введите ширину в сантиметрах, например 106',
        notPositive: 'Значение должно быть больше нуля',
        notFinite: 'Некорректное число',
        tooLarge: 'Слишком большое значение',
      },
      domain: {
        invalidDimension:
          'Проверьте размеры. Все значения должны быть больше нуля.',
        stripLongerThanRoll:
          'Из этого рулона нельзя получить полотно нужной длины. Проверьте высоту стены и длину рулона.',
        invalidPattern: 'Проверьте параметры рисунка.',
        unsupportedFeature:
          'Этот вариант расчёта пока недоступен в быстром режиме.',
        inputOverflow: 'Одно из значений слишком большое.',
        invalidInput: 'Проверьте введённые данные.',
        generic: 'Не удалось выполнить расчёт. Проверьте введённые данные.',
      },
      general: 'Исправьте ошибки в форме и попробуйте снова.',
    },
  },
  common: {
    back: 'Назад',
  },
}
