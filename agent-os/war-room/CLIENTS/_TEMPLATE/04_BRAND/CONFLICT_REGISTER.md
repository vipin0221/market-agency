# Conflict Register

**Client:**  
**Client ID:**  
**Owner:** Brand Studio (Agent 3)  
**Related:** Evidence Precedence → Conflict-Resolution Procedure → Brand build  
**Status:** ACTIVE

---

## Purpose

Log **material source conflicts** discovered while building the Brand Strategy & Guidelines Pack. Preserve both sides of every conflict — **never delete losing evidence**. Resolution is recorded here; VOIDED / excluded items stay in the log for audit.

---

## Conflict types

`BUSINESS_FACT` | `BRAND_ASSET` | `POSITIONING` | `AUDIENCE` | `CLAIM` | `COMPETITOR` | `MARKET` | `VISUAL` | `OTHER`

---

## Resolution states

| State | Meaning |
|-------|---------|
| `RESOLVED_A` | Source A wins; Source B retained as losing evidence |
| `RESOLVED_B` | Source B wins; Source A retained as losing evidence |
| `RESOLVED_CONTEXTUAL` | Both valid in different contexts (documented in Same context? notes) |
| `CONFLICTING_NEEDS_VERIFICATION` | Still conflicting; needs further verification |
| `UNKNOWN_INSUFFICIENT` | Evidence insufficient to choose |
| `OPERATOR_DECISION_REQUIRED` | Escalated — Operator must decide |
| `VOIDED_EXCLUDED` | Conflict voided / excluded from active brand use |

---

## Rules

1. **VOIDED_EXCLUDED** rows are excluded from active brand decisions; keep them in this register for history.
2. **Do not force resolution.** Prefer `OPERATOR_DECISION_REQUIRED`, `CONFLICTING_NEEDS_VERIFICATION`, or `UNKNOWN_INSUFFICIENT` over inventing certainty.
3. Escalate **logo / colour / positioning / claims / canonical identity / market-facing credentials** and similar material conflicts to **Operator**.
4. When a resolution changes usable claims or assets, update **`CLAIMS_REGISTER.md`** and/or **`ASSET_INVENTORY.md`** in the same pass.
5. Losing evidence stays on the row (Source A/B, Evidence Type A/B) even after `RESOLVED_*`.

---

## Register

| Conflict ID | Subject | Conflict Type | Source A | Source B | Same context? (Y/N + notes) | Authority A/B | Evidence Type A/B | Resolution State | Confidence | Downstream Impact | Action | Operator Decision |
|-------------|---------|---------------|----------|----------|-----------------------------|----------------|-------------------|------------------|------------|-------------------|--------|-------------------|
| CR-001 | | | | | | | | | | | | |

---

## Operator queue queue

List Conflict IDs in `OPERATOR_DECISION_REQUIRED` (and any blocking `CONFLICTING_NEEDS_VERIFICATION`) for Human Approval / brand LOCK:

- (none yet)

---

**Last updated:**  
