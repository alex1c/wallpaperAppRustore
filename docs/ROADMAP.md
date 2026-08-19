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

## Phase 4A — Pattern match & label helper (current)

- Human-first pattern refinement sheet (straight match via existing domain)
- Roll label helper (examples, not exhaustive standard)
- Pattern explanation steps from trace
- Subtle wallpaper background experiment
- Half-drop: UI education only — calculation deferred

## Phase 4B — Precise calculation (next)

- Per-wall mode, half-drop calculation, cut visualization
- Doors/windows, roll cut planning
- “Already have N rolls — enough?” mode

## Phase 5 — Ads & analytics

- Yandex Mobile Ads + mediation (RSЯ, VK Ads)
- AppMetrica production integration
- Ad frequency caps, rewarded flows
- Wire `ad_impression`, revenue-related events

## Phase 6 — Product quality

- Persistent settings & last calculation
- Accessibility audit, edge cases, performance
- Privacy policy content, data handling

## Phase 7 — RuStore release

- Signing, AAB, store listing, screenshots
- Moderation fixes, production verification

## Phase 8 — Measurement

- Retention, ad metrics, revenue/install analysis
- Decide scale / pivot / iterate

## Phase 9 — Platform extraction

**Gate:** positive or learnable RPI from Wallpaper Calculator

- Extract reusable template/core
- Second niche app (e.g. Tile Calculator)
- Optional shared package — not before data

---

**Current focus:** Phase 4A pattern refinement UX on committed Phase 3 Quick Mode.
