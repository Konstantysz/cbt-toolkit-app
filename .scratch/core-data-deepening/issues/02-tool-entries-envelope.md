# 02 — `tool_entries` envelope helpers in `src/core/db`

**Strength:** Strong
**Blocked by:** none (if 01 lands first, the `import.ts` sites below live in each tool's `importRow` instead)

## What to build

`src/core/db/toolEntries.ts`, next to `initCoreTables` which already owns the `tool_entries` schema (`src/core/db/database.ts:7`):

```ts
export const ENVELOPE_COLUMNS = 'te.is_complete, te.current_step, te.created_at, te.updated_at';
export interface EnvelopeRow { is_complete: number; current_step: number; created_at: string; updated_at: string }
export function mapEnvelope(row: EnvelopeRow): { isComplete: boolean; currentStep: number; createdAt: string; updatedAt: string };
export async function insertToolEntry(db, toolId: string, id: string, opts?: { createdAt?: string; updatedAt?: string; isComplete?: boolean; currentStep?: number }): Promise<void>;
export async function updateToolEntryProgress(db, id: string, p: { isComplete?: boolean; currentStep?: number }, now?: string): Promise<void>; // no-op when both undefined; the ONLY place updated_at is bumped
export async function deleteToolEntry(db, id: string): Promise<void>;
export async function deleteToolEntriesFor(db, toolId: string): Promise<void>;
```

The justification is `insertToolEntry` + `updateToolEntryProgress` + the envelope select/mapper; the two delete helpers are one-liners included only for completeness of the module.

Callers keep their transaction choice (abc-model wraps writes in `withTransactionAsync`; thought-record and behavioral-experiment don't). abc-model's explicit child-row delete stays in abc-model.

Call sites to repoint:
- `src/tools/thought-record/repository.ts`: insert `:45`, `:150`; progress update `:122-138`; delete `:142`, `:181`; envelope select `:54`, `:68`; row mapping in `rowToRecord` (`:22-39`)
- `src/tools/behavioral-experiment/repository.ts`: insert `:51`, `:181`; progress update `:153-169`; delete `:173`, `:213`; envelope select `:59` (`JOIN_QUERY`); mapping in `rowToExperiment` (`:26-45`)
- `src/tools/abc-model/repository.ts`: insert `:40`, `:139`; progress update `:108-124`; delete `:131`, `:162`; envelope select `:50`, `:64`; mapping in `rowToEntry` (`:19-33`)
- `src/core/data/import.ts`: inserts `:125`, `:164`, `:202`
- `src/core/data/export.ts`: envelope select `:8`, `:15`, `:22`

Merged from `tools` ("shared tool_entries envelope module").

## Acceptance criteria

- [ ] `rg -n "INSERT INTO tool_entries|UPDATE tool_entries" src --glob '!**/__tests__/**'` matches only `src/core/db/toolEntries.ts`.
- [ ] `rg -n "te\.is_complete, te\.current_step" src --glob '!**/__tests__/**'` matches only `src/core/db/toolEntries.ts`.
- [ ] Tests at the new interface (`toolEntries.test.ts`): `updateToolEntryProgress` is a no-op when both fields undefined; converts booleans to 0/1; bumps `updated_at` only when progress changes; `mapEnvelope` maps `is_complete === 1` → `true`.
- [ ] Existing repository tests stay green; content-only updates still don't bump `updated_at`.
- [ ] Inline copies deleted from the three repositories and `import.ts`.

## Oracle

```
rg -n "INSERT INTO tool_entries" src --glob '!**/__tests__/**' | wc -l       # 9 @ base
rg -n "UPDATE tool_entries SET" src --glob '!**/__tests__/**' | wc -l        # 3
rg -n "DELETE FROM tool_entries" src --glob '!**/__tests__/**' | wc -l       # 6
rg -n "updates.isComplete !== undefined" src/tools | wc -l                  # 6 (2 per repo)
rg -n "te.is_complete, te.current_step, te.created_at, te.updated_at" src --glob '!**/__tests__/**' | wc -l   # 8 (5 repos + 3 export)
```
All reproduced by an independent verifier.

**Deletion-test verdict: earns its keep (narrowed).** One rule — the core-owned envelope's insert, the COALESCE/bool→int progress update with "bump `updated_at` only on progress", and the envelope select/mapping — reappears at ≥3 independent sites across 4 files if the module is deleted, and any change to the core schema currently means editing every tool. The delete helpers alone would be pass-throughs (they rely on `ON DELETE CASCADE` + `PRAGMA foreign_keys = ON`) and are not the justification.
