# 01 — Generic entry data hooks in `src/core/hooks`

**Strength:** Strong
**Blocked by:** none

## What to build

`src/core/hooks/useToolEntries.ts`:

```ts
export function useEntryList<T>(db: SQLiteDatabase | null, fetchAll: (db: SQLiteDatabase) => Promise<T[]>, opts?: { loadOnMount?: boolean }): { items: T[]; loading: boolean; refresh: () => Promise<void> };
export function useEntry<T>(db: SQLiteDatabase | null, id: string, fetchById: (db: SQLiteDatabase, id: string) => Promise<T | null>): { item: T | null; loading: boolean };
```

Encodes the shared rule: `refresh` is a no-op when `db` is null; the spinner shows only while the list is empty; `finally` clears loading; `refresh` deps stay `[db, items.length]` so its identity changes exactly as today.

The existing tool hooks become thin, name-preserving wrappers (screens and the tests that mock `../hooks/useX` stay unchanged; wrappers rename `items` → `records` / `experiments` / `entries`):
- `src/tools/thought-record/hooks/useThoughtRecords.ts:6-22` (list), `:24-38` (by id)
- `src/tools/behavioral-experiment/hooks/useBehavioralExperiments.ts:6-22`, `:24-38`
- `src/tools/abc-model/hooks/useAbcEntries.ts:6-26` (list; uses `loadOnMount: true` to keep its mount effect at `:21-23`), `:28-42`

Consumers (unchanged, for regression checking): `RecordListScreen.tsx:115`, `ExperimentListScreen.tsx:87`, `AbcListScreen.tsx:90`; `CompareScreen.tsx:96`, `RecordDetailScreen.tsx:217`, `RecordFormScreen.tsx:92`, `ExperimentDetailScreen.tsx:133`, `AbcDetailScreen.tsx:105`.

## Acceptance criteria

- [ ] `rg -n "if \(\w+\.length === 0\) setLoading\(true\)" src` matches only `src/core/hooks/useToolEntries.ts`.
- [ ] Tests at the new interface (`useToolEntries.test.ts`, via `renderHook`): null db → no fetch; spinner only on empty list; `loadOnMount` triggers an initial fetch only when set; `useEntry` loads and clears loading.
- [ ] Existing hook and screen tests stay green; TR/BE gain no extra fetch.
- [ ] Inline hook bodies deleted from the three tool hook files.

## Oracle

```
rg -n "if \(\w+\.length === 0\) setLoading\(true\)" src   # 3 @ base (line 12 of each hook file)
rg -n "\.then\(set\w+\)" src                             # 3 (useThoughtRecords.ts:33, useBehavioralExperiments.ts:33, useAbcEntries.ts:37)
```
Reproduced by an independent verifier; independent search found no other list/by-id hooks in `src`.

**Deletion-test verdict: earns its keep.** Delete it and the subtle loading-state policy and null-db guard return in 3 list hooks plus the by-id lifecycle in 3 more; each tool still supplies its own fetch function, so the shared hook is a real seam (3 adapters), not a pass-through.
