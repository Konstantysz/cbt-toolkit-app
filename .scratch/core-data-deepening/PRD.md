# PRD — core-data deepening (mudguard gen 1)

Base: `0aee35bc343619810fc170092413ee5790e32713` (origin/main)
Area paths: `src/core/auth/ src/core/data/ src/core/db/ src/core/settings/ src/core/notifications/ src/core/types/`

## Problem

`src/core` is meant to be shared infrastructure that never knows about individual tools, and adding a tool must not require edits outside that tool's folder. Today two rules leak:

1. **Per-tool persistence knowledge lives in core.** `src/core/data/export.ts` and `src/core/data/import.ts` hard-code each tool's table, columns, export key and validation (33 tool-specific references), and `src/app/settings/index.tsx` imports two tool repositories to implement "delete all data". The copies have already drifted, producing two confirmed bugs (see below).
2. **The core-owned `tool_entries` row is written by hand in every tool.** Insert, progress-update (COALESCE + bool→int + `updated_at` bump only on progress), and the JOIN-envelope select/mapping are duplicated across the three tool repositories and `import.ts`.

## Candidates

| # | Issue | Strength |
|---|---|---|
| 01 | [Per-tool data port for export / import / delete-all](issues/01-tool-data-port.md) | Strong |
| 02 | [`tool_entries` envelope helpers in `src/core/db`](issues/02-tool-entries-envelope.md) | Strong |

Merged in from other areas (cross-area dedup):
- `app-routes` candidate "delete-all via registry" → folded into **01**.
- `tools` candidate "shared tool_entries envelope module" → folded into **02**.

## Confirmed bugs surfaced by the sweep (fix separately, before/alongside the refactor)

- **B1 — importing any behavioral experiment fails and rolls back the whole import.** `src/core/data/import.ts:174` inserts into `alternative_belief` and `execution_notes`; migration `src/tools/behavioral-experiment/migrations/002-recreate-behavioral-experiments.ts` recreates the table without them. All inserts share one transaction (`import.ts:116`), so TR/ABC rows roll back too. In addition `potential_problems`, `problem_strategies`, `confirmation_percent` (exported via `be.*` at `export.ts:15`) are never imported. `import.test.ts` mocks the DB, so tests don't catch it.
- **B2 — "Usuń wszystkie dane" leaves Model ABC data behind.** `src/app/settings/index.tsx:166-167` calls only the thought-record and behavioral-experiment `deleteAll`; `src/tools/abc-model/repository.ts:157` `deleteAll` has no callers. The two calls are also not in one transaction.

## Out of scope

- Settings store shape (`src/core/settings/store.ts`) — standard zustand, no seam.
- `auth/pin.ts`, `auth/store.ts`, `useAuthGuard` — already deep.
- Single-call-site helpers (factory reset, `pendingAction` dispatch, `notifications/permissions.ts`).

## Rejected at verification

- **`rescheduleReminder(time)` (cancel-then-schedule)** — oracle replayed (3 cancel+schedule pairs: `src/app/_layout.tsx:49`, `src/app/settings/index.tsx:113`, `:125-126`) but the deletion test fails: it is a two-line pass-through over `cancelReminder` (itself a one-line wrapper). The verifier found the real simplification is *deleting* the settings-screen calls, because the `_layout.tsx:47-50` effect on `[reminderEnabled, reminderTime]` already reschedules; the parallel `cancel().then(schedule)` from both places is a possible (unconfirmed) duplicate-notification race. Not a deepening — noted for a bug-hunt.

## Settled decisions checked (brain ADRs)

Checked against `cbt-toolkit-brain/Engineering/Decisions` (ADR-001…008) — no candidate re-proposes or contradicts a settled decision.
- **ADR-002 (plugin architecture)** promises "new tools are added by importing them in the registry — zero other files change" and "cross-tool features must live in core". Issue 01 restores that promise (today `core/data/*` and the settings screen must change per tool); core receives the tool list as a parameter so it never imports tools.
- **ADR-006 (clean-cut migrations)** explains bug B1: BE migration 002 dropped/recreated the table, but `import.ts` was not updated with it. ADR-006 also says clean-cut stops being acceptable after v1.0.0 — keeping per-tool import logic next to the tool's migrations (issue 01) is what prevents this class of drift.
- Execution-Plan 4.9 ("ABC missing from export/import", done) fixed export/import for ABC but not delete-all — B2 is the remaining sibling of that bug.
