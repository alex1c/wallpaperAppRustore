# Calculator Platform — Wallpaper Calculator

> **Source of truth for AI agents and developers.** Read this file before substantial work.

## What this is

Commercial **Calculator Platform** — a family of separate niche Android calculator apps.
The first product is **Калькулятор обоев** (Wallpaper Calculator).

**Business goal:** validate ad-monetized niche calculators on **RuStore (Russia-first)** and measure **Revenue per Install**.

## Current phase

**Phase 6 — RuStore release preparation** (in progress, uncommitted)

Prepare first production Android release artifact and listing prerequisites.
**Do NOT** publish to RuStore or commit keystores/secrets. See `docs/RUSTORE_RELEASE.md`.

## Tech stack (pinned at project creation)

| Layer | Choice |
|-------|--------|
| Runtime | Expo SDK 57, React Native 0.86, React 19 |
| Navigation | Expo Router (file-based, `src/app/`) |
| Target | Android-first, **Development Build** (not Expo Go) |
| Language | TypeScript (strict) |
| Tests | Jest + jest-expo |
| Lint | ESLint (eslint-config-expo) |

Verify exact versions in `package.json` after install.

## Architecture rules

1. **UI** must not import Yandex/AppMetrica/native ad SDKs directly.
2. **Domain/calculation** code lives in `src/domain/` — pure TypeScript, no React/Expo.
3. **Ads** go through `AdService` (`src/services/ads/`).
4. **Analytics** go through `AnalyticsService` (`src/services/analytics/`).
5. **Persistence** goes through `PersistenceService` (`src/services/persistence/`).
6. **User-facing strings** only via `src/i18n/` — no hardcoded copy in components.
7. **Canonical units** in domain are **millimeters**; UI converts/displays (see `src/units/`).
8. **No monorepo** until first app economics are validated (Phase 9).
9. **No secrets** in git — use `.env.example` + local `.env` (gitignored).

## Do NOT

- Commit or push without explicit user instruction
- Add production ad unit IDs, AppMetrica keys, or API secrets
- Add Redux, heavy UI kits, or databases without a concrete task
- Implement full wallpaper formulas, OCR, payments, or backend in Phase 0–1
- Depend on Expo Go as the primary runtime (native SDKs coming in Phase 5)
- Silently override documented decisions — update `docs/DECISIONS.md` instead

## Read next

| Document | Purpose |
|----------|---------|
| [docs/PRODUCT_STRATEGY.md](docs/PRODUCT_STRATEGY.md) | Portfolio vision, market, metrics |
| [docs/WALLPAPER_PRODUCT_SPEC.md](docs/WALLPAPER_PRODUCT_SPEC.md) | Product spec — calculation model, modes, deferred scope |
| [docs/WALLPAPER_PRECISE_GEOMETRY_SPEC.md](docs/WALLPAPER_PRECISE_GEOMETRY_SPEC.md) | Phase 4B1 precise geometry, segments, roll planner |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layer boundaries and diagrams |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phased delivery plan |
| [docs/DECISIONS.md](docs/DECISIONS.md) | ADR log — architectural decisions |
| [docs/ANALYTICS.md](docs/ANALYTICS.md) | Phase 5A AppMetrica taxonomy, privacy, config |
| [docs/SHARING_AND_REPORTS.md](docs/SHARING_AND_REPORTS.md) | Phase 5B Share Sheet + text/PDF reports |
| [docs/ADS.md](docs/ADS.md) | Phase 5C Yandex Ads foundation, placements, privacy |
| [docs/RUSTORE_RELEASE.md](docs/RUSTORE_RELEASE.md) | Phase 6 RuStore release prep, signing, listing checklist |
| [docs/RUSTORE_LISTING.md](docs/RUSTORE_LISTING.md) | Store copy, screenshots, category/age |
| [docs/PRIVACY_POLICY_RU.md](docs/PRIVACY_POLICY_RU.md) | Privacy policy (RU; host before submit) |
| [README.md](README.md) | Setup, scripts, project structure |

> Before doing substantial work, read **AGENTS.md** and the documents it references.
> Do not override documented architectural/product decisions silently.
> If a decision must change, update **DECISIONS.md** with the reason.

## Validation commands

```bash
npm install
npm run lint
npm run typecheck
npm test
npx expo-doctor
npx expo prebuild --platform android --clean
cd android && ./gradlew assembleDebug   # requires JDK 17 + ANDROID_HOME
npx expo run:android                    # requires device/emulator
```

## Local Android environment (Windows)

Set per shell session before native builds:

```powershell
$env:JAVA_HOME = "<path-to-jdk-17>"   # NOT Android Studio JBR 25 — see docs/DECISIONS.md
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
```

Android Studio install: `D:\AndroidStudio` (bundled JBR is Java 25 — incompatible with RN CMake tasks; install JDK 17 separately).

Generated `android/` and `ios/` are **not** source of truth — regenerate via `expo prebuild`.

## Entry points

- App entry: `index.ts` → `src/bootstrap.ts` (services) → `expo-router/entry`
- Routes: `src/app/`
- Product config: `src/config/app-config.ts`
- Env placeholders: `.env.example`, `src/config/env.ts`
