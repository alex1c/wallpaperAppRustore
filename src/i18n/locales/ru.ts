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
    patternEntry: {
      title: 'На обоях есть рисунок? Уточнить расчёт →',
      subtitle: 'Учтём повтор рисунка и маркировку с этикетки',
    },
    preciseEntry: {
      title: 'Сделать расчёт точнее →',
      subtitle: 'Учесть размеры отдельных стен, двери и окна',
    },
    precise: {
      screenTitle: 'Точный расчёт',
      back: 'Назад',
      intro: 'Уточните размеры стен и добавьте двери или окна, если нужно.',
      sections: {
        walls: 'Стены',
        openings: 'Двери и окна',
        wallpaper: 'Обои',
      },
      walls: {
        wallTitle: 'Стена {number}',
        width: 'Ширина',
        height: 'Высота',
        addWall: '+ Добавить стену',
        removeWall: 'Удалить',
        removeWallHint: 'Удалить эту стену из расчёта',
      },
      openings: {
        emptyTitle: 'Дверей и окон пока нет',
        emptyBody:
          'Если добавить их размеры, расчёт сможет точнее оценить площадь оклейки.',
        addDoor: '+ Добавить дверь',
        addWindow: '+ Добавить окно',
        editDoor: 'Дверь',
        editWindow: 'Окно',
        remove: 'Удалить',
        removeHint: 'Удалить проём из расчёта',
        doorLabel: 'Дверь',
        windowLabel: 'Окно',
        onWall: 'На какой стене',
        width: 'Ширина',
        height: 'Высота',
        offsetFromLeft: 'От левого края стены',
        offsetFromLeftHint:
          'Измерьте расстояние от левого края выбранной стены до начала проёма.',
        offsetFromFloor: 'От пола',
        offsetFromFloorHint:
          'Измерьте расстояние от пола до нижнего края окна.',
        save: 'Сохранить',
        cancel: 'Отмена',
        previewLabel: 'Схема стены',
        previewHint: 'Проверьте, что проём расположен так, как вы измерили.',
      },
      wallpaper: {
        rollSummary: 'Размер рулона',
        changeRoll: 'Изменить',
        rollDone: 'Готово',
        patternSummary: 'Рисунок',
        noPattern: 'Без учёта рисунка',
        changePattern: 'Изменить',
      },
      calculate: 'Рассчитать',
      unsupportedPatternWithOpenings:
        'Точный расчёт дверей и окон для обоев с совмещением рисунка пока не поддерживается. Можно рассчитать стены без проёмов или выполнить расчёт без учёта рисунка.',
      result: {
        plannedHeading: 'По расчётному раскрою',
        plannedHelper:
          'Расчёт использует практичный консервативный раскрой. При ручной оптимизации остатков иногда можно использовать материал ещё эффективнее.',
        coverageAreaLabel: 'Площадь оклейки',
        conservativeNote:
          'Мы используем консервативный вариант раскроя, чтобы не занизить количество материала. Опытный мастер иногда сможет использовать остатки эффективнее.',
        openingImpactsTitle: 'Что изменили проёмы',
        wallCount: { one: 'стена', few: 'стены', many: 'стен' },
        doorCount: { one: 'дверь', few: 'двери', many: 'дверей' },
        windowCount: { one: 'окно', few: 'окна', many: 'окон' },
        openingImpact: {
          doorOnWall: 'Дверь на стене {wallNumber}',
          windowOnWall: 'Окно на стене {wallNumber}',
          areaNotNeeded: 'Не нужно оклеивать: {area}',
        },
        comparison: {
          title: 'Сравнение с расчётом без проёмов',
          reducedBody:
            'Без учёта дверей и окон: {baselineRolls} рул. С учётом: {actualRolls} рул. Площадь оклейки уменьшилась на {areaSaved}.',
          unchangedBody:
            'Количество рулонов не изменилось ({rolls} рул.), но площадь оклейки уменьшилась на {areaSaved}.',
          increasedBody:
            'Проём уменьшил площадь оклейки на {areaSaved}, но из-за раскроя по расчётному плану понадобилось {actualRolls} рул. вместо {baselineRolls}.',
        },
      },
      explanation: {
        toggleLabel: 'Как мы это посчитали?',
        toggleHintCollapsed: 'Нажмите, чтобы раскрыть пояснение',
        toggleHintExpanded: 'Нажмите, чтобы скрыть пояснение',
        openingCount: { one: 'проём', few: 'проёма', many: 'проёмов' },
        steps: {
          wallsTitle: 'Разбили комнату на стены',
          wallsBody:
            'Указано {wallCount} стен. Общая площадь оклейки — {totalArea}.',
          columnsTitle: 'Учли ширину рулона',
          columnsBody:
            'На стенах определили {columnCount} вертикальных полотен по ширине рулона.',
          openingsTitle: 'Учли двери и окна',
          openingsBody:
            'Добавлено {openingCount}. Площадь оклейки уменьшилась на {areaSaved}.',
          segmentsTitle: 'Подготовили отрезки',
          segmentsBody:
            'Для участков над, под и рядом с проёмами нужны отдельные куски обоев с запасом на подрезку.',
          rollPlanTitle: 'Разместили отрезки по рулонам',
          rollPlanBody: 'По расчётному раскрою потребуется {plannedRolls}.',
          conservativeTitle: 'Почему это не всегда самый экономный раскрой',
          conservativeBody:
            'Мы используем безопасный вариант раскроя, чтобы не занизить количество материала. Опытный мастер иногда сможет использовать остатки эффективнее.',
        },
      },
      errors: {
        openingOutsideWall: 'Проём выходит за границы стены.',
        overlappingOpenings: 'Эти проёмы пересекаются.',
        offsetTooWide:
          'Расстояние от левого края и ширина проёма больше ширины стены.',
        doorTooTall: 'Высота двери больше высоты стены.',
      },
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
        'Расчёт для рисунка со смещением пока недоступен — мы не хотим показать неточный результат. Маркировку 64/32 можно посмотреть в подсказке по этикетке.',
      options: {
        free: {
          title: 'Рисунок совмещать не нужно',
          description:
            'Одно полотно можно отрезать сразу после другого.',
        },
        straight: {
          title: 'Рисунок нужно совмещать',
          description:
            'Рисунок на соседних полотнах должен находиться на одной высоте.',
        },
        'half-drop': {
          title: 'Рисунок со смещением',
          description:
            'Каждое следующее полотно клеится со сдвигом рисунка.',
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
        openingOutsideWall: 'Проём выходит за границы стены.',
        overlappingOpenings: 'Эти проёмы пересекаются.',
        generic: 'Не удалось выполнить расчёт. Проверьте введённые данные.',
      },
      general: 'Исправьте ошибки в форме и попробуйте снова.',
    },
  },
  common: {
    back: 'Назад',
  },
}
