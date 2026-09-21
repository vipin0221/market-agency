# Project handoff — Brand Marketing Agent Team
**For:** Chief of Staff  
**From:** Hi (coordinator)  
**Operator:** Lakshmi M  
**Date:** 2026-09-11  
**Status:** Team live; Nila Spices E2E complete; fine-tunes applied; War Room live

---

## 1. Product vision
Help clients market their brands to potential customers:

**Form input → specialist agents work → Operator reviews → posts/outbound → insights**

Not an ops-console of static buttons. Feel: plug-in automation with human Operator judgment.

**Vocabulary (strict)**
- **Operator** = Lakshmi (human). Never say “Boss.”
- **Chief of Staff** = you — coordinate, status, chase, gates
- **Workflow** = process/rules (not a person)
- **A1–A5** = specialists

---

## 2. Team roster
| Role | Name | Id |
|------|------|-----|
| CoS | Chief of Staff | `1a256017-c5a9-4976-8f9a-124d910e1938` |
| A1 | Marketing Intake | `7d3a21c8-2098-44e7-8dcf-9a262e9c7baf` |
| A3 | Brand Studio | `1fd56def-ce5c-4a89-a6a0-b5456b41ea54` |
| A2 | Market Strategy | `542fa10c-b968-4358-bcb5-bd09ab19c4f4` |
| A4 | Campaign Execution | `ceb5fb58-cd51-4d4e-b4c9-51687df99ef2` |
| A5 | Campaign Insights | `385a900d-d895-4da0-8ef5-ca1dd4a8cd39` |

**Group chat:** Marketing War Room · id `a0226571-1331-491d-a2e4-00a23d669674`  
(Members: CoS + A1–A5. Max 6 — Hi is not a member; Operator talks to you.)

**Shared files:** `/workspace/marketing-war-room/`
- `STATUS.md` — your board
- `ISSUES.md` — open issues
- `campaigns/<brand>/` — artifacts
- `PROJECT_HANDOFF.md` — this doc

---

## 3. Canonical flow
```
A1 Form + Proofread → Client Brief
    → A3 Brand Guidelines (build if missing / polish if exists) → ACCEPT BRAND
    → A2 GTM Research Pack (may CLARIFICATION_REQUEST A1, max 3) → ACCEPT STRATEGY
    → A4 Content Wave + outbound drafts → APPROVE → DEPLOY or MOCK DEPLOY
    → A5 Performance Report → ACCEPT INSIGHTS → NEXT_WAVE (A4) or PIVOT (A2)
```

**Gates**
- No A2 without accepted brand
- No A4 without accepted GTM
- A5 never invents missing metrics (worksheet first unless Operator/test provides numbers)
- Draft ≠ Deploy on A4; no invented prices/pack sizes

---

## 4. A1 Intake — form (Page 1)
- Business name*  
- Website/URI (optional)  
- Explain business ≤200 words*  
- Audience sector*, age*, geography/market*  
- Primary goal* (awareness / leads / sales / launch / content / outbound / other)  
- Social multi-select* (IG, LinkedIn, Facebook, YouTube, X, WhatsApp, Other)  
- Logo upload/attach if any  
- Brand guidelines yes/no  

**Page 2:** Proofread → EDIT or CONFIRM (required before next)

**A1 does not** build full brand kit anymore (that’s A3).

---

## 5. Agent interaction
- **Light A2↔A1:** blocking gaps only → `CLARIFICATION_REQUEST` / `CLARIFICATION_RESPONSE` + Brief vN; nice-to-haves stay Open questions; Operator sees one-line status; no silent ping-pong
- Full multi-agent mesh = later
- Specialists must **start on handoff same turn** (no standby-only) — fine-tuned after Nila E2E
- Notify CoS + post War Room on stage complete; write files under `campaigns/<brand>/`

---

## 6. What we built before (parked)
Origin project **market-agency**: full-stack ops console (state machine, versions, approvals). Operator found it static/UI-heavy vs “agents working.”  
**Parked as parts bin** — reuse later for OAuth/publish/UI. **Do not demo as the product.** Primary path = these chat agents + War Room.

---

## 7. Nila Spices case (reference E2E)
- D2C South Indian spices; BLR/MAA/HYD; 25–34; awareness + leads; IG + WhatsApp; logo missing; brand missing then A3 built guidelines  
- Path completed A1→A3→A2→A4 (mock deploy)→A5 → **NEXT_WAVE**  
- Artifacts: `/workspace/marketing-war-room/campaigns/nila-spices/` (and `/workspace/nila-spices/`)  
- Clarification test A2↔A1 also PASS 5/5 earlier  

---

## 8. Fine-tunes already applied (post-Nila)
- A1: richer Brief + Open questions + full text to A3  
- A3/A2/A4: start immediately on handoff  
- A2: full pinned handoff to A4; clarify blocking gaps  
- A4: richer items/scripts; full KPI handoff to A5  
- A5: metrics worksheet; no invented KPIs; evidence-tied recommendation  

---

## 9. Out of scope for now
Paid ads, SEO/website, email/CRM, influencer contracting, crisis, full revenue attribution, multi-language, billing. Real IG/LinkedIn OAuth publish = later (mock deploy OK).

---

## 10. Your job with Operator from now
Lakshmi will talk to **you** about improvements. You should:
1. Keep STATUS.md / ISSUES.md / War Room current  
2. Propose improvement backlog (agent prompts, handoffs, form fields, publish connectors)  
3. Route work to specialists; don’t do their craft  
4. Escalate choices to Operator — don’t silent-decide strategy  
5. When she asks to improve X, update the right agent’s behavior via clear instructions in War Room + ask Hi if profile/description edits are needed (Hi owns CreateAgent/UpdateAgent tools)

---

## 11. Suggested improvement backlog (starter)
1. Smoother auto-handoff without external nudges  
2. A1 collect price/pack/language early (helped A4 CTAs)  
3. Real social connect for A4 deploy  
4. Metrics worksheet UX for A5  
5. Optional parallel A3∥A2 after Operator lock  
6. Richer logo path when missing (designer brief)  
7. Revisit Origin app only when OAuth/dashboard needed  

---

**Handoff complete.** Operator owns direction; you own the desk.
