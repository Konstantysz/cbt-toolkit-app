# 01 — Per-tool data port for export / import / delete-all

**Strength:** Strong
**Blocked by:** none (recommended: fix bugs B1 and B2 from the PRD first, in their own commits, so this slice stays behaviour-preserving)

## What to build

A `ToolDataPort` seam on the tool contract so core loops over tools instead of hard-coding them.

- `src/core/types/tool.ts` — add optional `data?: ToolDataPort` to `ToolDefinition`:
  ```ts
  interface ToolDataPort {
    exportKey: string;                 // 'thoughtRecords' | 'behavioralExperiments' | 'abcEntries'
    required: boolean;                 // v1 file format: abcEntries optional
    exportRows(db: SQLiteDatabase): Promise<unknown[]>;
    validateRow(raw: Record<string, unknown>): string | null;   // same Polish messages as today
    importRow(db: SQLiteDatabase, raw: Record<string, unknown>, now: string): Promise<void>;
    deleteAll(db: SQLiteDatabase): Promise<void>;
  }
  ```
- Each tool implements its port in its own folder (`src/tools/<id>/dataPort.ts`) and sets `data` in `src/tools/<id>/index.ts`.
- `exportData`, `importData`, `validateExportFile` and a new `deleteAllToolData` (in `src/core/data/`) take `tools: ToolDefinition[]` as a parameter — **core never imports `src/tools/registry`**. Callers in `src/app` pass the registry's tool list.
- Core keeps the generic parts: file version check, 5000-record cross-tool cap, duplicate-id check against `tool_entries` (one loop), single import transaction, settings export/restore, imported/skipped counts.

Call sites to repoint:
- `src/core/data/export.ts:7-26` (three JOIN queries), `:35-37` (keys)
- `src/core/data/import.ts:6-37` (Raw* types / ExportFile keys), `:44-65` (validateExportFile per-tool checks), `:97-114` (three duplicate-id loops → one), `:117-224` (three insert blocks → `port.importRow`)
- `src/app/settings/index.tsx:30-31` (tool repository imports — delete), `:166-167` (→ `deleteAllToolData(db, tools)`), and the export/import calls at `:132`, `:142` (pass tools)
- `src/tools/thought-record/index.ts`, `src/tools/behavioral-experiment/index.ts`, `src/tools/abc-model/index.ts` (add `data`)
- Existing per-tool `deleteAll` (`thought-record/repository.ts:179`, `behavioral-experiment/repository.ts:211`, `abc-model/repository.ts:157`) become the ports' `deleteAll`.

Merged from `app-routes` (delete-all via registry): the settings-screen repoint above.

## Acceptance criteria

- [ ] `rg -n "thought_records|behavioral_experiments|abc_entries|thoughtRecords|behavioralExperiments|abcEntries" src/core --glob '!**/__tests__/**'` returns 0.
- [ ] `rg -n "tools/.*/repository" src/app src/core --glob '!**/__tests__/**'` returns 0.
- [ ] `rg -n "from '.*tools/registry'" src/core` returns 0.
- [ ] Tests at the new interface: a round-trip test (export → validate → import) driven through `exportData`/`importData` with fake ports; a test that `deleteAllToolData` calls every port's `deleteAll` in one transaction; per-tool port tests for `validateRow` messages (same Polish strings as today).
- [ ] Exported JSON is byte-compatible with v1 files (same keys; abcEntries still optional on import).
- [ ] Old per-tool code in `export.ts` / `import.ts` deleted.

## Oracle

```
rg -n "thought_records|behavioral_experiments|abc_entries|thoughtRecords|behavioralExperiments|abcEntries" src/core --glob '!**/__tests__/**' | wc -l   # 33 @ base
rg -n "Repo\.deleteAll|tools/.*/repository" src/app src/core --glob '!**/__tests__/**'                                                         # 4 lines: settings/index.tsx:30,31,166,167
rg -n "export async function deleteAll" src/tools                                                                                                # 3 adapters
```
Replayed by an independent verifier: 33 / 4 / 3 reproduce. Independent search found the per-tool rule in 5 core places (export JOINs + keys, import types, validation, dup-id loops, inserts) plus the settings screen.

**Deletion-test verdict: earns its keep.** The per-tool knowledge can't vanish — it currently sits in core, in the wrong place. Remove the port and 33 tool-specific references return across three core functions plus the settings screen, and a fourth tool must edit all of them (violating "adding a tool must not change existing code"). The drift has already caused B1 and B2. Three real adapters exist over the same `tool_entries` + child-table shape.
