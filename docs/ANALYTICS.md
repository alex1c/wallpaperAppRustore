# Product Analytics — Phase 5A

> Privacy-first product analytics for Wallpaper Calculator (RuStore / Android-first).

## Provider

| Item | Choice |
|------|--------|
| SDK | `@appmetrica/react-native-analytics` (official AppMetrica React Native plugin) |
| Compatibility | Peer `react-native >= 0.76 < 1.0` — project uses RN **0.86** / Expo SDK **57** |
| Integration | Development Build + autolinking (no custom Expo config plugin required) |
| Abstraction | `AnalyticsService` in `src/services/analytics/` |
| Adapter | `AppMetricaAnalyticsService` — UI must not import AppMetrica directly |

## Initialization

- Bootstrapped once from `initializeAppServices()` (`src/bootstrap.ts` → `src/services/index.ts`).
- Missing / placeholder API key → `DevAnalyticsService` (console logs in `__DEV__` only).
- Jest → `NoopAnalyticsService` (no network / native calls).
- Real key → AppMetrica `activate()` with `locationTracking: false`, `advIdentifiersTracking: false`.
- All providers wrapped in `SafeAnalyticsService` — analytics failures never break calculation or navigation.

## Configuration

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_APPMETRICA_API_KEY` | AppMetrica application API key |
| `EXPO_PUBLIC_ANALYTICS_DEV_MODE` | Force console logging for the dev provider |

**API key treatment:** AppMetrica documents the key as the unique application id issued at app registration. It is embedded in the client binary (not a private server credential), but production keys must still stay out of git (`.env` / CI only). See `.env.example`.

## Event taxonomy (custom params)

Custom parameters are **categorical / boolean / count-buckets only**.

| Event | Trigger | Safe properties |
|-------|---------|-----------------|
| `app_open` | Service bootstrap | — |
| `screen_view` | Provider screen helper | `screen`: `quick_calculator` \| `precise_calculator` |
| `quick_calculation_completed` | Quick calc success | `pattern`, `roll`, `result_roll_bucket` |
| `quick_calculation_failed` | Quick validation/domain failure | `error_category` |
| `precise_opened` | Precise screen mount | `source`, `wall_count_bucket` |
| `precise_calculation_completed` | Precise calc success | `pattern`, `roll`, `has_openings`, wall/opening/result buckets |
| `precise_calculation_failed` | Precise validation/unsupported/domain failure | `error_category`, `has_openings` |
| `pattern_refinement_opened` | Pattern sheet opened | `mode` |
| `pattern_calculation_completed` | Pattern sheet produced a Quick result | `mode`, `pattern`, `result_roll_bucket` |
| `pattern_calculation_blocked` | Half-drop / straight+openings / validation | `mode`, `pattern`, `block_reason` |
| `opening_added` / `opening_removed` | Opening list mutation | `opening_type`, `opening_count_bucket` |
| `explanation_opened` | User expands explanation | `mode` |
| `quick_to_precise` / `precise_to_quick` | Mode navigation | wall bucket on handoff |

### Deliberately excluded from custom events

Exact room/wall/opening dimensions, coordinates, free-text input, calculation contents, PDFs, emails, phones, names, location, clipboard, contacts, advertising identifiers collected by **application** code.

### SDK-level collection caveat

AppMetrica’s native SDK may collect device/network/session technical data according to Yandex AppMetrica’s own policy. That is distinct from **application custom event parameters**. Do not claim “no personal data is collected” solely based on our event taxonomy.

## Tests

- Jest uses `NoopAnalyticsService` by default.
- `RecordingAnalyticsService` verifies taxonomy contracts.
- AppMetrica adapter tests inject a fake SDK loader (no native module).

## Advertising

**NOT IMPLEMENTED in Phase 5A/5B.** No ad SDKs, placements, or fake ad events.

## Share / PDF (Phase 5B)

Implemented — see `docs/SHARING_AND_REPORTS.md`.

Events:

- `share_opened`
- `text_share_sheet_opened`
- `pdf_generation_started` / `pdf_generation_completed` / `pdf_generation_failed`
- `pdf_share_sheet_opened`

**No `share_completed`** — Android Share Sheet open is not proof of send.

Custom params remain categorical (`mode`, `pattern`, `has_openings`, `error_category`). Report bodies never enter analytics.

## Native rebuild

Installing `@appmetrica/react-native-analytics` requires regenerating/rebuilding the Android development client (`npx expo prebuild` / `npx expo run:android`) before production AppMetrica activate works on device.

## Development verification

`AppMetricaAnalyticsService` passes `logs: __DEV__` to native `activate()`. In development builds this enables AppMetrica SDK logcat (`AppMetrica` tag) for init/send diagnostics. Production builds keep SDK logs off. Never log the API key from application code.
