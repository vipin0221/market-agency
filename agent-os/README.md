# Market-agency export — Agent OS upgrades (2026-09-21)

Package of Lakshmi’s marketing agent upgrades for committing into the **market-agency** repo.

**Do not** `git init` or push from this folder. Copy/merge into the existing market-agency working tree, then commit there.

## Layout

```
market-agency-export/
  README.md
  CHANGELOG_AGENT_OS_2026-09-21.md
  agents/
    INDEX.md
    <kebab-slug>/profile.json     # 9 named agents
  war-room/
    preflight/ROLE_CARDS.md
    CLIENTS/_TEMPLATE/04_BRAND/   # brand SoT template
    STATUS.md
    ISSUES.md
    PROJECT_HANDOFF.md
    README.md
  fuego-brand-snapshot/           # Fuego CLIENT_001 brand SoT (md only)
    received_unverified/README.md # binaries REFERENCE_MOOD_ONLY — not exported
```

## How to merge into market-agency

Suggested mapping (adjust to the repo’s actual paths):

1. **Agents**  
   Copy `agents/<slug>/profile.json` into the market-agency agent registry / harness config that owns named profiles. Use `agents/INDEX.md` for UUID + feature flags (Conflict-Resolution / Research Ledger).

2. **War-room OS**  
   - Merge `war-room/preflight/ROLE_CARDS.md` into the agency preflight / role-card path.  
   - Merge `war-room/CLIENTS/_TEMPLATE/04_BRAND/` into the client template brand folder (Conflict / Claims / Asset / Designer / Brand pack).  
   - Fold root `STATUS.md`, `ISSUES.md`, `PROJECT_HANDOFF.md`, and war-room `README.md` into the agency war-room docs (diff carefully if live status already diverged).

3. **Fuego SoT snapshot**  
   Place `fuego-brand-snapshot/` under the Fuego / CLIENT_001 brand path (or an `exports/` archive if the live tree is already ahead).  
   Do **not** treat `received_unverified/` uploads as approved masters — they are **REFERENCE_MOOD_ONLY** and binaries were intentionally omitted.

4. **Changelog**  
   Keep `CHANGELOG_AGENT_OS_2026-09-21.md` in the repo changelog / docs history.

5. Commit in **market-agency** only (this export folder is a staging drop, not a git root).

## APPROVE BRAND — still blocked

**APPROVE BRAND** remains blocked until:

1. **Masters** are confirmed (canonical logo / identity assets — not mood-only uploads).  
2. **Consent** is on file for any people/brand third-party IP appearing in reference imagery.

Until those clear, keep Fuego uploads as REFERENCE_MOOD_ONLY; do not promote them into locked brand masters.

## What’s included vs skipped

| Included | Skipped |
|----------|---------|
| 9 named agent profiles | Other agents (Hi, Creative Room, Marketing War Room, …) |
| Brand template `04_BRAND/` | Other `_TEMPLATE` folders (intake/research/CIP) — not in this drop |
| Fuego SoT markdown listed in changelog | `*_v1_provisional.md` archives |
| `received_unverified/README.md` | Large preview binaries / HTML under `preview/` |
| War-room root status/handoff docs | Campaign trees |

## Quick verification

```bash
find . -type f | sort
du -sh .
```

See `CHANGELOG_AGENT_OS_2026-09-21.md` for CR-001–004, §29 A2–A5 locked, A1/A6 open, and agent OS notes.
