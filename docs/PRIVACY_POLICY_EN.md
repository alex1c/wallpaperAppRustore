# Privacy Policy

**App:** Wallpaper Calculator («Калькулятор обоев»)
**Android package:** `com.calculatorplatform.wallpaper`
**Document version:** 1.0
**Date:** 23 August 2026

This policy describes data processing in the Wallpaper Calculator app. It is a wallpaper-roll estimator. We do **not** claim that “no data is collected”: the app includes Yandex AppMetrica and Yandex Mobile Ads.

The public HTTPS URL will be published after hosting (recommended: GitHub Pages; see `docs/RUSTORE_RELEASE.md`).

## 1. Who processes data

The operator is the developer of Wallpaper Calculator (Calculator Platform).

- Repository: https://github.com/alex1c/wallpaperAppRustore
- Privacy / support contact: **replace with the support email used on RuStore** (`SUPPORT_EMAIL_TODO`).

There is no account system and no app backend that stores calculations.

## 2. Data processed on device

Calculations run **locally on the device**. The app may use, for calculation, explanation, PDF, and sharing:

- room dimensions (length, width, height);
- individual wall dimensions;
- door and window sizes and positions;
- roll width and length;
- pattern / matching inputs (repeat; **half-drop calculation is not implemented** in this version);
- calculation results and a PDF file in the app cache.

These values are **not** sent to a developer-operated server.

## 3. What the app does not collect itself

The app does **not** manually collect contacts, SMS, camera, microphone, or precise GPS location. There is no login.

`com.google.android.gms.permission.AD_ID` may appear via the Yandex ads SDK (advertising ID). That is not the calculator reading your address book or GPS.

## 4. Sharing and PDF

On your action the app may open the Android system Share Sheet with text, or generate a PDF and share the file. Content goes only to the app **you** pick. The developer does not see the recipient.

## 5. Analytics (AppMetrica / Yandex)

Yandex AppMetrica is used for product analytics (screens, success/failure of calculations, error categories, ad placement events).

App events do **not** include exact room sizes, report bodies, PDFs, phones, or names.

The AppMetrica SDK may still process **technical** device/session data under Yandex policy. The app configures AppMetrica with `locationTracking: false` and `advIdentifiersTracking: false`; that does not mean the SDK processes no technical data.

- https://yandex.com/legal/confidential/
- https://yandex.com/legal/metrica_agreement/

## 6. Advertising (Yandex Mobile Ads)

Banners may show after a completed calculation (result slot and footer slot). Calculation, share, and PDF are not gated behind rewarded ads.

Yandex Mobile Ads may process advertising identifiers and device/network/ad signals per Yandex Advertising Network rules.

- https://yandex.com/legal/confidential/
- https://yandex.com/legal/mobileads_sdk_agreement/

## 7. Purposes

| Data | Purpose |
|------|---------|
| Dimensions and roll/pattern inputs | Estimate rolls and explain the result |
| Shared text / PDF | You chose to send the result |
| AppMetrica events | Product usage and reliability |
| Ads SDK data | Serve and measure banners |

## 8. Third parties

We do not sell calculation contents. Yandex may process analytics and ads data under its own policies. The system Share Sheet sends content to an app you select.

## 9. Retention and deletion

Uninstalling the app (or clearing app data) removes on-device calculations. There is no developer cloud copy of your rooms. For analytics/ads identifiers, contact support; some processing is controlled by Yandex.

## 10. Children

The app is not directed at children under 13. Ads may be shown to DIY users.

## 11. EEA / Switzerland

The first release targets RuStore (Russia). This version does not ship a GDPR consent dialog. Distribution in the EEA would require an updated policy and consent flow.

## 12. Contact

Email: `SUPPORT_EMAIL_TODO`
GitHub Issues: https://github.com/alex1c/wallpaperAppRustore/issues (do not send personal data there)
