export {
  centimetersToMillimeters,
  metersToMillimeters,
  millimetersToCentimeters,
  millimetersToMeters,
  rectangleAreaMm,
} from './length'

export {
  METER_INPUT_MAX_DECIMAL_PLACES,
  normalizeDecimalInput,
  parseCentimetersInputToMillimeters,
  parseMetersInputToMillimeters,
} from './parse-decimal-input'

export type {
  ParseDecimalInputErrorCode,
  ParseDecimalInputResult,
} from './parse-decimal-input'

export {
  filterDecimalInputText,
  filterIntegerInputText,
} from './decimal-input-text'

export type { Millimeters, SquareMillimeters } from './length'
