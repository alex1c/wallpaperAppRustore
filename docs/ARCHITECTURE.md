# Architecture — Calculator Platform

## Stack

- **Expo SDK 57** + **React Native 0.86** + **TypeScript**
- **Expo Router** — file-based navigation under `src/app/`
- **Expo Development Build** — required path for future native SDKs (ads, AppMetrica)
- **Continuous Native Generation** via `expo prebuild`; avoid hand-edited native code until necessary
- **Android-first**; iOS/web not prioritized in Phase 0–1

## Layer diagram

```text
┌─────────────────────────────────────────────────────────┐
│  UI (src/app, src/features, src/components, src/theme)  │
└────────────┬───────────────────────────────┬────────────┘
             │                               │
             ▼                               ▼
┌────────────────────────┐      ┌──────────────────────────┐
│  i18n + units (UI side) │      │  AdService / Analytics   │
│  format & convert input │      │  PersistenceService      │
└────────────┬───────────┘      └────────────┬─────────────┘
             │ validated canonical values     │ interfaces only
             ▼                               ▼
┌─────────────────────────────────────────────────────────┐
│  Domain (src/domain/*) — pure TypeScript calculations   │
└─────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│  Future: Yandex Ads, AppMetrica, AsyncStorage/SQLite    │
└─────────────────────────────────────────────────────────┘
```

## Boundaries

### Calculation domain (`src/domain/`)

- Pure functions, typed inputs/outputs
- No React, Expo, ads, analytics, or UI imports
- Unit tests live next to domain code
- Canonical length: **millimeters**; area: **square millimeters**
- **Strip-based** roll count (not area-based); see `docs/WALLPAPER_PRODUCT_SPEC.md`
- Quick mode: `QuickRoomInput` → `Wall[]` → `calculateWallpaper()`

### Advertising (`src/services/ads/`)

```text
UI → AdService → provider (Noop now → Yandex later)
```

Planned production: Yandex Mobile Ads → Mediation → RSЯ + VK Ads.

### Analytics (`src/services/analytics/`)

```text
UI / domain hooks → AnalyticsService → AppMetrica (Phase 5)
```

Semantic events: `app_open`, `calculation_start`, `calculation_complete`, `result_view`, etc.

### Persistence (`src/services/persistence/`)

Interface-only in Phase 0–1 with in-memory implementation.
Future: `@react-native-async-storage/async-storage` or similar without UI changes.

### Localization (`src/i18n/`)

- RU primary catalog; EN structurally supported
- `formatNumber` / area formatters respect active locale
- Measurement **units** are not embedded in translated strings as business logic

### Configuration (`src/config/`)

- Static product config in `app-config.ts`
- Public env vars via `EXPO_PUBLIC_*` in `env.ts`
- `.env.example` documents placeholders; real secrets stay local

## Navigation

| Route | Screen |
|-------|--------|
| `/` | Home — platform intro, link to calculator |
| `/wallpaper` | Wallpaper calculator placeholder (quick mode demo) |

## Native SDK plan (deferred)

| SDK | Phase | Integration point |
|-----|-------|-------------------|
| Yandex Mobile Ads | 5 | `YandexAdService implements AdService` |
| AppMetrica | 5 | `AppMetricaAnalyticsService implements AnalyticsService` |

Validate each SDK in a **development build** before store release.

## Future extraction (Phase 9)

When Wallpaper Calculator economics are proven:

1. Extract stable `services/`, `theme/`, `i18n` patterns into a template repo or shared package
2. Clone for Tile Calculator, Concrete Calculator, etc.
3. Keep separate `app.json` / store listings per product

**No premature monorepo** — clean module boundaries in this repo first.

## Testing strategy

- **Unit tests** — domain math (mandatory)
- **Smoke test** — config/boot sanity
- **Lint + typecheck** — CI-ready scripts
- **E2E** — not in Phase 0–1

## Development build workflow

Expo Go is **not** the target runtime.

```bash
npx expo prebuild --platform android
npx expo run:android
```

Requires JDK, Android SDK, and optionally a device/emulator.
