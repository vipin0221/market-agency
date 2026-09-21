# 04_BRAND — Brand Studio workspace

**Owner:** Brand Studio (Agent 3)  
**Starts after:** Operator **ACCEPT RESEARCH** (Accepted MIR + CIP)  
**Does not create:** GTM, campaigns, or Agent 4 strategy

## Purpose
This folder holds the **Brand Strategy & Guidelines Pack** (30 sections) and supporting registers. Agent 3 defines the **brand system**. Creative Studio later produces final creative assets.

## Files
| File | Role |
|------|------|
| `BRAND_STRATEGY_AND_GUIDELINES_PACK.md` | Full 30-section brand system + FINAL QA |
| `CLAIMS_REGISTER.md` | Standalone claims table (§24 mirror) |
| `ASSET_INVENTORY.md` | Asset statuses APPROVED / AVAILABLE / NEEDS_REVIEW / MISSING / REQUIRES_APPROVAL |
| `CONFLICT_REGISTER.md` | Material source conflicts + resolution states (never force-resolve) |
| `DESIGNER_BRIEF.md` | Logo/identity brief when mark missing or redesign |
| `README.md` | This file |

## Gate
1. Brand Studio completes pack → ends with **`BRAND STATUS: COMPLETE — AWAITING HUMAN APPROVAL`**
2. Operator reviews Human Approval Items
3. Operator **APPROVE BRAND** (also spoken as **ACCEPT BRAND** in some runbooks) → brand **LOCKED**
4. Downstream: **Market Strategy** (Agent 4) + Creative later

## Never
- Invent a logo as approved
- Use VOIDED research / framings
- Create GTM / campaigns / execution
- Silent-adopt scraped assets as APPROVED
- Build Agent 4 strategy inside this folder
