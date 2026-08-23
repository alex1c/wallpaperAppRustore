# RuStore Release Preparation — Phase 6

> Release preparation only. Do **not** publish/upload until signing, privacy policy, and listing assets are ready.

## Release identity

| Field | Value |
|-------|--------|
| App name | Калькулятор обоев |
| Package / applicationId | `com.calculatorplatform.wallpaper` |
| version (versionName) | `1.0.0` |
| android.versionCode | `1` (first RuStore upload) |

Do **not** change the package id after the first store upload.

## Build variants

| Variant | How | Native plugins |
|---------|-----|----------------|
| Development | default `npx expo prebuild` / `expo run:android` | includes `expo-dev-client` |
| Production | `APP_VARIANT=production` then prebuild + Gradle release | **excludes** `expo-dev-client` |

Config entry: `app.config.ts` (overrides static `app.json` when present).

### Production env (local / CI — never commit)

Canonical variables:

```bash
EXPO_PUBLIC_APPMETRICA_API_KEY=<real AppMetrica key>
EXPO_PUBLIC_ANALYTICS_DEV_MODE=false
EXPO_PUBLIC_YANDEX_ADS_BANNER_UNIT_ID=R-M-19789924-1
EXPO_PUBLIC_YANDEX_ADS_REWARDED_UNIT_ID=R-M-19789924-2
```

Rules:

- `__DEV__` builds always use Yandex demo units (`demo-banner-yandex` / `demo-rewarded-yandex`).
- Production builds use env unit IDs only if they match `R-M-<digits>-<digits>`; otherwise ads disable (fail open).
- Never bake `EXPO_PUBLIC_ANALYTICS_DEV_MODE=true` into a store release.

Legacy aliases (`EXPO_PUBLIC_YANDEX_*_BLOCK_ID`) still work via `env.ts` but should be migrated to the canonical names above.

## Signing (critical)

RuStore requires a **production-signed** APK or AAB (RSA ≥ 2048 for AAB upload certificate flow).

This repository does **not** ship a production keystore (and must not). **Audit 2026-08-23:** no production `.jks` / `.keystore` exists in the repo, `%USERPROFILE%\.android`, EAS credentials, or `D:\r`. Only Expo `debug.keystore` copies were found. Current release artifacts remain debug-signed (`CN=Android Debug`).

Do **not** generate the production keystore in an agent session. The owner must create **one** key and back it up. Exact commands: `credentials/README.md`.

After the keystore exists:

1. Copy `credentials/keystore.properties.example` → `credentials/keystore.properties` (gitignored) and fill local paths/passwords.
2. Production prebuild will call `npm run apply:release-signing` when that file exists; otherwise run it after prebuild.
3. `cd android && .\gradlew.bat bundleRelease`
4. `npm run verify:release-signing -- android/app/build/outputs/bundle/release/app-release.aab`
5. Confirm certificate owner is **not** `CN=Android Debug`.
6. For RuStore AAB, register the signing/upload certificate in Console (PEPK + PEM) **before** upload. Same keystore, stable `wallpaper` alias; see `credentials/README.md`.

Until step 1 exists, Gradle `release` stays debug-signed (Expo CNG default). That is not an upload candidate.

## Clean production build (Windows)

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
$env:GRADLE_USER_HOME = "D:\g"
$env:APP_VARIANT = "production"

# Windows: prefer a short real path (e.g. copy/build under D:\r) so Ninja
# object paths stay under ~260 chars. `subst` can break RN codegen ("different roots").
# Example:
#   robocopy D:\petProject\wallpaperAppRustore D:\r /E /XD android ios .git
#   cd D:\r

# Ensure .env has production AppMetrica + Yandex unit IDs and ANALYTICS_DEV_MODE=false
npm run prebuild:android:production
cd android
.\gradlew.bat bundleRelease   # preferred for RuStore
# or: .\gradlew.bat assembleRelease  # APK for emulator smoke
```

`prebuild:android:production` temporarily excludes `expo-dev-*` from Expo autolinking.

For the **Gradle** release build, keep the exclude until Gradle finishes:

```powershell
$env:APP_VARIANT = "production"
$env:KEEP_PRODUCTION_AUTOLINKING = "1"
$env:NODE_ENV = "production"
npm run prebuild:android:production
cd android
.\gradlew.bat bundleRelease
cd ..
npm run restore:dev-autolinking
```

If `KEEP_PRODUCTION_AUTOLINKING` is unset, `package.json` is restored immediately after prebuild (fine for local CNG experiments, **not** for store APKs — Gradle would re-link `expo-dev-*`).

Generated `android/` stays gitignored (CNG).

If release CMake fails with `Filename longer than 260 characters`, build from a short real path (e.g. copy sources to `D:\r`, `npm ci`, then prebuild/Gradle). Do not use `subst` (RN codegen “different roots”). Do not commit generated `android/`.

## RuStore compatibility notes

- APK and AAB both accepted; AAB preferred; max ~5 GB.
- Signed package; unique package name; versionCode must increase on every update.
- targetSdk must be modern (Expo 57 / RN 0.86 targets current API — well above API 28 minimum).
- Native code must include 64-bit (`arm64-v8a`) ABIs.
- For AAB: register signing certificate in RuStore Console before upload.

## Store listing checklist

| Item | Status |
|------|--------|
| App name | Ready (Калькулятор обоев) |
| Package | Ready |
| version / versionCode | Ready (`1.0.0` / `1`) |
| Icon / adaptive icon | Ready (`assets/`) |
| Short / full description | Ready — `docs/RUSTORE_LISTING.md` (paste into console) |
| Screenshots | **Missing** — checklist in listing doc; capture from signed/production UI into `release-assets/` |
| Category / age rating | Suggested: Tools / 6+ — confirm in console |
| Privacy policy URL | **Text ready** (`docs/PRIVACY_POLICY_RU.md`, `docs/privacy.html`); **public HTTPS URL not hosted** |
| Support / developer email | **Missing** — `SUPPORT_EMAIL_TODO` |
| Release notes | Ready — listing doc, version 1.0.0 |
| Production-signed AAB/APK | **Blocked** until owner generates keystore |
| Signing certificate (AAB) | **Blocked** until keystore exists |

Privacy policy source: `docs/PRIVACY_POLICY_RU.md`. Hosting (not enabled): GitHub Pages from `/docs` → `https://alex1c.github.io/wallpaperAppRustore/privacy.html`. Do not submit to RuStore until that URL (or another HTTPS URL) loads without login.

## Privacy policy requirement

Do **not** claim “we collect no data.”

Policy **text** is in `docs/PRIVACY_POLICY_RU.md` (HTML: `docs/privacy.html`). It already distinguishes:

1. Calculator inputs processed **locally** on device.
2. User-requested Share / PDF content leaves the device only when the user shares it.
3. **AppMetrica** — product analytics / session technical data per Yandex AppMetrica policy.
4. **Yandex Mobile Ads** — advertising identifiers / ad serving per Yandex Advertising Network policy.

Host that HTML at a stable HTTPS URL (GitHub Pages from `/docs` is the simplest option already in this repo) **before** RuStore submission. Do not enable Pages from an agent session without owner approval.

## Post-publish (do not execute in Phase 6)

1. Obtain public RuStore app URL.
2. Add URL to Yandex Advertising Network app `19789924`.
3. Complete Yandex app activation / moderation.
4. Verify production ad serving (do **not** self-click ads).
5. Monitor AppMetrica events.

## Smoke expectations (production / release APK)

- App opens calculator directly (no Expo Dev Launcher / Development Build chrome).
- No `__DEV__` rewarded test button / “Только для разработки…” copy.
- No demo ad creatives (`[Demo Ad]`) when production unit IDs are configured.
- Exactly two banner placements: `result_banner`, `footer_banner`.
- Share text + PDF still work offline of Metro.
