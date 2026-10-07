# PRD — app-routes deepening (mudguard gen 1)

Base: `0aee35bc343619810fc170092413ee5790e32713` (origin/main)
Area paths: `src/app/`

## Problem

Route files should be thin expo-router shells; adding a tool should mean adding its own folder and a registry entry. Today the root layout hand-lists every tool route group, so a new tool needs an undocumented edit outside its folder (`.claude/commands/new-tool.md` steps 4–6 never mention it). Forgetting it has already shipped a bug once (commit `caba8eb` "fix: hide behavioral-experiment route from tab bar").

## Candidates

| # | Issue | Strength |
|---|---|---|
| 01 | [Generate hidden tool tab screens from the registry](issues/01-registry-driven-tool-tabs.md) | Worth-exploring |

Merged out to other areas (cross-area dedup — survived, filed elsewhere):
- "shared tool-stack layout (header + back-to-home)" → `core-ui-deepening/issues/02-tool-stack-header.md`
- "delete-all data via registry" → `core-data-deepening/issues/01-tool-data-port.md`

## Out of scope

- `useIdParam()` for the 9 `[id]` routes — one-line pass-through.
- Pass-through `index.tsx` / `new.tsx` route files — required by expo-router.
- Settings sub-page header (2 sites), settings row markup, reminder time parsing — single-file or < 3 sites.
- Save/delete/load-by-id flows — they live in tool screens (see tools / core-ui).

## Rejected at verification

None. (Candidate 01 was downgraded Strong → Worth-exploring: real seam, shallow module.)
