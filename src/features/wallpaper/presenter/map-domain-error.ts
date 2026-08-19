import type { WallpaperCalculationErrorCode } from '@/domain/wallpaper'

/** i18n key under `wallpaper.errors.domain` for a domain calculation error. */
export type DomainErrorMessageKey =
  | 'invalidDimension'
  | 'stripLongerThanRoll'
  | 'invalidPattern'
  | 'unsupportedFeature'
  | 'inputOverflow'
  | 'invalidInput'
  | 'generic'

/**
 * Maps domain error codes to stable i18n keys.
 * Presenter never exposes raw `error.message` to users.
 */
export function mapDomainErrorToMessageKey(
  code: WallpaperCalculationErrorCode,
): DomainErrorMessageKey {
  switch (code) {
    case 'INVALID_DIMENSION':
      return 'invalidDimension'
    case 'STRIP_LONGER_THAN_ROLL':
      return 'stripLongerThanRoll'
    case 'INVALID_REPEAT':
    case 'INVALID_PATTERN_MATCH':
    case 'INCONSISTENT_PATTERN_CONFIG':
    case 'UNSUPPORTED_PATTERN_MATCH':
      return 'invalidPattern'
    case 'UNSUPPORTED_DIFFERENT_WALL_HEIGHTS':
      return 'unsupportedFeature'
    case 'INPUT_OVERFLOW':
      return 'inputOverflow'
    case 'INVALID_INPUT_STRUCTURE':
      return 'invalidInput'
    default:
      return 'generic'
  }
}
