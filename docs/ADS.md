# Advertising — Phase 5C Yandex Ads Foundation

> Conservative monetization foundation for Wallpaper Calculator (RuStore / Android-first).

## Package

| Item | Choice |
|------|--------|
| SDK | Official `yandex-mobile-ads` **8.3.0** |
| Compatibility | Peer `react` / `react-native` `*` — project uses RN **0.86** / Expo SDK **57** |
| Integration | Expo Development Build + autolinking (no custom Expo config plugin) |
| Native rebuild | Required after install (`expo prebuild` / `expo run:android`) |
| Mediation | **Not** enabled in Phase 5C |

Generated `android/` stays gitignored (CNG). Do not hand-edit native projects for ads.

## Architecture

```text
UI (calculator screens)
  → ResultBanner (services/ads)     // result_banner + footer_banner
  → AdService
       → SafeAdService
            → YandexAdService | NoopAdService
```

Rules:

- Calculator UI never imports `yandex-mobile-ads`.
- Ads failures never block calculation, Share, or PDF.
- Jest uses `NoopAdService` + a `yandex-mobile-ads` module mock.

## Banner policy

| Rule | Phase 5C |
|------|----------|
| Placement ids | `result_banner`, `footer_banner` |
| Format | Adaptive **inline** banner (`BannerAdSize.inlineSize`, max height 90 dp) |
| When shown | Only with a valid completed Quick or Precise result |
| `result_banner` | After secondary result details, before explanation / share |
| `footer_banner` | Bottom of the same ScrollView (below CTAs / share); not sticky |
| Count | At most two placements; typically one visible at a time while scrolling |
| Ad unit | Same banner unit for both placements |
| Failure | Slot collapses; result remains |
| Not shown | Before first calculate, forms, pattern sheet, share/PDF modals, keyboard |

## Rewarded policy

| Rule | Phase 5C |
|------|----------|
| Provider | `preloadRewarded` / `showRewarded` on `AdService` |
| Product gating | **None** — Share/PDF/calculation stay free |
| Manual test | `__DEV__`-only `DevRewardedTestButton` on Quick screen |
| Production UI | No rewarded CTA |

## Test vs production ad unit IDs

| Runtime | Banner | Rewarded |
|---------|--------|----------|
| `__DEV__` / Jest | `demo-banner-yandex` | `demo-rewarded-yandex` |
| Production | `EXPO_PUBLIC_YANDEX_ADS_BANNER_UNIT_ID` | `EXPO_PUBLIC_YANDEX_ADS_REWARDED_UNIT_ID` |

Store production IDs from the Yandex partner console only in local `.env` / CI —
never commit or hardcode them. Empty, demo, or malformed production values disable
ads (fail open).

**Do not click production ads during development.** Prefer demo units; never generate fraudulent self-click traffic.

## Explicitly deferred

- Interstitial
- App open
- Mediation adapters / VK Ads
- More than two banner placements / sticky banners
- Ads before calculation or between Calculate → result
- Rewarded-gated Share / PDF / Precise
- Paid ad removal / subscriptions

## Privacy / consent

### App-level behavior

- Application code does **not** collect GAID / OAID / Android ID / MAC / fingerprints / phone / location.
- Before SDK init: `setLocationConsent(false)`, `setAgeRestrictedUser(false)`.
- No invented GDPR consent dialog in Phase 5C (Russia-first RuStore audience).

### SDK-level behavior

Yandex Mobile Ads may use advertising identifiers and network/device signals according to Yandex Advertising Network policies when the OS permission allows it (`com.google.android.gms.permission.AD_ID` may be present via the SDK). That is distinct from our product analytics taxonomy.

### Unresolved legal/product caveat

If the app later targets EEA/Switzerland users, pass consent via `MobileAds.setUserConsent(...)` **before** init and ship a real consent UX. Phase 5C documents this without claiming “no ad data is collected.”

## AppMetrica product events

Custom categorical events (see `docs/ANALYTICS.md`):

- `ad_banner_load_requested` / `ad_banner_loaded` / `ad_banner_failed` / `ad_banner_impression`
- `rewarded_load_requested` / `rewarded_loaded` / `rewarded_failed` / `rewarded_opened` / `rewarded_reward_earned` / `rewarded_closed`

Safe properties: `placement`, `format`, `mode`, `error_category`, `reward_granted`.

Do **not** send ad unit IDs, creative content, target URLs, or raw SDK error strings.

If Yandex Ads + AppMetrica also report automatic ad revenue/impression telemetry at the SDK layer, keep our custom events as product placement signals — avoid inventing duplicate click spam events.

## Configuration

```bash
# .env (local only)
EXPO_PUBLIC_YANDEX_ADS_BANNER_UNIT_ID=R-M-your-app-id-your-banner-id
EXPO_PUBLIC_YANDEX_ADS_REWARDED_UNIT_ID=R-M-your-app-id-your-rewarded-id
```

Legacy aliases still accepted: `EXPO_PUBLIC_YANDEX_BANNER_BLOCK_ID`, `EXPO_PUBLIC_YANDEX_REWARDED_BLOCK_ID`.

## Future

Mediation and additional formats can replace `YandexAdService` behind the same `AdService` boundary without UI rewrites.
