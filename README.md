# Калькулятор обоев (Wallpaper Calculator)

First app in the **Calculator Platform** — a niche Android calculator for estimating wallpaper roll quantities. Built with Expo for RuStore-first release.

> For AI agents and contributors: start with [AGENTS.md](AGENTS.md).

## Prerequisites

- **Node.js** 22.13+ (Expo SDK 57 minimum; Node 22 LTS recommended; Node 24 works for JS tooling)
- **npm** 10+
- **JDK 17** for Android Gradle builds (`JAVA_HOME`) — Android Studio bundled JBR (Java 25) is **not** compatible
- **Android Studio** with Android SDK at `%LOCALAPPDATA%\Android\Sdk`
- USB device or emulator for on-device testing

This project uses **Expo Development Build**, not Expo Go.

## Setup

```bash
git clone <repository-url>
cd wallpaperAppRustore
npm install
cp .env.example .env   # optional — AppMetrica key, analytics logging, production ad units
```

See [docs/ANALYTICS.md](docs/ANALYTICS.md) for Phase 5A product analytics.
See [docs/ADS.md](docs/ADS.md) for Phase 5C Yandex Ads (demo units in `__DEV__`).

### Android environment (Windows PowerShell, per session)

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"  # your JDK 17 path
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
java -version   # should report 17
adb devices
```

## Run (Metro dev server)

```bash
npm start
```

Press `a` for Android when a dev client or emulator is available.

## Android development build

Generate native project and run on device/emulator:

```bash
# One-time native project generation
npx expo prebuild --platform android

# Build and install dev client
npx expo run:android
```

Ensure `ANDROID_HOME` points to your SDK (e.g. `%LOCALAPPDATA%\Android\Sdk`) and `JAVA_HOME` to JDK 17.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npx expo-doctor
```

## Project structure

```text
src/
  app/              Expo Router screens
  components/       Shared UI primitives
  features/         Feature-level UI (wallpaper)
  domain/           Pure calculation logic
  services/         Ads, analytics, persistence abstractions
  i18n/             Locales and formatters
  units/            Canonical unit conversions
  theme/            Design tokens
  config/           App and env configuration
docs/               Strategy, architecture, roadmap, ADRs
AGENTS.md           AI agent entry point
```

## Documentation

| File | Description |
|------|-------------|
| [AGENTS.md](AGENTS.md) | Rules for AI agents |
| [docs/PRODUCT_STRATEGY.md](docs/PRODUCT_STRATEGY.md) | Portfolio vision |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical boundaries |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Delivery phases |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decision log |
| [docs/RUSTORE_RELEASE.md](docs/RUSTORE_RELEASE.md) | RuStore release prep |
| [docs/RUSTORE_LISTING.md](docs/RUSTORE_LISTING.md) | Store listing copy |
| [docs/PRIVACY_POLICY_RU.md](docs/PRIVACY_POLICY_RU.md) | Privacy policy (Russian) |

## License

See [LICENSE](LICENSE).
