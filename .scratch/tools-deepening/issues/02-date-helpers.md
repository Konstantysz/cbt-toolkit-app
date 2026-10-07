# 02 — Polish date helpers in `src/core/utils/dates.ts`

**Strength:** Strong
**Blocked by:** none (B3 fix can ride on top as a one-line follow-up once this lands)

## What to build

`src/core/utils/dates.ts`:

```ts
export type DateStyle = 'short' | 'shortDateTime' | 'long' | 'longDateTime';
// 'd MMM yyyy' | 'd MMM yyyy · HH:mm' | 'd MMMM yyyy' | 'd MMMM yyyy · HH:mm', locale pl
export function formatDisplayDate(value: string | Date, style: DateStyle): string;
export function toIsoDate(d: Date): string;   // behaviour-preserving: exactly d.toISOString().split('T')[0]
export function todayIsoDate(): string;
```

Call sites to repoint:
- `formatDisplayDate`: `thought-record/screens/RecordListScreen.tsx:153`, `thought-record/screens/NewRecordFlow.tsx:145`, `thought-record/screens/RecordDetailScreen.tsx:260`, `:261`, `abc-model/screens/AbcListScreen.tsx:122`, `abc-model/screens/AbcDetailScreen.tsx:142`, `behavioral-experiment/screens/ExperimentListScreen.tsx:111`, `behavioral-experiment/screens/ExperimentDetailScreen.tsx:242`, `behavioral-experiment/screens/NewExperimentFlow.tsx:425`
- `todayIsoDate`: delete local `todayIso` at `NewRecordFlow.tsx:45-47` and `NewExperimentFlow.tsx:53-55` (callers `NewRecordFlow.tsx:338`, `:369`; `NewExperimentFlow.tsx:150`, `:166`)
- `toIsoDate`: picker handlers `NewRecordFlow.tsx:168`, `NewExperimentFlow.tsx:436`; seed `behavioral-experiment/repository.ts:201`
- Remove the per-file `date-fns/locale` imports (8 files).

## Acceptance criteria

- [ ] `rg -n "date-fns/locale" src --glob '!**/__tests__/**'` matches only `src/core/utils/dates.ts`.
- [ ] `rg -n "toISOString\(\)\.split\('T'\)\[0\]" src --glob '!**/__tests__/**'` matches only `src/core/utils/dates.ts`.
- [ ] Tests at the new interface (`dates.test.ts`): each `DateStyle` produces byte-identical output to today's pattern (including the ` · ` separator and MMM vs MMMM); `toIsoDate`/`todayIsoDate` behaviour pinned.
- [ ] Existing screen tests stay green.
- [ ] Follow-up (separate commit, behaviour change): switch `toIsoDate` to local-date formatting to fix B3 — now a single edit.

## Oracle

```
rg -n "format\(" src --glob '!**/__tests__/**' | rg -v "\.format\b"                              # 9 @ base, all in src/tools
rg -n "date-fns/locale" src --glob '!**/__tests__/**'                                           # 8 files
rg -n "toISOString\(\)\.split\('T'\)\[0\]|function todayIso" src --glob '!**/__tests__/**'      # 6
rg -n "now.split\('T'\)\[0\]" src/tools                                                         # 1
```
Reproduced by an independent verifier; no existing core date utility.

**Deletion-test verdict: earns its keep.** The module owns two rules — the app's Polish date-pattern vocabulary and date-only ISO conversion — that otherwise reappear at 9 + 5 sites across all three tools. The second rule is wrong at every site (B3), which is exactly the cost of not having the seam.
