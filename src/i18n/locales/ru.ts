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
      sizeHint: 'Размер обычно указан на этикетке рулона как ширина × длина.',
      custom: 'Другой размер',
      labels: {
        wide1060: '1,06 × 10,05 м',
        narrow530: '0,53 × 10,05 м',
      },
    },
    calculate: 'Рассчитать',
    preciseEntry: {
      title: 'На обоях есть рисунок? Уточнить расчёт →',
      subtitle: 'Учтём повтор рисунка и маркировку с этикетки',
    },
    pattern: {
      sheetTitle: 'Уточнить расчёт с рисунком',
      sheetIntro:
        'Выберите, как клеятся ваши обои. Размеры комнаты и рулона возьмём из основного расчёта.',
      sectionTitle: 'Как клеятся ваши обои?',
      repeatLabel: 'Повтор рисунка',
      repeatHelper:
        'Это расстояние, через которое рисунок на обоях повторяется. Обычно оно указано на этикетке рулона.',
      repeatSecondary:
        'На этикетке это число может выглядеть как 64 или 64/32. Его также называют раппортом.',
      calculate: 'Рассчитать с рисунком',
      cancel: 'Отмена',
      halfDropDeferred:
        'Расчёт для смещённого рисунка пока недоступен — мы не хотим показать неточный результат. Маркировку 64/32 можно посмотреть в подсказке по этикетке.',
      options: {
        free: {
          title: 'Без совмещения рисунка',
          description:
            'Полотна можно отрезать подряд без подгонки рисунка.',
        },
        straight: {
          title: 'Рисунок повторяется одинаково',
          description:
            'Соседние полотна совмещаются на одной высоте.',
          hint: 'Прямое совмещение (straight match)',
        },
        'half-drop': {
          title: 'Рисунок смещается через полосу',
          description:
            'Каждое следующее полотно нужно сдвигать для совмещения рисунка.',
          hint: 'Смещённое совмещение (half-drop)',
        },
      },
    },
    labelHelper: {
      link: 'Как прочитать этикетку обоев?',
      title: 'Как прочитать этикетку обоев?',
      intro:
        'На этикетке часто встречаются такие обозначения. Это примеры — не полный стандарт.',
      disclaimer:
        'Обозначения могут немного отличаться у разных производителей.',
      close: 'Понятно',
      entries: [
        {
          mark: '53 см × 10,05 м',
          meaning: 'Ширина и длина рулона.',
        },
        {
          mark: '64 см',
          meaning: 'Рисунок повторяется каждые 64 см.',
        },
        {
          mark: '64/0',
          meaning: 'Прямое совмещение — полотна на одной высоте.',
        },
        {
          mark: '64/32',
          meaning: 'Повтор 64 см, соседнее полотно смещается на 32 см.',
        },
        {
          mark: '0',
          meaning: 'Рисунок совмещать не требуется.',
        },
      ],
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
      patternAppliedBadge: 'С учётом рисунка',
    },
    explanation: {
      toggleLabel: 'Как мы это посчитали?',
      toggleHintCollapsed: 'Нажмите, чтобы раскрыть пояснение',
      toggleHintExpanded: 'Нажмите, чтобы скрыть пояснение',
      trimHint:
        'Этот запас помогает компенсировать небольшую неровность потолка и пола.',
      phaseAssumptionNote:
        'Для обоев с рисунком фактический расход иногда зависит от того, с какого места рисунка начинается новый рулон. Поэтому при покупке лучше предусмотреть запас.',
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
        stripLengthWithPatternBody:
          'Высота стены — {wallHeight}. Добавили {topTrim} сверху и {bottomTrim} снизу на подрезку. Физическая длина полотна — {stripLength}.',
        patternAlignmentTitle: 'Учитываем рисунок',
        patternAlignmentBody:
          'Рисунок повторяется каждые {repeatSize}. Чтобы узор на соседних полотнах совпал, начало следующего полотна приходится брать с шагом {patternStep}.',
        patternAlignmentWithGapBody:
          'Рисунок повторяется каждые {repeatSize}. Чтобы узор на соседних полотнах совпал, начало следующего полотна приходится брать с шагом {patternStep}. Разница {alignmentGap} уходит на совмещение рисунка.',
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
        invalidCmFormat: 'Введите размер в сантиметрах, например 64',
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
          'Этот вариант расчёта пока недоступен.',
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
