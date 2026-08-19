# Wallpaper Calculator — Product Spec v1

> **Source of truth** for Wallpaper Calculator product behaviour, calculation model, and deferred scope.
> Phase 2 implements the calculation engine and this spec; UI polish arrives in Phase 3+.

---

## 1. Product positioning

This is **not** a simple wall-area calculator.

**Positioning:**

> Помощник при покупке обоев, который отвечает не только «сколько рулонов купить», но и объясняет, почему требуется именно такое количество.

**Primary user:**

- Ordinary person doing DIY renovation or supervising a renovation
- No professional terminology required
- Often calculating wallpaper for the first time
- May be at home or in a store

**Primary market:** Russia / RuStore / Android

The calculation engine must remain suitable for international localization (units conversion outside domain).

---

## 2. Main UX principle — progressive disclosure

Initial interface is intentionally simple. The user must **not** see immediately:

- rapport (pattern repeat)
- offset
- pattern match types
- complex wall lists
- openings
- professional jargon

**Initial scenario:**

```text
Размер комнаты
  Длина
  Ширина
  Высота

Размер рулона
  Ширина
  Длина

[ Рассчитать ]
```

Below:

> Сделать расчёт точнее

Expanding reveals advanced options.

**Principle:**

> A beginner gets a useful result in ~20 seconds.
> An advanced user can gradually turn a simple calculation into a precise one.

*(UI implementation: Phase 3)*

---

## 3. Human-first terminology

Never require the user to understand professional terms first.

**Rule:** human explanation → example → professional term

| User-facing (RU) | Example | Professional term |
|------------------|---------|-------------------|
| Через сколько сантиметров рисунок повторяется? | Same motif every 64 cm → enter 64 cm | Раппорт рисунка |
| На сколько сантиметров сдвигается рисунок на соседнем полотне? | Marking `64/32`: 64 cm repeat, 32 cm offset | Смещение / half-drop |

*(i18n implementation: Phase 3)*

---

## 4. Product modes

### A. Quick calculation — MVP (Phase 2 engine)

**Input:**

- room length, width, height
- roll width, roll length

**Output:**

- minimum rolls
- recommended rolls (separate policy)
- required strips
- strips per roll
- effective strip length
- waste metrics
- data for result explanation (no UI strings in domain)

Quick mode assumes a **rectangular room**. It does not claim maximum precision.
If no pattern is specified, the result must make clear that pattern matching was **not** applied.

### B. Precise calculation — Phase 4B1 domain (UI in 4B2)

Implemented in domain (Phase 4B1):

- individual walls with independent heights
- doors and windows via strip-column geometry (not area subtraction)
- required vertical segments and physical cut plan
- opening savings metrics for explainability
- free match + openings; straight without openings

Deferred to later phases:

- polished Precise Mode UI (4B2)
- straight match + openings
- half-drop calculation
- cut visualization

See `docs/WALLPAPER_PRECISE_GEOMETRY_SPEC.md`.

### C. “I already have N rolls” (Phase 2 engine)

User enters owned roll count.

**Output:**

- enough / not enough
- roll shortage / surplus
- strip-level shortage when applicable

Uses the same calculation core — no duplicate engine.

---

## 5. Roll sizes

No single global standard is assumed.

**RU UX presets (Phase 3 UI/config, not domain constants):**

- ~0.53 × 10.05 m
- ~1.06 × 10.05 m

The engine accepts **arbitrary** roll width and length. No hard-coded roll sizes in formulas.

---

## 6. Units

| Quantity | Canonical domain unit |
|----------|----------------------|
| Length | **Millimeters** (integer) |
| Area (informational) | Square millimeters |

Examples: `2700` = 2.7 m, `1060` = 1.06 m, `10050` = 10.05 m, `640` = 64 cm.

Conversions live in `src/units/` — not inside the calculation core.

---

## 7. Fundamental calculation model

**Key principle:** wallpaper is counted through **whole vertical strips**, not wall area.

Area may appear as an informational metric but **must not** drive roll count.

```text
wall perimeter (sum of wall widths)
        ↓
required number of strips
        ↓
effective strip length (height + trim [+ pattern repeat])
        ↓
strips obtainable from one roll
        ↓
minimum number of rolls
```

All rounding is explicit and testable (`ceil` for strips and rolls, `floor` for strips per roll).

---

## 8. Quick calculation model

### Rectangular room → walls

```text
QuickRoomInput → normalize → Wall[] → calculation engine
```

Four walls: two × length, two × width (same height in quick mode).

### Perimeter and strips

```text
totalWallWidthMm = sum(wall.widthMm)
adjustedWallWidthMm = totalWallWidthMm + cornerAllowanceMm
requiredStrips = ceil(adjustedWallWidthMm / rollWidthMm)
```

**Corner policy (Phase 2.1):** separate `CornerAllowancePolicy`, not magic numbers in wall dimensions. Default quick mode: **80 mm total** (4 inside corners × 20 mm). Configurable; use `ZERO_CORNER_POLICY` for exact-boundary tests.

### Strip length (no pattern)

```text
rawStripLengthMm = wallHeightMm + topTrimMm + bottomTrimMm
```

Trim may be **zero** (`>= 0`). Default quick mode: 50 mm top + 50 mm bottom.

### Uniform wall heights (Phase 2.1)

Shared **Quick** engine accepts `Wall[]` only when **all heights are equal**. Different heights → `UNSUPPORTED_DIFFERENT_WALL_HEIGHTS`. **Precise** engine (`calculatePreciseWallpaper`) supports mixed heights per wall.

---

## 9. Pattern repeat — straight match (Phase 2.1 physical model)

**Do not conflate:**

| Term | Meaning |
|------|---------|
| `rawStripLengthMm` | Physical cut applied to the wall |
| `patternStepMm` | Vertical distance between strip **start** positions for pattern alignment |

For straight match:

```text
patternStepMm = ceil(rawStripLengthMm / repeatMm) × repeatMm
```

**Roll cutting:** strips start at `0, patternStep, 2×patternStep, …` on each roll. Each strip consumes `rawStripLengthMm` physically; the last strip on a roll does **not** require trailing alignment gap. Strips per roll:

```text
max n where (n−1)×patternStep + rawStripLength <= rollLength
```

**Phase assumption:** each new roll starts at pattern phase zero. When straight match is applied, `trace.patternPhase.minimumRollsDependsOnPhaseAssumption` is `true`.

**Meaning of `minimumRolls`:** the mathematical minimum **within the current calculation model and its documented assumptions** — not an absolute real-world guarantee when pattern phase at roll start is unknown.

If `minimumRollsDependsOnPhaseAssumption === true`, the Phase 3 presenter **must** qualify the result for the user (e.g. that the count assumes each new roll starts at a compatible pattern phase). Domain exposes the flag; i18n copy is Phase 3 scope.

For `free` match: `patternStepMm = rawStripLengthMm` (strips abut, no alignment gap).

**Reference (physical regression):**

```text
raw = 2800, repeat = 640, patternStep = 3200, roll = 9200
→ 3 strips at starts 0, 3200, 6400; last ends at 9200
```

If `repeatMm > rawStripLengthMm`, calculation is still valid when the physical cut fits on the roll.

---

## 10. Match types

```ts
type PatternMatch = 'free' | 'straight' | 'half-drop'
```

| Match | Phase 2 behaviour |
|-------|-------------------|
| `free` | No repeat alignment; ignore repeat if present |
| `straight` | Repeat required; strip length rounded to repeat |
| `half-drop` | Type in domain; **calculation deferred** — returns typed error |

Half-drop requires a validated strip-layout model before production use.

---

## 11. Rolls

```text
stripsPerFullRoll = physical max strips on one roll (see §9)
minimumRolls = ceil(requiredStrips / stripsPerFullRoll)
```

If no physical strip fits → `STRIP_LONGER_THAN_ROLL` (based on `rawStripLengthMm`, not `patternStepMm`).

---

## 12. Material breakdown (not opaque “waste”)

| Metric | Meaning |
|--------|---------|
| `totalPhysicalCutLengthMm` | Wall coverage (`requiredStrips × rawStripLength`) |
| `totalPatternAlignmentLossMm` | Gaps between strip starts on rolls (pattern only) |
| `totalRollLengthConsumedMm` | Sum of last strip end positions on purchased rolls |
| `totalRemainingUsableLengthMm` | Purchased length minus consumed positions (usable offcuts) |

Spare-roll **recommendation** is separate — never included in material breakdown.

Per-roll `rollUsage[]` includes `stripCuts[]` with start/end positions for visualization.

---

## 13. Minimum vs recommended rolls

| Result | Meaning |
|--------|---------|
| `minimumRolls` | Strict mathematical minimum **under current model assumptions** (see §9 pattern phase) |
| `suggestedSpareRolls` / `suggestedTotalRolls` | Product policy via `recommendRollPurchase()` |

Initial policy: suggest 1 spare when `minimumRolls >= 2`; none when `minimumRolls === 1`. Reason codes: `GENERAL_INSTALLATION_RESERVE`, `PATTERN_MATCHING_RISK`, `BATCH_DYE_LOT_REPAIR`, `DAMAGE_OR_MISCUT_BUFFER`.

---

## 14. Doors and windows — Phase 4B1

**Do not** use `wall area − opening area` as precise calculation.

Openings affect strip layout geometrically; a door does not always save a whole strip.

**Phase 4B1 (precise engine):**

- Rectangular openings on individual walls
- Rectilinear grid decomposition per strip column
- `calculatePreciseWallpaper()` returns segments, cuts, and opening savings metrics
- Free match + openings supported
- Straight match + openings rejected (`UNSUPPORTED_PRECISE_PATTERN_CONFIGURATION`)

**Phase 2 Quick engine:** openings still not included in `calculateWallpaper()`.

See `docs/WALLPAPER_PRECISE_GEOMETRY_SPEC.md`.

---

## 15. Individual walls

Domain accepts `Wall[]` as the primary input after normalization.

Quick mode converts rectangular room → four walls so Quick and Precise share one engine.

---

## 16. Future openings model

```ts
interface Opening {
  wallId: string
  offsetXMm: Millimeters
  widthMm: Millimeters
  heightMm: Millimeters
  offsetFromFloorMm: Millimeters
}
```

Not computed in Phase 2.

---

## 17. Result explainability

Domain returns `WallpaperCalculationTrace` + `MaterialBreakdown` — **no UI strings**.

Trace includes: `totalWallWidthMm`, `cornerAllowanceMm`, `adjustedWallWidthMm`, strip counts, trim, `rawStripLengthMm`, `patternStepMm`, roll dimensions, `rollUsage`, `patternPhase` metadata.

---

## 17a. How we explain the calculation

> Пользователь должен иметь возможность понять, как получено количество рулонов, без знания профессиональной терминологии.

Explanation structure (presenter/i18n builds copy from trace):

1. Room size / total wall width
2. Corner allowance (“запас на прохождение углов”)
3. Adjusted width → required strips
4. Wall height + trim → physical strip length
5. Pattern repeat in plain language → pattern step (secondary: “раппорт”, straight match)
6. Strips obtainable from each roll (physical cut plan)
7. How minimum rolls sum up
8. **Separately** — suggested spare roll (not mathematical necessity)

Professional terms (раппорт, straight match, half-drop) are **secondary**, never required input knowledge.

---

## 18. Validation

Typed domain errors — never silently fix bad input. Runtime guards on all public entry points.

| Condition | Error |
|-----------|-------|
| Non-integer / non-safe-integer mm | `INVALID_DIMENSION` |
| Any structural null/malformed input | `INVALID_INPUT_STRUCTURE` |
| Unknown `pattern.match` | `INVALID_PATTERN_MATCH` |
| Straight + non-zero offset | `INCONSISTENT_PATTERN_CONFIG` |
| Different wall heights | `UNSUPPORTED_DIFFERENT_WALL_HEIGHTS` |
| Repeat ≤ 0 when required | `INVALID_REPEAT` |
| `rawStripLength > rollLength` | `STRIP_LONGER_THAN_ROLL` |
| `half-drop` requested | `UNSUPPORTED_PATTERN_MATCH` |
| Absurdly large inputs | `INPUT_OVERFLOW` |

Trim fields: safe integer `>= 0`. Wall/roll dimensions: safe integer `> 0`.

---

## 19. “Already have N rolls”

Assumes **identical unused full rolls** matching the calculation spec (`ownedFullRolls`). Partial rolls deferred.

```text
shortageRolls = max(0, minimumRolls - ownedRolls)
surplusRolls  = max(0, ownedRolls - minimumRolls)

availableStrips = ownedRolls × stripsPerFullRoll
missingStrips   = max(0, requiredStrips - availableStrips)
```

Same room calculation — no second formula.

---

## 20. Wallpaper helper (Phase 4A — roll label helper)

In-app **«Как прочитать этикетку обоев?»** helper (Phase 4A) explains common label notations with examples:

| Example | Meaning |
|---------|---------|
| `53 см × 10,05 м` | Roll width × length |
| `64 см` | Pattern repeat every 64 cm |
| `64/0` | Straight match (same height on adjacent strips) |
| `64/32` | 64 cm repeat, adjacent strip offset 32 cm (half-drop) |
| `0` or free-match symbol | No pattern alignment needed |

Copy states that **manufacturers may use slightly different symbols** — helper is illustrative, not an exhaustive international standard.

**Needed for calculation:** roll size, repeat (when patterned), match type

**Useful when buying (future):** batch/lot, washability, light resistance, removal method

OCR/camera label scan remains post-MVP (Phase 6+).

---

## 21. Label scanner — post-MVP

```text
Photo label → extract size/repeat/offset → user confirms → calculate
```

Phase 6+ experiment. No OCR/camera in Phase 2.

---

## 22. Reference scenarios (independent expected values)

Used by unit tests. Values computed by hand before implementation.

### Scenario A — no pattern

| Input | Value |
|-------|-------|
| Room | 4.0 × 3.0 m, height 2.7 m |
| Roll | 1.06 × 10.05 m |
| Trim | 50 + 50 mm |
| Corner | default quick policy (80 mm) |

| Metric | Expected |
|--------|----------|
| Total wall width | 14 000 mm |
| Adjusted width (with corners) | 14 080 mm |
| Required strips | 14 |
| Raw strip length (physical cut) | 2 800 mm |
| Pattern step | 2 800 mm |
| Strips per roll | 3 |
| Minimum rolls | 5 |
| Last roll strips | 2 |

### Scenario B — straight repeat 640 mm

Same room and roll as Scenario A, with straight match repeat 640 mm.

**Physical cut vs alignment:** each strip still covers **2 800 mm** on the wall (`rawStripLengthMm`). Pattern matching adds **400 mm gaps** between strip start positions on the roll (`patternStepMm = 3 200 mm`). Do not multiply `patternStep × strip count` — that over-counts material.

| Metric | Expected |
|--------|----------|
| Raw strip length (physical cuts) | 2 800 mm |
| Pattern step | 3 200 mm |
| Strips per roll | 3 |
| Minimum rolls | 5 |
| Total physical cut length (14 × 2 800) | 39 200 mm |
| Total pattern alignment loss (on rolls) | 3 600 mm |
| Total roll length consumed | 42 800 mm |
| Total purchased length (5 × 10 050) | 50 250 mm |
| Usable remainder (50 250 − 42 800) | 7 450 mm |

### Scenario C — narrow roll 0.53 m

Same room, no pattern.

| Metric | Expected |
|--------|----------|
| Required strips | 27 |
| Minimum rolls | 9 |

### Scenario D — impossible roll

Strip length (height + trim) > roll length → `STRIP_LONGER_THAN_ROLL`.

### Scenario E — exact boundaries (mathematical fixture)

**Fixture policy:** `ZERO_CORNER_POLICY` — isolates strip/roll rounding without corner allowance.

Room 3.0 × 3.0 m, height 2.7 m, roll 1.0 × 11.2 m, trim 50+50.

| Metric | Expected (zero corner) |
|--------|------------------------|
| Total wall width | 12 000 mm |
| Required strips | 12 (exact) |
| Strips per roll | 4 (exact) |
| Minimum rolls | 3 (exact) |
| All roll remainders | 0 |

**Default Quick Mode (80 mm corner)** for the same room/roll:

```text
12 000 + 80 = 12 080 mm adjusted width
ceil(12 080 / 1 000) = 13 strips
ceil(13 / 4) = 4 minimum rolls
```

The fixture and default user-facing quick behaviour **must not be conflated** in tests or documentation.

---

## 23. Architecture boundary

```text
UI → input adapter / normalization → pure wallpaper domain → typed result → presenter/UI
```

Domain must not import React, Expo, i18n, ads, analytics, or persistence.

---

## 24. Phase 2 definition of done

See project Phase 2 task checklist. This spec is the product source of truth; `docs/DECISIONS.md` records engineering ADRs.
