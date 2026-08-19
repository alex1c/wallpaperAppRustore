# Precise Geometry Specification — Phase 4B1

> **Status:** Phase 4B1 domain engine — geometry + strip planner.  
> **UI:** Phase 4B2 (not in this document).  
> **Source:** `src/domain/wallpaper/precise/`

## Purpose

Precise Mode models **vertical strip columns and required coverage segments** per wall. It does **not** subtract opening area from wall area.

Quick Mode continues to use the Phase 2 aggregate engine (`calculateWallpaper`). Precise Mode uses a separate entry point (`calculatePreciseWallpaper`) that shares strip-length and pattern-step helpers but plans walls independently.

---

## 1. Wall model

Each wall is a rectangle in integer millimeters:

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Unique among walls |
| `widthMm` | mm | Positive safe integer |
| `heightMm` | mm | Positive safe integer |

**Mixed heights:** Each wall has its own height. The precise engine does **not** reject different heights. Legacy Quick engine still returns `UNSUPPORTED_DIFFERENT_WALL_HEIGHTS`.

---

## 2. Opening model

```ts
PreciseOpening {
  id: string           // unique among all openings
  wallId: string       // must reference an existing wall
  offsetXMm: mm        // left edge from wall left, >= 0
  offsetFromFloorMm: mm // bottom edge from floor, >= 0
  widthMm: mm          // > 0
  heightMm: mm         // > 0
}
```

**Validation (runtime):**

- All dimensions are safe integers
- Opening must fit entirely inside wall bounds: `offsetX + width <= wall.width`, `offsetY + height <= wall.height`
- Opening IDs unique
- **Overlapping openings on the same wall are rejected** (`OVERLAPPING_OPENINGS_UNSUPPORTED`)

**Supported in 4B1:**

- Doorway touching floor (`offsetFromFloorMm = 0`)
- Rectangular window fully inside wall
- Opening touching ceiling when geometry is valid

**Deferred:**

- Arches, circles, polygons, diagonal walls, bay windows as polygons, sloped ceilings

---

## 3. Corner policy (Phase 4B1)

| Policy | Phase 4B1 behaviour |
|--------|---------------------|
| Per-wall planning | Each wall is planned **independently** |
| Perimeter merge | **Not** used — no automatic corner strip reuse across walls |
| Quick corner allowance | **Not** transferred to precise mode |
| Overbuy vs underbuy | Conservative overbuy preferred over underbuy |

Future phases may add explicit corner overlap/trim inputs. Phase 4B1 does not model strip continuity around inside corners.

---

## 4. Strip column model

For each wall:

```text
stripColumnCount = ceil(wallWidthMm / rollWidthMm)
```

Columns are indexed 0 … n−1 left to right. The last column may be partial width:

```text
lastColumnWidth = wallWidthMm - (n-1) × rollWidthMm   // when n > 1
```

Columns are **not** merged across walls. Total columns = sum per wall.

Reference: `src/domain/wallpaper/precise/wall-columns.ts`

---

## 5. Required vertical segments

Within each strip column, openings are resolved by **rectilinear grid decomposition**:

1. Collect X breakpoints: column edges + opening left/right edges that fall inside the column
2. Collect Y breakpoints: floor, ceiling, opening top/bottom edges
3. For each grid cell fully inside an opening → skip
4. Remaining cells → required coverage rectangles
5. Merge adjacent cells with same X span and contiguous Y spans

Each segment records:

| Field | Meaning |
|-------|---------|
| `wallId`, `columnIndex`, `segmentIndex` | Identity |
| `xStartMm`, `xEndMm`, `yStartMm`, `yEndMm` | Wall-local coordinates (floor = Y 0) |
| `wallCoverageLengthMm` | `yEnd − yStart` before trim |
| `columnWidthMm` | Segment width (may be less than full roll width on partial overlap) |

**Important:** A door beside a column still requires full-height paper on the non-opening sub-region. Partial horizontal overlap is handled correctly.

Physical cut length for free match:

```text
physicalLengthMm = wallCoverageLengthMm + topTrimMm + bottomTrimMm
```

In Phase 4B1 the same top/bottom allowance is applied to **every** required
segment, including segments ending at an opening edge. This is a conservative
installation allowance proxy, not an optimal cutting claim. It can make linear
material or `plannedRolls` increase after adding a small opening; coverage-area
savings remain the geometry truth.

Reference: `src/domain/wallpaper/precise/segment-builder.ts`

---

## 6. Offcut reuse policy — Policy A

**Phase 4B1 implements Policy A only:**

- Each required segment → one physical cut
- A physical cut is assigned to exactly one required segment; cut pieces are not reused at another wall position
- Uncut roll tails may receive later cuts through deterministic first-fit-decreasing packing
- Final unused roll tails are tracked as `remainingUsableLengthMm`
- Packing is conservative and deterministic, but is **not** an exact bin-packing optimizer

**Policy B (safe offcut reuse)** is documented for future research but **not implemented**.

---

## 7. Roll cutting planner

### Free match (default)

- Cuts sorted by required spacing/length descending, then stable geometry identity
- Each cut placed on the first roll tail where it fits; otherwise a new roll is started
- `patternStepMm = physicalLengthMm` (cuts abut)
- Result field is `plannedRolls`, not `minimumRolls`: FFD may exceed the theoretical bin-packing optimum

### Straight match

| Configuration | Status |
|---------------|--------|
| No openings, uniform segments per wall | **Supported** — uses Phase 2 `patternStepMm` model per full wall height |
| With openings | **Rejected** — `UNSUPPORTED_PRECISE_PATTERN_CONFIGURATION` |

Rationale: short segments above/below openings require vertical phase alignment that Phase 4B1 does not prove. Correctness over feature count.

### Half-drop

**Deferred** — same as Quick Mode (`UNSUPPORTED_PATTERN_MATCH` in precise validation).

---

## 8. Opening savings metrics

The domain returns **explainability facts**, not UI strings.

| Metric | Meaning |
|--------|---------|
| `baselineTotalMaterialMm` | Linear cut material if no openings (full-height segments) |
| `actualTotalMaterialMm` | Linear cut material with openings |
| `physicalCutLengthSavedMm` | `baseline − actual` (can be **negative** when partial segments add cuts) |
| `coverageAreaSavedMm2` | Baseline coverage area − actual coverage area (always ≥ 0 when opening is valid) |
| `stripColumnsEliminated` | Column count difference (usually 0 — openings rarely remove a column) |
| `partialSegmentsCreated` | Segments beyond full-height baseline count |
| `baselinePlannedRolls` / `actualPlannedRolls` | Conservative FFD plan counts with/without openings; baseline may be `null` when a no-opening full-height cut cannot fit |

`openingImpacts[]` additionally preserves each opening id/wall id, its removed
coverage area, and the strip-column indices it intersects so a presenter does
not need to repeat geometry calculations.

**Key insight:** An opening can reduce **coverage area** and sometimes **roll count**, but may **increase linear cut material** because partial-height segments still need separate cuts while adjacent regions remain full height.

---

## 9. Baseline comparison

For every successful precise calculation, the engine also builds a **baseline without openings** on the same wall geometry:

- Same strip columns
- Full-height segments per column
- Separate roll plan for baseline metrics

This enables tests like: adding an opening must not increase **coverage area** (free match).

---

## 10. Error codes (precise-specific)

| Code | When |
|------|------|
| `INVALID_OPENING_GEOMETRY` | Bad opening fields or unknown wall |
| `DUPLICATE_OPENING_ID` | Repeated opening id |
| `OPENING_OUTSIDE_WALL` | Opening extends beyond wall bounds |
| `OVERLAPPING_OPENINGS_UNSUPPORTED` | Two openings overlap on same wall |
| `UNSUPPORTED_PRECISE_PATTERN_CONFIGURATION` | Straight match + openings |

Existing codes (`STRIP_LONGER_THAN_ROLL`, `UNSUPPORTED_PATTERN_MATCH`, etc.) also apply.

---

## 11. Public API

```ts
calculatePreciseWallpaper(input: PreciseWallpaperCalculationInput): WallpaperCalculationOutcome<PreciseWallpaperCalculationResult>
```

Exported from `src/domain/wallpaper/index.ts`. Low-level helpers (`wall-columns`, `segment-builder`, `precise-roll-planner`) are **internal**.

---

## 12. Reference scenarios (P1–P10)

Hand-calculated fixtures in `src/domain/wallpaper/precise/fixtures/precise-reference-scenarios.ts`.  
Roll: 1060 × 10050 mm unless noted. Trim: 50 + 50 mm unless noted.

| ID | Description | Key expected values |
|----|-------------|---------------------|
| **P1** | 4000×2700, no openings | 4 columns, 4 segments, 11200 mm material, 2 planned rolls, last col 820 mm |
| **P2** | Floor door 900×2100 @ x=1550 | 4 columns, 6 segments, 12600 mm linear material, 1_890_000 mm² area saved, 2 rolls (= baseline rolls) |
| **P3** | Window 1200×1200, bottom=900 | Partial segments above/below window, area saved > 0 |
| **P4** | Same as P2 (educational) | Area saved, roll count unchanged |
| **P5** | 2120×9000, full-width door 2120×6000, trim 0 | 2 segments × 3000 mm → **1 planned roll** vs baseline **2** |
| **P6** | Mixed heights: 10000×2500 + 1000×5000 | 11 columns total; w1: 10 cuts @ 2600 mm; w2: 1 cut @ 5100 mm |
| **P7** | Opening outside wall | `OPENING_OUTSIDE_WALL` |
| **P8** | Overlapping openings | `OVERLAPPING_OPENINGS_UNSUPPORTED` |
| **P9** | Width 5300 (= 5×1060) | 5 columns |
| **P10** | Width 5301 | 6 columns |

---

## 13. Property invariants (tests)

See `src/domain/wallpaper/precise/__tests__/precise-property-invariants.test.ts`:

- Opening does not increase **coverage area** (free match)
- Removing opening does not decrease coverage area
- Increasing wall width does not decrease strip columns
- Increasing wall height does not decrease physical material
- Every cut: `0 < length <= roll length`
- Total assigned cut length ≤ purchased roll length
- No duplicate cut assignment
- Roll remainder ≥ 0
- Overlapping / outside openings rejected
- Mixed heights handled independently per wall

---

## 14. Known conservative assumptions

1. No physical cut-piece reuse across positions (Policy A); uncut roll tails are packed with FFD
2. No Quick Mode corner allowance in precise mode
3. Straight match blocked when openings present
4. Half-drop not calculated
5. Overlapping openings rejected rather than unioned
6. Linear cut material may exceed baseline when openings create partial segments beside full-height regions
7. `plannedRolls` is a conservative FFD result, not a proven mathematical minimum
8. Horizontal remnants from narrow rectilinear segments are not width-packed
   with other segments; each segment consumes its own linear cut allowance

---

## 15. Architecture relationship

```text
QuickRoomInput → normalize → Wall[] → calculateWallpaper()     [Phase 2 aggregate]
PreciseWallpaperCalculationInput → calculatePreciseWallpaper() [Phase 4B1 per-wall]

Shared: strip-length, pattern-step, roll validation, MaterialBreakdown types
Not shared: perimeter aggregation, corner allowance, opening segment decomposition
```

Future Phase 4B2 will add UI adapters that call `calculatePreciseWallpaper` and present results via the existing presenter pattern.
