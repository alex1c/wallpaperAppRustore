# Sharing & Reports — Phase 5B

> System Share Sheet + text/PDF calculation reports for Wallpaper Calculator.

## Goals

- Share a completed calculation as readable Russian (or EN) text.
- Generate a practical PDF report and share it via Android system Share Sheet.
- Free feature — **no ads** in this phase.

## Architecture

```text
Presented result + form/draft snapshot
        ↓
CalculationReportModel   (src/features/wallpaper/report/)
        ↓
 ┌──────────────────┬──────────────────┐
 ↓                  ↓
Text formatter      PDF HTML formatter
 ↓                  ↓
RN Share.share      expo-print → cache PDF
                           ↓
                    expo-sharing (ACTION_SEND)
```

Rules:

- Report builders consume **presented** results + form/draft snapshots.
- They **do not** recalculate rolls or call the domain engine.
- Half-drop never produces a numeric report (calculation still deferred).

## System Share Sheet policy

Use Android/OS share targets only:

- MAX, email, VK, Telegram, WhatsApp, SMS, etc. appear if installed.
- No vendor chat SDKs, no hardcoded package lists, no destination ranking.

Text: `react-native` `Share.share`.  
PDF: `expo-sharing.shareAsync` after `expo-print.printToFileAsync`.

## PDF

| Topic | Choice |
|-------|--------|
| Library | `expo-print` (HTML → PDF) |
| Cyrillic | UTF-8 HTML + system sans-serif (Roboto/Noto on Android) |
| Storage | App cache via `expo-file-system/legacy` (`cacheDirectory`) |
| Filename | `wallpaper-calculation-YYYY-MM-DD.pdf` |
| MIME | `application/pdf` |
| Lifecycle | Cache/temporary — safe to overwrite; not permanent user library |

## Privacy vs analytics

Share/PDF **intentionally** contains user calculation data (dimensions, openings, explanation) because the user requested the share.

AppMetrica custom events must **never** receive:

- report body / PDF contents
- exact dimensions / offsets
- filenames with user data
- destination app / recipient

Safe analytics only: mode, pattern category, `has_openings`, error category.

## Analytics events

| Event | Meaning |
|-------|---------|
| `share_opened` | Share chooser opened |
| `text_share_sheet_opened` | OS text sheet presented |
| `pdf_generation_started` / `_completed` / `_failed` | PDF lifecycle |
| `pdf_share_sheet_opened` | OS PDF sheet presented |

**No `share_completed`** — opening the sheet is not proof the user sent anything.

## Supported modes

| Mode | Text | PDF |
|------|------|-----|
| Quick free | yes | yes |
| Quick straight | yes | yes |
| Precise (± openings) | yes | yes |
| Half-drop | blocked (no fake numbers) | blocked |

Quick uses «Нужно минимум»; Precise uses «По расчётному раскрою».

## UX

After a valid result: button **Поделиться расчётом** → sheet with:

1. Отправить результат  
2. Подробный PDF  

Hidden before calculation. Failures keep the calculation result visible.
