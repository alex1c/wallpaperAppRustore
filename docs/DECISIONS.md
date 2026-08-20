# Architecture Decision Log

Lightweight ADR format. New decisions append at the bottom.

---

## 2026-08-18 — Expo instead of bare React Native

**Status:** Accepted

**Context:** Need fast Android iteration, native SDK support later, small team.

**Decision:** Use Expo with prebuild/CNG rather than bare React Native.

**Why:** Official native module workflow, Router, and dev builds reduce maintenance while staying compatible with Yandex/AppMetrica SDKs via config plugins or custom dev clients.

**Consequences:** Must use development builds for native SDK testing; Expo Go is not the primary target.

---

## 2026-08-18 — Expo Development Build instead of Expo Go

**Status:** Accepted

**Context:** Ad and analytics SDKs require native code.

**Decision:** Target `expo-dev-client` and `expo run:android` workflows.

**Why:** Expo Go cannot host arbitrary native monetization/analytics modules.

**Consequences:** Developers need Android SDK + JDK; slightly longer first build.

---

## 2026-08-18 — Android / RuStore first

**Status:** Accepted

**Context:** Primary market is Russia; RuStore is the first distribution channel.

**Decision:** Android-first; defer iOS and international store polish.

**Why:** Focus resources on one store and one platform until RPI is measured.

**Consequences:** iOS config exists minimally in app.json but is not validated in Phase 0–1.

---

## 2026-08-18 — Separate niche apps vs one mega-app

**Status:** Accepted

**Context:** ASO and user intent favor focused apps.

**Decision:** Ship many small apps sharing engineering patterns, not one “100 calculators” app.

**Why:** Better store conversion, clearer marketing, independent kill/scale per niche.

**Consequences:** Some duplication until Phase 9 extraction; boundaries must stay clean now.

---

## 2026-08-18 — Pure TypeScript calculation layer

**Status:** Accepted

**Context:** Calculator correctness is core product value.

**Decision:** All business math in `src/domain/` as pure TypeScript.

**Why:** Testable without RN; reusable in future shared packages.

**Consequences:** UI must validate/convert inputs before calling domain functions.

---

## 2026-08-18 — Advertising behind AdService

**Status:** Accepted

**Context:** Yandex stack is likely but not final; UI must stay provider-agnostic.

**Decision:** `AdService` interface + noop dev implementation in Phase 0–1.

**Why:** Swap providers without rewriting screens.

**Consequences:** Phase 5 adds `YandexAdService` without UI churn.

---

## 2026-08-18 — Analytics behind AnalyticsService

**Status:** Accepted

**Context:** AppMetrica planned for RU release.

**Decision:** Semantic events via `AnalyticsService`; dev logger now, AppMetrica later.

**Why:** Same boundary pattern as ads; enables testing without SDK.

**Consequences:** Phase 5 implements real sender behind the same API.

---

## 2026-08-18 — Russian first, internationalization ready

**Status:** Accepted

**Context:** RU is primary UX; EN and other locales are future.

**Decision:** All strings in i18n catalogs; RU complete for foundation screens; EN partial.

**Why:** Avoid retrofitting i18n after UI is built.

**Consequences:** No hardcoded user-visible strings in components.

---

## 2026-08-18 — No premature monorepo

**Status:** Accepted

**Context:** Platform vision spans many apps; economics unproven.

**Decision:** Single repo, clear folders, extract only after Wallpaper RPI data.

**Why:** Monorepo overhead before validation slows the first experiment.

**Consequences:** Copy/template extraction in Phase 9 if metrics justify it.

---

## 2026-08-18 — No App Open Ads in initial monetization

**Status:** Accepted

**Context:** Aggressive ads hurt retention and store ratings.

**Decision:** Banner + capped interstitial + optional rewarded; exclude App Open Ads from MVP plan.

**Why:** Protect D1 retention while still pursuing ad revenue.

**Consequences:** Revenue model relies on in-session impressions, not launch intercepts.

---

## 2026-08-18 — npm legacy-peer-deps on Windows external drive

**Status:** Superseded (2026-08-18)

**Context:** npm strict peer resolution failed on react-dom vs react 19.2.x during Phase 0–1 setup.

**Decision:** ~~Add `.npmrc` with `legacy-peer-deps=true`~~ Removed in Phase 1.5.

**Why removed:** With npm 11 and current Expo SDK 57 tree, `npm install` completes successfully without `legacy-peer-deps`. npm emits `ERESOLVE overriding peer dependency` for `react-dom@19.2.8` (transitive via `expo-router`) vs pinned `react@19.2.3` — this is expected for Android-first apps without `react-dom` as a direct dependency.

**Consequences:** Do not re-add `.npmrc` unless a future npm/dependency upgrade blocks install again. Root conflict: `expo-router` → `@expo/metro-runtime` → `react-dom@19.2.8` requires `react@^19.2.8`; Expo SDK 57 pins `react@19.2.3`.

---

## 2026-08-18 — JDK 17 required for Android native builds

**Status:** Accepted

**Context:** Android Studio at `D:\AndroidStudio` ships JBR **Java 25.0.2**. Gradle `assembleDebug` fails on CMake configure tasks (`react-native-screens`, `react-native-worklets`) with: `WARNING: A restricted method in java.lang.System has been called`.

**Decision:** Use **JDK 17** for Android builds (`JAVA_HOME`). Do not use Android Studio bundled JBR 25 for Gradle/CMake.

**Why:** React Native 0.86 / Expo SDK 57 native modules require a JDK compatible with Android Gradle Plugin and CMake tooling; Java 25 restrictions break native configure steps.

**Consequences:** Install JDK 17 (e.g. Eclipse Temurin 17) and set `$env:JAVA_HOME` per shell session. Android Studio IDE can still use its bundled JBR for the IDE itself.

**Verified SDK components** (auto-installed during first Gradle run): Platform 36, Build-Tools 35.0.0 & 36.0.0, NDK 27.1.12297006, CMake 3.22.1.

---

## 2026-08-18 — Node.js version for Expo SDK 57

**Status:** Accepted

**Context:** Machine runs Node 24.14.0; Expo SDK 57 minimum is Node 22.13.x.

**Decision:** Node 24 works for JS tooling today; **recommend Node 22 LTS** for long-term stability when convenient. Do not force global downgrade without version manager.

**Why:** Expo documents minimum 22.13.x; LTS reduces toolchain surprise. No version manager detected on this machine.

**Consequences:** Document in README; revisit if Expo/RN tooling reports Node 24 incompatibilities.

---

## 2026-08-18 — Jest node environment for domain tests (Phase 0–1)

**Status:** Accepted

**Context:** jest-expo requires full react-native install integrity; domain tests are pure TypeScript.

**Decision:** Use Jest with `testEnvironment: 'node'` and babel-jest for Phase 0–1; reserve jest-expo for component tests in Phase 3+.

**Why:** Reliable unit tests for calculation engine without RN runtime.

**Consequences:** UI/component tests will need jest-expo configuration later.

---

## 2026-08-18 — Canonical length unit: millimeters

**Status:** Accepted

**Context:** Wallpaper math needs precision; RU users often think in cm/m.

**Decision:** Domain stores lengths in mm; UI converts from cm for input/display.

**Why:** Integer-friendly, consistent area math, clear conversion boundary.

**Consequences:** All domain APIs use `Millimeters` / `SquareMillimeters` branded types.

---

## 2026-08-18 — Strip-based wallpaper calculation (Phase 2)

**Status:** Accepted

**Context:** Phase 0–1 used an area-based placeholder with a flat waste percentage. Product spec requires counting whole vertical strips, explicit roll usage, and separated minimum vs recommended rolls.

**Decision:** Replace area-based roll estimate with a strip-based engine in `src/domain/wallpaper/`. Quick mode normalizes rectangular room → `Wall[]` → shared `calculateWallpaper()`.

**Formulas (quick mode):**

- `requiredStrips = ceil(perimeter / rollWidth)`
- `rawStripLength = maxWallHeight + topTrim + bottomTrim`
- `effectiveStripLength = rawStripLength` (free) or `ceil(raw / repeat) × repeat` (straight)
- `stripsPerFullRoll = floor(rollLength / effectiveStripLength)`
- `minimumRolls = ceil(requiredStrips / stripsPerFullRoll)`

**Why:** Matches how wallpaper is actually cut and purchased; enables explainable `rollUsage` and independent reference tests.

**Consequences:** Area remains informational only. Recommendation policy lives in `recommendRolls()`, not in the core. Half-drop and opening geometry remain deferred.

---

## 2026-08-18 — Default trim allowance 50 mm top + 50 mm bottom

**Status:** Accepted

**Context:** Quick mode needs a conservative default when the user does not specify trim.

**Decision:** `DEFAULT_TRIM_ALLOWANCE`: top 50 mm, bottom 50 mm (total 100 mm). Documented in `WALLPAPER_PRODUCT_SPEC.md`.

**Why:** Typical cutting/leveling margin at ceiling and floor without overstating waste.

**Consequences:** Precise mode (Phase 4) may expose user-editable trim; domain accepts explicit `TrimAllowance`.

---

## 2026-08-18 — Spare roll recommendation policy (Phase 2 initial)

**Status:** Accepted

**Context:** Product must distinguish mathematical minimum from purchase recommendation without hiding +10% in the core.

**Decision:** `recommendRolls(minimumRolls)`: when `minimumRolls >= 2`, recommend `minimumRolls + 1` spare with reason codes (`SPARE_FOR_*`); when `minimumRolls === 1`, no spare.

**Why:** Allows UI copy “Minimum: N / For spare: N+1” with explicit product reasons.

**Consequences:** Policy is adjustable without changing calculation core; reason codes are domain enums, not UI strings.

---

## 2026-08-18 — Physical straight-match roll planner (Phase 2.1)

**Status:** Accepted

**Context:** Codex audit found `floor(rollLength / patternStep)` conflates alignment step with physical cut length and over-counts material; trailing alignment gap after the last strip was wrongly included.

**Decision:** Separate `rawStripLengthMm` (physical cut) from `patternStepMm` (start-to-start alignment). Count strips with greedy placement: next start += patternStep while `start + raw <= rollLength`. Each new roll assumes pattern phase zero.

**Why:** Matches real cutting; regression `raw=2800, step=3200, roll=9200` → 3 strips ending at 9200.

**Consequences:** `MaterialBreakdown` replaces opaque `WasteMetrics`. `patternPhase.minimumRollsDependsOnPhaseAssumption` documents limitation.

---

## 2026-08-18 — Quick-mode corner allowance policy (Phase 2.1)

**Status:** Accepted

**Context:** `ceil(perimeter / rollWidth)` under-counts at inside corners without explicit policy.

**Decision:** Add `CornerAllowancePolicy.totalCornerAllowanceMm`; default quick mode **80 mm** (4 × 20 mm). Applied to `adjustedWallWidthMm` before strip count. Not embedded in wall dimensions.

**Why:** Conservative, explainable, adjustable without formula hacks.

**Consequences:** Trace exposes corner allowance for UI copy. Exact-boundary tests use `ZERO_CORNER_POLICY`.

---

## 2026-08-18 — Uniform wall heights only in Phase 2.1 engine

**Status:** Accepted

**Context:** Silent `max(height)` across arbitrary `Wall[]` produced incorrect results for mixed-height inputs.

**Decision:** Reject differing heights with `UNSUPPORTED_DIFFERENT_WALL_HEIGHTS`. Quick mode still works (normalizer sets uniform height).

**Why:** Safe failure beats silent wrong roll count until per-wall planner exists.

**Consequences:** Phase 4 per-wall layout required before mixed-height precise mode.

---

## 2026-08-18 — Safe integer canonical millimeters (Phase 2.1)

**Status:** Accepted

**Context:** Product spec declares integer mm; runtime accepted floats and non-safe integers.

**Decision:** All canonical length inputs must pass `Number.isSafeInteger()` at domain boundary. Trim allows `>= 0`; walls/roll require `> 0`.

**Why:** Prevents drift and matches spec; UI adapter must round before calling domain.

**Consequences:** Fractional meter inputs from UI must be converted/rounded in adapter layer.

---

## 2026-08-19 — UI meter input rounding to integer mm (Phase 3)

**Status:** Accepted

**Context:** RU users enter room dimensions in meters with comma decimals; domain requires integer mm.

**Decision:** `parseMetersInputToMillimeters()` normalizes comma/dot, parses to finite number, then `Math.round(meters * 1000)`. Extra decimal precision beyond 3 places is rounded silently to the nearest mm.

**Why:** Predictable conversion at the UI boundary; no fractional mm in domain.

**Consequences:** Documented in `src/units/parse-decimal-input.ts`; unit tests cover comma, dot, and rounding.

---

## 2026-08-19 — Wallpaper result presenter layer (Phase 3)

**Status:** Accepted

**Context:** Phase 2 trace is developer-oriented; UI needs human copy without duplicating formulas.

**Decision:** `src/features/wallpaper/presenter/` builds localized UI models from domain results and `WallpaperCalculationTrace` only. Minimum rolls and strip counts pass through unchanged.

**Why:** Keeps calculation engine pure; explanation stays explainable and testable without React.

**Consequences:** i18n templates use `{placeholder}` interpolation; domain error codes map to user messages in presenter.

---

## 2026-08-19 — Roll presets as UI config (Phase 3)

**Status:** Accepted

**Context:** Quick Mode needs popular roll sizes without hardcoding in the calculation engine.

**Decision:** Presets live in `src/config/wallpaper-roll-presets.ts`; selecting a preset injects canonical mm into domain input.

**Why:** Separates product UX defaults from domain math.

**Consequences:** Custom roll size uses the same meter input adapter as room dimensions.

---

## 2026-08-19 — Human-first pattern terminology (Phase 4A)

**Status:** Accepted

**Context:** Users do not know terms like rapport, straight match, or half-drop.

**Decision:** Primary UI copy uses plain language (“Повтор рисунка”, “Рисунок повторяется одинаково”). Professional terms appear only as secondary hints. Repeat input uses cm → integer mm adapter.

**Why:** RuStore DIY audience; progressive disclosure from Quick Mode.

**Consequences:** Pattern refinement lives in a separate sheet; Quick form unchanged.

---

## 2026-08-19 — Half-drop UI-only in Phase 4A (Phase 4A)

**Status:** Accepted

**Context:** Domain rejects half-drop (`UNSUPPORTED_PATTERN_MATCH`); implementing a fake UI calculation would violate Phase 2 correctness rules.

**Decision:** Half-drop is selectable for education (label helper explains 64/32) but calculation is blocked with honest deferred messaging. No numeric result.

**Why:** Correctness over feature checkbox; half-drop domain research deferred to Phase 4B.

**Consequences:** `parsePatternForm()` returns `halfDropDeferred`; regression tests enforce no false numeric output.

---

## 2026-08-19 — Subtle wallpaper background (Phase 4A experiment)

**Status:** Accepted (experimental)

**Context:** Product idea for decorative wallpaper-like background without harming readability.

**Decision:** Local lightweight diagonal line pattern via `WallpaperBackground` component (`rgba` blue at 4% opacity). Content cards remain opaque white surfaces.

**Why:** No remote assets or new dependencies; easy to remove if manual review fails.

**Consequences:** Applied in `ScreenContainer`; must pass Android readability check.

---

## 2026-08-19 — Precise geometry: no area subtraction (Phase 4B1)

**Status:** Accepted

**Context:** Phase 4B1 requires mathematically correct opening handling. Subtracting opening area from wall area can under-buy when a narrow door does not eliminate a full strip column.

**Decision:** Precise engine decomposes each strip column into required vertical segments via rectilinear grid at opening boundaries. Coverage area is an informational metric; roll planning uses physical cuts per segment.

**Why:** Correctness and explainability; matches professional strip-based estimation.

**Consequences:** Linear cut material may exceed no-opening baseline when partial segments add cuts beside full-height regions. Invariant tests use coverage area, not linear cuts.

---

## 2026-08-19 — Policy A offcut reuse in Phase 4B1 (Phase 4B1)

**Status:** Accepted

**Context:** Offcut reuse across positions requires pattern phase and width compatibility proofs.

**Decision:** Phase 4B1 implements **Policy A** — each required segment is one physical cut and a cut piece is never assigned twice. Uncut roll tails may receive later cuts using deterministic first-fit-decreasing packing.

**Why:** Conservative and auditable; avoids silent double-use of cut pieces and NP-hard global optimization.

**Consequences:** Public precise result calls the count `plannedRolls`, not `minimumRolls`: FFD may overbuy versus an exact bin-packing optimum or an expert installer who reuses scraps. Policy B remains future research.

---

## 2026-08-19 — Per-wall corner policy in precise mode (Phase 4B1)

**Status:** Accepted

**Context:** Quick Mode adds 80 mm corner allowance on perimeter. Precise Mode plans walls separately.

**Decision:** Phase 4B1 does **not** merge walls at corners or transfer Quick corner allowance. Each wall gets `ceil(width / rollWidth)` columns independently.

**Why:** Corner strip continuity is a separate product decision; conservative per-wall count avoids underbuy.

**Consequences:** Precise totals may exceed Quick totals for the same room; explicit corner overlap may be added in a later phase.

---

## 2026-08-19 — Straight + openings deferred in Phase 4B1 (Phase 4B1)

**Status:** Accepted

**Context:** Short segments above/below openings need vertical pattern phase alignment with adjacent full-height strips. Naive `requiredLength = yEnd − yStart` is incorrect for patterned wallpaper.

**Decision:** `calculatePreciseWallpaper` rejects straight match when any opening is present (`UNSUPPORTED_PRECISE_PATTERN_CONFIGURATION`). Straight match without openings uses per-wall full-height pattern step (Phase 2 model).

**Why:** Correctness over feature count.

**Consequences:** Precise UI must communicate limitation until phase-aware patterned openings are designed and tested.

---

## 2026-08-19 — Mixed wall heights in precise engine (Phase 4B1)

**Status:** Accepted

**Context:** Phase 2 Quick engine rejects mixed heights. Codex counterexample: 10000×2500 + 1000×5000 walls.

**Decision:** `calculatePreciseWallpaper` plans each wall with its own height. Quick engine behaviour unchanged.

**Why:** Per-wall model is the foundation for Precise Mode.

**Consequences:** P6 regression confirms precise success + Quick still returns `UNSUPPORTED_DIFFERENT_WALL_HEIGHTS`.

---

## 2026-08-20 — Android decimal entry vs RU display (Phase 4B2)

**Status:** Accepted

**Context:** Android `inputMode="decimal"` / `decimal-pad` maps to a number input type that rejects locale commas before `onChangeText`. Human review preferred a reliable keyboard with `.` over forcing a comma key.

**Decision:**
1. Soft keyboard may enter decimals with `.` on Android; parser continues to accept both `.` and `,` (including paste).
2. Editable draft text is not silently rewritten.
3. Read-only RU summaries format valid meter dimensions with a locale comma via presenter helpers (`formatDimensionTextForDisplay` / `formatOpeningSummaryLine`).

**Why:** Avoid another keyboard experiment in Phase 4B2; keep parsing honest and display culturally correct for RuStore.

**Consequences:** Opening cards show `0,8 × 2 м` even when the draft string used dots. Malformed text stays visible and fails only at submit.

---

## 2026-08-20 — AppMetrica behind AnalyticsService (Phase 5A)

**Status:** Accepted

**Context:** RuStore launch needs product analytics. Expo SDK 57 / RN 0.86 supports `@appmetrica/react-native-analytics` (>=0.76 peer). Ads must wait for usage data.

**Decision:**
1. Integrate official `@appmetrica/react-native-analytics` behind existing `AnalyticsService`.
2. Privacy-first custom event taxonomy (categorical buckets only — no raw dimensions).
3. Disable app-driven location / adv-id tracking flags at activate.
4. Missing API key → Dev logger; Jest → Noop; always Safe wrapper.
5. Advertising SDKs explicitly deferred to Phase 6.

**Why:** Measure real usage before monetization UI; keep UI provider-agnostic for future calculator apps.

**Consequences:** Native rebuild required for AppMetrica on device. Share/PDF remain Phase 5B. `react-dom` is pinned to the same version as `react` so normal `npm install` / `npm ci` resolve Expo's optional web peer reproducibly without `--legacy-peer-deps`.
