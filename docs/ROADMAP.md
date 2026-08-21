# Roadmap — Calculator Platform

Phases are sequential; scope within each phase should not leak into earlier work.

## Phase 0 — Product & architecture ✅

- AGENTS.md, PRODUCT_STRATEGY, ARCHITECTURE, DECISIONS, ROADMAP
- ADR log for major choices

## Phase 1 — Foundation ✅

- Expo + Router + TypeScript + dev build readiness
- i18n, units, theme, service abstractions
- Placeholder wallpaper domain + minimal UI
- Jest, ESLint, typecheck scripts

## Phase 1.5 — Android dev environment ✅

- Git baseline
- JDK 17 + ANDROID_HOME session setup
- Reproducible `expo prebuild --clean`
- Gradle `assembleDebug` verification
- Emulator/device optional

## Phase 2 — Wallpaper calculation engine ✅

- Product spec: `docs/WALLPAPER_PRODUCT_SPEC.md`
- Strip-based pure TypeScript engine (quick mode + shared core)
- Straight pattern repeat; half-drop and openings deferred
- Reference scenario tests; recommendation policy separate from minimum rolls
- Phase 2.1 remediation + Codex re-audit cleanup complete

## Phase 3 — Wallpaper MVP UX ✅

- Quick calculation flow polished for RuStore
- User input adapter: locale decimal → integer mm
- Result presenter from `WallpaperCalculationTrace`
- Expandable “How we calculated” explanation
- Phase 3.1: direct launch, custom roll cm, single pattern entry point

## Phase 4A — Pattern match & label helper ✅

- Human-first pattern refinement sheet (straight match via existing domain)
- Roll label helper (examples, not exhaustive standard)
- Pattern explanation steps from trace
- Subtle wallpaper background experiment
- Half-drop: UI education only — calculation deferred

## Phase 4B1 — Precise geometry & strip planner ✅

- `calculatePreciseWallpaper()` — per-wall columns, openings, required segments
- Policy A conservative FFD roll plan (`plannedRolls`; free match + openings)
- Straight match without openings; straight + openings deferred
- Mixed wall heights; reference scenarios P1–P10; property invariants
- Spec: `docs/WALLPAPER_PRECISE_GEOMETRY_SPEC.md`

## Phase 4B2 — Precise Mode UX ✅

- Route `/precise` — walls, doors/windows, wall preview sketch
- Quick → Precise draft handoff; separate pattern vs precise entry cards
- Presenter: planned-roll wording, opening impacts, comparison copy
- Straight + openings blocked in UI before domain call
- Android decimal UX: parser accepts `,` and `.`; soft keyboard may use `.`
- RU summaries display meters with locale comma

## Phase 4B3+ — Remaining precise scope

- Half-drop calculation
- Safe offcut reuse (Policy B research)
- “Already have N rolls — enough?” in precise context

## Phase 5A — Product analytics foundation (complete)

- AppMetrica via `@appmetrica/react-native-analytics` behind `AnalyticsService`
- Privacy-first categorical event taxonomy (no raw dimensions)
- Dev/noop providers for local + Jest
- Spec: `docs/ANALYTICS.md`
- Native + AppMetrica console verified (custom events visible)
- **No advertising** in this phase

## Phase 5B — Share + PDF ✅

- «Поделиться расчётом» via **standard Android Share Sheet** (`ACTION_SEND` / Expo Sharing)
- Text result + detailed PDF report (`expo-print`)
- Russian-ecosystem friendly: MAX, email, VK, Telegram, WhatsApp, SMS when installed
- Spec: `docs/SHARING_AND_REPORTS.md`
- Share/PDF remain **free** (no rewarded gating)

## Phase 5C — Yandex Ads Foundation (current)

- Official `yandex-mobile-ads` behind `AdService` + `SafeAdService`
- Two non-sticky product banners after completed Quick/Precise results: `result_banner` and `footer_banner`
- Rewarded infrastructure + `__DEV__` test trigger only (not product-gated)
- Demo ad units in `__DEV__`; production units via env
- Spec: `docs/ADS.md`
- **Deferred:** interstitial, app-open, mediation, rewarded Share/PDF

## Phase 6 — Ads expansion (future)

- Mediation (RSЯ, VK Ads) after Phase 5C usage/revenue signal
- Optional rewarded for non-core extras only (never gate calculation)
- Frequency caps / additional placements as product decides

## Phase 7 — Product quality

- Persistent settings & last calculation
- Accessibility audit, edge cases, performance
- Privacy policy content, data handling

## Phase 8 — RuStore release

- Signing, AAB, store listing, screenshots
- Moderation fixes, production verification

## Phase 9 — Measurement

- Retention, ad metrics, revenue/install analysis
- Decide scale / pivot / iterate

## Phase 10 — Platform extraction

**Gate:** positive or learnable RPI from Wallpaper Calculator

- Extract reusable template/core
- Second niche app (e.g. Tile Calculator)
- Optional shared package — not before data

---

## Deferred product explorations

Captured during Phase 4B2 closeout; still valid.

### Share calculation

See Phase 5B — system Share Sheet first; PDF exploratory.

### Monetization

See Phase 6 — careful placements; rewarded only for extras; never block basic calculation.

---

**Current focus:** Phase 5B — Share + PDF. Do not start ads until usage data from 5A exists.
