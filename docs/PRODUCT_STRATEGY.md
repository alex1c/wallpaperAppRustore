# Product Strategy — Calculator Platform

## Vision

Build a **portfolio of separate niche calculator apps**, not one mega-app with dozens of tools.

Each app targets a clear user intent and ASO keyword cluster:

- Калькулятор обоев
- Калькулятор плитки
- Калькулятор бетона
- Калькулятор арматуры
- Калькулятор электрики
- Калькулятор ламината
- Калькулятор кирпича
- Калькулятор кровли
- …

Shared engineering patterns; **separate store listings and binaries**.

## First market

| Priority | Choice |
|----------|--------|
| Geography | **Russia first** |
| Store | **RuStore first** |
| Monetization | **Advertising first** (Yandex stack planned) |
| Later | Google Play, AppGallery, international locales |

## First experiment: Wallpaper Calculator

**Job to be done:** determine how many wallpaper rolls to buy, accounting for room size, roll size, waste, and (later) pattern repeat and cut planning.

This app validates:

1. Can we ship fast on shared foundation?
2. Do users complete calculations?
3. Does ad revenue exceed acquisition cost?
4. Is **Revenue per Install** positive enough to clone the model?

## Key business metric

**Revenue per Install (RPI)** — primary success criterion for scaling the portfolio.

Supporting metrics (measured later, not built as dashboards now):

- Installs, DAU, sessions/user
- Calculations/user, ad impressions/user
- Fill rate, eCPM, ARPDAU
- Retention D1/D7

## Scaling rule

**Do not extract a shared monorepo or spawn app #2 until Wallpaper Calculator produces real retention and revenue data.**

Phase 9 (platform extraction) is conditional on economics.

## Monetization principles

- Banner-first, non-intrusive
- Interstitial only after completed user actions, with frequency caps
- Rewarded for optional premium utility
- **No App Open Ads** in initial plan

## Out of scope for early phases

Subscriptions, backend accounts, OCR, PDF export, remote config, international imperial-first UX.

These may follow after RPI is understood.
