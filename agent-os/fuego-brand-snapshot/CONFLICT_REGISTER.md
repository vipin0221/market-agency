# Conflict Register

**Client:** Fuego Football Academy (Fuego Football)  
**Client ID:** CLIENT_001_AU_FOOTBALL_EQUIPMENT  
**Date:** 21 Sep 2026 (Asia/Calcutta / IST)  
**Owner:** Brand Studio (Agent 3)  
**Companion to:** `BRAND_STRATEGY_AND_GUIDELINES_PACK.md` (Brand Pack)  
**Related:** Evidence Precedence → Conflict-Resolution Procedure → Brand Input Audit → Brand build; Brand Pack §29 Human Approval Items  
**Status:** ACTIVE — Operator decisions applied for CR-001 / CR-002 / CR-003 (RESOLVED_CONTEXTUAL dual-surface LOCKED) / CR-004a/b/c **OPERATOR_APPROVED** (STAMPED); §29 A2–A5 **LOCKED**; remaining APPROVE BRAND blockers: A1 logo masters PENDING_CLIENT_DELIVERY + A6 child-image consent/masters

---

## Purpose

Log **material source conflicts** discovered while building the Brand Strategy & Guidelines Pack. Preserve both sides of every conflict — **never delete losing evidence**. Resolution is recorded here; VOIDED / excluded items stay in the log for audit only.

---

## Conflict types

`BUSINESS_FACT` | `BRAND_ASSET` | `POSITIONING` | `AUDIENCE` | `CLAIM` | `COMPETITOR` | `MARKET` | `VISUAL` | `OTHER`

---

## Resolution states

| State | Meaning |
|-------|---------|
| `RESOLVED_A` | Source A wins; Source B retained as losing evidence |
| `RESOLVED_B` | Source B wins; Source A retained as losing evidence |
| `RESOLVED_CONTEXTUAL` | Both valid in different contexts (documented in notes) |
| `CONFLICTING_NEEDS_VERIFICATION` | Still conflicting; needs further verification |
| `UNKNOWN_INSUFFICIENT` | Evidence insufficient to choose |
| `OPERATOR_DECISION_REQUIRED` | Escalated — Operator must decide |
| `NEEDS_OPERATOR_CONFIRMATION` | Direction or draft recorded; Operator stamp still required |
| `VOIDED_EXCLUDED` | Conflict voided / excluded from active brand use (audit only) |

---

## Rules

1. **VOIDED_EXCLUDED** rows are excluded from active brand decisions; keep them in this register for history.
2. **Do not force resolution.** Prefer `OPERATOR_DECISION_REQUIRED`, `CONFLICTING_NEEDS_VERIFICATION`, or `UNKNOWN_INSUFFICIENT` over inventing certainty.
3. Escalate **logo / colour / positioning / claims / canonical identity / market-facing credentials** and similar material conflicts to **Operator**.
4. When a resolution changes usable claims or assets, update **`CLAIMS_REGISTER.md`** and/or **`ASSET_INVENTORY.md`** in the same pass.
5. Losing evidence stays on the row (Source A/B) even after `RESOLVED_*`.
6. Never mark APPROVE BRAND while open `OPERATOR_DECISION_REQUIRED` / blocking `NEEDS_OPERATOR_CONFIRMATION` rows remain on blocking items.

---

## Procedure note

**Evidence Precedence → Conflict-Resolution → Brand Input Audit**

1. Apply **Evidence Precedence** (CLIENT_CONFIRMED > PUBLICLY_OBSERVED / PUBLIC_SOURCE > OBSERVED historical > PROPOSED / INFERRED).  
2. Where two material sources disagree in the same brand context, open a Conflict Register row — do **not** pick a winner silently.  
3. Record resolution state; escalate material identity/claim/visual conflicts as `OPERATOR_DECISION_REQUIRED`.  
4. Reflect open conflicts in Brand Pack §29, Claims Register, and Asset Inventory.  
5. Brand status remains **COMPLETE — AWAITING HUMAN APPROVAL** until Operator resolves remaining blockers and issues APPROVE BRAND.

---

## Summary table

| Conflict ID | Subject | Type | Resolution | Confidence | Action (short) |
|-------------|---------|------|------------|------------|----------------|
| CR-001 | Canonical URL / primary domain | BRAND_ASSET / BUSINESS_FACT | **RESOLVED_A** | High — Operator chose Source A | Canonical = fuegofootball.com.au; plan redirect or retire fuegofa.com.au (plan only) |
| CR-002 | Primary brand mark (logo) | BRAND_ASSET / VISUAL | **RESOLVED_A** (path locked) | High — adopt/polish path locked; masters still missing | Polish live bolt-in-disc + wordmark; request SVG/PNG/PDF masters from client — **not APPROVED until files exist** |
| CR-003 | Primary brand colours (palette) | VISUAL / BRAND_ASSET | **RESOLVED_CONTEXTUAL** (dual-surface LOCKED) | High — Operator stamped surface mapping | Digital/site = rose/charcoal/cream; Agency/print/paid = ember. Ember is NEVER the live-site lock. See `PALETTE_DUAL_SURFACE_PROPOSAL.md` |
| CR-004a | AFC B / coach credentials (ads) | CLAIM | **OPERATOR_APPROVED** / **STAMPED** (REWRITE) | High — exact wording only | Locked: "Led by coaches working within Football Australia coaching education pathways.". Old AFC B badge-wall language **FORBIDDEN** / retired |
| CR-004b | “150+ Players Developed” | CLAIM | **OPERATOR_APPROVED** / **STAMPED** (REWRITE) | High — exact wording only | Locked: "Helping local players develop since 2021.". Old “150+” language **FORBIDDEN** / retired |
| CR-004c | SPL–NPL pathway phrasing | CLAIM | **OPERATOR_APPROVED** / **STAMPED** (CLEAR BOUNDED WORDING) | High — exact wording only | Locked: "Training that supports a player’s pathway ambitions — from Skill Development to selective SPL — without promising selection or NPL progression.". Guaranteed pathway / selection / NPL progression language **FORBIDDEN** / retired |
| CR-VOID-001 | Equipment ecommerce / gear competitors | COMPETITOR / MARKET (VOIDED) | **VOIDED_EXCLUDED** | N/A — excluded per CIP/MIR/Operator | Audit only — never revive in brand use |

---

## Register (detail)

### CR-001 — Canonical URL

| Field | Detail |
|-------|--------|
| **Conflict ID** | CR-001 |
| **Subject** | Primary domain / canonical site |
| **Source A** | https://www.fuegofootball.com.au/ — **PUBLICLY_OBSERVED** live (HTTP 200, light check 2026-09-21); CIP/MIR treat as primary candidate |
| **Source B** | https://www.fuegofa.com.au/ — historically indexed / dual-domain conflict (CIP addendum); this pass fetch failed/unreachable — **losing evidence retained** |
| **Type** | BRAND_ASSET / BUSINESS_FACT (channel identity) |
| **Resolution** | **RESOLVED_A** |
| **Confidence** | High — Operator selected Source A as canonical |
| **Action** | Canonical URL = `https://www.fuegofootball.com.au/`. Plan: `fuegofa.com.au` should **redirect or retire** (plan only — no invented tech/DNS details). Do not invest heavy SEO/ads on the losing domain. |
| **Downstream** | Market Strategy channel hygiene; digital brand system; Asset Inventory canonical row; Claims Register dual-domain row |
| **Operator Decision** | **RESOLVED_A** — Canonical = `https://www.fuegofootball.com.au/`; losing domain redirect/retire plan (plan only). Losing evidence (fuegofa historical) stays in register. |

### CR-002 — Logo

| Field | Detail |
|-------|--------|
| **Conflict ID** | CR-002 |
| **Subject** | Primary brand mark |
| **Source A** | Live-site bolt-in-disc + wordmark — **PUBLICLY_OBSERVED** on fuegofootball.com.au; no Operator-APPROVED masters on file at decision time |
| **Source B** | Redesign / interim wordmark-only paths in `DESIGNER_BRIEF.md` — **losing path (not selected)**; missing-masters gap remains the open delivery risk |
| **Type** | BRAND_ASSET / VISUAL |
| **Resolution** | **RESOLVED_A** — path LOCKED to adopt & polish |
| **Confidence** | High that path is locked; masters remain MISSING / PENDING_CLIENT_DELIVERY — **not silent-APPROVED** |
| **Action** | Adopt & polish live-site bolt-in-disc + wordmark. Update Designer Brief: polish existing mark; request SVG/PNG/PDF masters from client. Asset Inventory: path approved / OBSERVED→adopt locked; masters stay MISSING or PENDING_CLIENT_DELIVERY until files exist. |
| **Asset Inventory** | Path **LOCKED** (adopt/polish). Mark status: adopt locked / masters **MISSING** or **PENDING_CLIENT_DELIVERY** — **never APPROVED** until client files exist. |
| **Downstream** | All polished brand use, ads, guidelines lock, Creative handoff, Designer Brief |
| **Operator Decision** | **RESOLVED_A** — Adopt & polish live-site bolt-in-disc + wordmark. Losing evidence = missing-masters gap (closing via client supply). |
| **Losing evidence** | Missing masters gap — retained until client delivers SVG/PNG/PDF; path locked does **not** equal mark APPROVED. |

### CR-003 — Palette

| Field | Detail |
|-------|--------|
| **Conflict ID** | CR-003 |
| **Subject** | Primary brand colours |
| **Source A** | Live-site rose/charcoal/cream — **PUBLICLY_OBSERVED** CSS tokens (pack §16 / ASSET_INVENTORY): ink `#0E0E0E`, rose `#E69AA4`, cream `#FBF6F4`, muted `#9A9094` (+ soft/card/bright variants) |
| **Source B** | Deeper ember (e.g. `#C45C3A`) — for agency / print / paid surfaces only |
| **Type** | VISUAL / BRAND_ASSET |
| **Resolution** | **RESOLVED_CONTEXTUAL** (dual-surface) |
| **Confidence** | High — Operator stamped dual-surface mapping |
| **Action** | Apply locked mapping below. Ember is **NEVER** the live-site lock. Do not mix rose and ember accents in one ad unit. |
| **Downstream** | Guidelines colour lock (§16), Creative, ads creative, Asset Inventory, Designer Brief |
| **Operator Decision** | **RESOLVED_CONTEXTUAL** — Dual-surface LOCKED:

- **Digital / site:** observed rose / charcoal / cream (`#E69AA4` / `#0E0E0E` / `#FBF6F4` system as documented)
- **Agency / print / paid:** proposed ember (e.g. `#C45C3A`)

Both sides retained as contextual evidence; ember never replaces live-site primary. |

### CR-004a — AFC B / coach credentials (ads / polished brand)

| Field | Detail |
|-------|--------|
| **Conflict ID** | CR-004a (split from CR-004) |
| **Subject** | AFC B / coach diploma language for advertising / polished brand |
| **Source A** | **PUBLICLY_OBSERVED** homepage badge “AFC B Licensed Coaches” + coach bios (Jason Starr AFC B Diploma; Renato Miletic AFC C / undertaking AFC B) — **losing / retired** for polished ads |
| **Source B** | No CLIENT_CONFIRMED / legal clearance for advertising badge walls; MIR flagged claim risk |
| **Type** | CLAIM |
| **Resolution** | **REWRITE** → **OPERATOR_APPROVED** / **STAMPED** (21 Sep 2026) — exact wording only |
| **Confidence** | High — Operator-stamped exact wording; variants forbidden |
| **Claims Register status** | **OPERATOR_APPROVED** — Allowed? **Yes (exact wording only)** |
| **Action** | Use **only** stamped wording below in polished/ad use. Old AFC B badge-wall / “AFC B Licensed Coaches” ad language **FORBIDDEN** / retired. Site-faithful bios may remain on live site context only. See `CLAIM_REWRITE_DRAFTS_CR004.md`. |
| **Stamped wording (locked)** | Led by coaches working within Football Australia coaching education pathways. |
| **Downstream** | Ads, polished badges, Claims Register |
| **Operator Decision** | **REWRITE** stamped **OPERATOR_APPROVED** (21 Sep 2026). Locked exact wording: “Led by coaches working within Football Australia coaching education pathways.”. Old AFC B / badge-wall language retired for polished/ad use. |

### CR-004b — “150+ Players Developed”

| Field | Detail |
|-------|--------|
| **Conflict ID** | CR-004b (split from CR-004) |
| **Subject** | Numeric “150+ Players Developed” (or equivalent) as hero / ad proof |
| **Source A** | **PUBLICLY_OBSERVED** on live site homepage stat — **losing / retired** for polished ads |
| **Source B** | Method / definition UNKNOWN; no CLIENT_CONFIRMED clearance for advertising use |
| **Type** | CLAIM |
| **Resolution** | **REWRITE** → **OPERATOR_APPROVED** / **STAMPED** (21 Sep 2026) — exact wording only |
| **Confidence** | High — Operator-stamped exact wording; variants / substitute numbers forbidden |
| **Claims Register status** | **OPERATOR_APPROVED** — Allowed? **Yes (exact wording only)** |
| **Action** | Use **only** stamped wording below in polished/ad use. Old “150+ Players Developed” (and any invented substitute number) **FORBIDDEN** / retired. See `CLAIM_REWRITE_DRAFTS_CR004.md`. |
| **Stamped wording (locked)** | Helping local players develop since 2021. |
| **Downstream** | Ads, polished stats, Claims Register |
| **Operator Decision** | **REWRITE** stamped **OPERATOR_APPROVED** (21 Sep 2026). Locked exact wording: “Helping local players develop since 2021.”. Old “150+” language retired for polished/ad use. |

### CR-004c — SPL–NPL pathway phrasing

| Field | Detail |
|-------|--------|
| **Conflict ID** | CR-004c (split from CR-004) |
| **Subject** | Pathway language implying SPL / NPL progression |
| **Source A** | **PUBLICLY_OBSERVED** live-site copy on clear pathways including SPL and NPL / high-level academy competitions — broader outcome-promise forms **losing / retired** for polished ads |
| **Source B** | No CLIENT_CONFIRMED clearance for outcome promises; MIR HIGH claim risk if overpromised |
| **Type** | CLAIM |
| **Resolution** | **CLEAR BOUNDED WORDING** → **OPERATOR_APPROVED** / **STAMPED** (21 Sep 2026) — exact wording only |
| **Confidence** | High — Operator-stamped exact wording; guaranteed pathway / selection / NPL progression **FORBIDDEN** |
| **Claims Register status** | **OPERATOR_APPROVED** — Allowed? **Yes (exact wording only)** |
| **Action** | Use **only** stamped wording below in polished/ad use. Guaranteed pathway / guaranteed selection / guaranteed NPL progression language **FORBIDDEN** / retired. See `CLAIM_REWRITE_DRAFTS_CR004.md`. |
| **Stamped wording (locked)** | Training that supports a player’s pathway ambitions — from Skill Development to selective SPL — without promising selection or NPL progression. |
| **Downstream** | Ads, promise boundaries, Claims Register |
| **Operator Decision** | **CLEAR BOUNDED WORDING** stamped **OPERATOR_APPROVED** (21 Sep 2026). Locked exact wording: “Training that supports a player’s pathway ambitions — from Skill Development to selective SPL — without promising selection or NPL progression.”. Old guaranteed-pathway / overpromise language retired. |

### CR-VOID-001 — VOIDED audit row (not a conflict to resolve)

| Field | Detail |
|-------|--------|
| **Conflict ID** | CR-VOID-001 |
| **Subject** | Equipment ecommerce / gear competitors (Ultra Football / Rebel Sport / Football Central; +30% online gear revenue; equipment-only narrative) |
| **Source A** | Prior intake / VOIDED set |
| **Source B** | CIP / MIR / Operator academy model lock (soccer academy / coaching; enrolment hero) |
| **Type** | COMPETITOR / MARKET (excluded) |
| **Resolution** | **VOIDED_EXCLUDED** per CIP/MIR/Operator |
| **Confidence** | N/A — excluded from active brand use |
| **Action** | Keep for audit only — never revive in brand use, pillars, voice, or visuals |
| **Operator Decision** | N/A (voided; not open for resolution) |

---


### CR-002-UPLOAD-HOLD — Operator file uploads (21 Sep 2026) — REFERENCE / MOOD ONLY

| Field | Value |
|-------|-------|
| **Conflict ID** | CR-002-UPLOAD-HOLD (under CR-002) |
| **Subject** | Two Operator uploads — Operator clarified REFERENCE / MOOD ONLY; not masters |
| **Upload A** | Navy bolt-in-ring PNG (`received_unverified/operator_upload_01_navy_bolt_ring.png`) — appears to match third-party NHL Tampa Bay Lightning–style mark |
| **Upload B** | Child photo WEBP (`received_unverified/operator_upload_02_child_photo_fuego_nike.webp`) — “FUEGO” pink-flame + Nike swoosh kit; different identity; child subject |
| **Conflicts with** | **CR-002 RESOLVED_A** locked path = adopt/polish **live-site rose bolt-in-disc** (not navy Lightning-style ring). Upload B also blocked by **§29 A6** (child-image consent) + third-party Nike mark |
| **Resolution** | **REFERENCE_MOOD_ONLY** (Operator clarified 21 Sep 2026) — quarantine/mood board OK; never production brand assets |
| **Action** | Mood reference only. Do **not** adopt as Fuego logo masters or cleared child creative/paid stills. Do **not** clear A1 or A6. CR-002 path remains adopt/polish live-site rose bolt-in-disc. Third-party marks (Lightning-style; Nike swoosh; pink-flame FUEGO kit) = mood only. Still no APPROVE BRAND. |

## Remaining blockers for APPROVE BRAND

Do **not** mark APPROVE BRAND. Brand status remains **COMPLETE — AWAITING HUMAN APPROVAL**.

| Blocker | Status |
|---------|--------|
| **A1 Logo masters** (CR-002) | Path **RESOLVED_A** adopt/polish; masters still **PENDING_CLIENT_DELIVERY** — do not mark logo APPROVED until files exist |
| **A6 Assets / child-image consent** | Keep **REQUIRES_APPROVAL** until logo masters **AND** child-image consent confirmed — do not mass-promote assets to APPROVED |

### §29 A locks — notes (21 Sep 2026 Operator)
| Item | Status |
|------|--------|
| **A1** Logo masters | Still open — **PENDING_CLIENT_DELIVERY** (path RESOLVED_A) |
| **A2** Positioning | **LOCKED** — exact Operator string in Brand Pack §04 |
| **A3** Brand Promise | **LOCKED** — exact Operator string in Brand Pack §05 |
| **A4** Tagline | **LOCKED** — retain “Ignite Your Game”; PROPOSED alternatives not selected / retired |
| **A5** Typography | **LOCKED** digital = Anton / Archivo / Inter; print/paid licensing **PENDING** |
| **A6** Assets | Open — REQUIRES_APPROVAL until masters + child-image consent |

**B1–B9** (handles, fees, KPIs, catchment, defer B2B, legal entity, child-image consent, reply SLA, fuegofa redirect) = operational Brand Gaps / Human Approval notes — **NOT** brand-strategy blockers for the A locks. See Brand Pack §26 / §29.

**Resolved (no longer blocking on claim stamps / A2–A5):**
- **CR-001** — Canonical URL RESOLVED_A (redirect/retire plan for losing domain = B9 operational follow-through)
- **CR-002** — Path RESOLVED_A adopt/polish (masters delivery still blocks mark APPROVED — A1)
- **CR-003** — RESOLVED_CONTEXTUAL dual-surface mapping LOCKED (Digital/site = rose/charcoal/cream; Agency/print/paid = ember; ember never live-site lock)
- **CR-004a / CR-004b / CR-004c** — **OPERATOR_APPROVED** / **STAMPED** (21 Sep 2026) — exact wordings locked; old AFC B / 150+ / guaranteed pathway language **FORBIDDEN** / retired
- **§29 A2 / A3 / A4 / A5** — **LOCKED** (21 Sep 2026)

**Audit-only (not blocking):** CR-VOID-001 — equipment ecommerce / gear competitors — VOIDED_EXCLUDED.

---

**Last updated:** 21 Sep 2026 IST (Brand Studio — Operator clarified uploads = REFERENCE_MOOD_ONLY; A1 + A6 still open; still no APPROVE BRAND)
