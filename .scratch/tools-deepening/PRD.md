# PRD — tools deepening (mudguard gen 1)

Base: `0aee35bc343619810fc170092413ee5790e32713` (origin/main)
Area paths: `src/tools/`

## Problem

The three tool modules (thought-record, abc-model, behavioral-experiment) were built by copying one another. The same rules — how an entry list/detail is loaded, how dates are formatted and turned into ISO date strings, how the onboarding example is seeded — now live in three copies each. The date copies share a confirmed bug (B3), and the seeding copies have already diverged into a bug (B4).

## Candidates

| # | Issue | Strength |
|---|---|---|
| 01 | [Generic entry data hooks in `src/core/hooks`](issues/01-entry-data-hooks.md) | Strong |
| 02 | [Polish date helpers in `src/core/utils/dates.ts`](issues/02-date-helpers.md) | Strong |
| 03 | [`useOnboardingSeed` hook](issues/03-onboarding-seed-hook.md) | Worth-exploring |

Merged out to other areas (cross-area dedup — survived, filed elsewhere):
- "shared tool_entries envelope module" → `core-data-deepening/issues/02-tool-entries-envelope.md`
- "shared entry list screen shell + status badge" → `core-ui-deepening/issues/04-entry-list-screen.md` (badge → `core-ui-deepening/issues/05-status-badge.md`)

## Confirmed bugs surfaced by the sweep (fix separately)

- **B3 — date-only values use UTC, so dates shift back a day in Poland.** `new Date().toISOString().split('T')[0]` (`thought-record/screens/NewRecordFlow.tsx:46`, `behavioral-experiment/screens/NewExperimentFlow.tsx:54`) returns yesterday between local midnight and 01:00/02:00. Worse, the date-picker handlers (`NewRecordFlow.tsx:168`, `NewExperimentFlow.tsx:436`) convert a local-midnight `Date` via `toISOString()`, which in UTC+1/+2 is the previous day — so every pick stores the day before (inferred from `@react-native-community/datetimepicker` preserving the time of `value`; not yet confirmed on a device). Seed at `behavioral-experiment/repository.ts:201` uses the UTC date too.
- **B4 — behavioral-experiment example re-seeds whenever the list is empty.** `ExperimentListScreen.tsx:97-108` has no AsyncStorage flag (unlike thought-record and abc-model), so deleting the example or all experiments brings the example back on next focus.

## Out of scope

- Shared step-wizard for `New*Flow` — the three flows have different step/validation/navigation rules (hypothetical seam).
- Generic `rowToX` / update builders — child columns are tool-specific; only the envelope part is shared (filed in core-data).
- `registry.ts` — already a small, adequate facade.
- `useConfirmDelete` — covered as a UI component in core-ui.

## Rejected at verification

None.

## Settled decisions checked (brain ADRs)

Checked against `cbt-toolkit-brain/Engineering/Decisions` (ADR-001…008) — no conflicts.
- **ADR-004 (list-screen data refresh)** is exactly the rule issue 01 centralises: `useFocusEffect` refresh + "spinner only on first load" (`if (list.length === 0) setLoading(true)`). Today the ADR's rule is copied in 3 hooks; issue 01 makes the ADR enforceable in one place. Keep the `[db, items.length]` deps the ADR shows.
- **ADR-002**: helpers live in `src/core`, tools opt in; no cross-tool imports.
