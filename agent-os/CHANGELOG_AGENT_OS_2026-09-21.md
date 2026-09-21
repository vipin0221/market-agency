# CHANGELOG — Agent OS upgrades (2026-09-21)

Export package of Lakshmi’s marketing agent upgrades for commit into the **market-agency** repo.

## Summary

Agent operating-system upgrades landed for Brand Studio, Market Intelligence Researcher (MIR), and Client Intelligence Manager (CIM), plus Fuego brand SoT conflict locks. Origin full-stack app remains a parked parts bin (not the merge target).

---

## Brand Studio — Conflict-Resolution OS

- Brand Studio profile upgraded with a **Conflict-Resolution OS**: structured detection, register entries, rewrite drafts, and escalation paths for brand-source conflicts.
- Paired with war-room `CONFLICT_REGISTER.md` / `CLAIMS_REGISTER.md` / designer brief workflow under `CLIENTS/*/04_BRAND/`.
- Flag in export index: **Conflict-Resolution = Yes** for Brand Studio.

## Market Intelligence Researcher (MIR) — Research Ledger

- MIR profile upgraded with **Research Ledger** discipline:
  - Ledger rows for sourced findings
  - **VOIDED** status for superseded / withdrawn claims
  - **ACCEPT RESEARCH** gate before downstream agents consume findings
- Flag in export index: **Research Ledger = Yes** for Market Intelligence Researcher.
- Template research pack / ledger live under `CLIENTS/_TEMPLATE/` (research folders; brand template exported under `04_BRAND/`).

## Client Intelligence Manager (CIM) — CIP

- CIM profile upgraded for **Client Intelligence Package (CIP)** ownership: intake → structured CIP → research handoff.
- Aligns with `_TEMPLATE/02_CLIENT_INTELLIGENCE/` package and handoff docs.

## Fuego brand SoT (CLIENT_001) — CR-001–004 + §29

Source of truth snapshot exported under `fuego-brand-snapshot/` from  
`CLIENTS/CLIENT_001_AU_FOOTBALL_EQUIPMENT/04_BRAND/`.

### Locked

- **CR-001 – CR-004** conflict resolutions locked in `CONFLICT_REGISTER.md`.
- **§29 A2–A5** locked in the brand strategy / guidelines pack.

### Still open

- **A1** and **A6** remain open (not locked).

### Uploads / mood reference

- Operator uploads under `received_unverified/` are **REFERENCE_MOOD_ONLY**.
- Binary previews (PNG/WEBP) are **not** included in this export; only `received_unverified/README.md` is shipped, which documents the REFERENCE_MOOD_ONLY posture.
- Provisional v1 archives (`*_v1_provisional.md`) and large preview binaries/HTML were **skipped**.

## Origin full-stack app

- The origin full-stack application remains a **parked parts bin**.
- It is **not** the merge target for this agent-OS upgrade package.
- Commit / merge path is the **market-agency** repo using this export tree.

## Docs in this package

| Path | Purpose |
|------|---------|
| `README.md` | How to merge into market-agency; APPROVE BRAND gate |
| `CHANGELOG_AGENT_OS_2026-09-21.md` | This file |
| `agents/` | Named agent `profile.json` copies + `INDEX.md` |
| `war-room/` | ROLE_CARDS, brand template, status/handoff docs |
| `fuego-brand-snapshot/` | Fuego SoT markdown (no provisional archives, no large binaries) |
