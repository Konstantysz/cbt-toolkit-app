# 04 — Shared entry list screen

**Strength:** Strong
**Blocked by:** [05-status-badge](05-status-badge.md) (cards render the badge); benefits from `tools-deepening/issues/01-entry-data-hooks.md` and `tools-deepening/issues/02-date-helpers.md` but does not require them

## What to build

`src/core/components/EntryListScreen.tsx`:

```tsx
export function EntryListScreen<T extends { id: string; createdAt: string }>(props: {
  items: T[]; loading: boolean; refresh: () => void;           // useFocusEffect(refresh) inside
  matches: (item: T, q: string) => boolean;                     // q already lower-cased
  renderBody: (item: T) => React.ReactNode;                     // tool-specific card content
  badge: (item: T) => { tone: StatusTone; label: string };
  formatDate: (iso: string) => string;
  onOpen: (id: string) => void; onAdd: () => void;
  emptyIcon: string;
  strings: { searchPlaceholder: string; empty: string; emptySub: string; noResults: (q: string) => string };
}): React.JSX.Element
```

Hides: identical StyleSheet (container, list, card, cardTop, date, empty*, fab, fabText), focus refresh, search filter memo, blank view while loading, `showEmpty`/`showNoResults`, empty state, FlatList, FAB. Tools keep their Polish strings, search predicate (Record also matches emotion names), card body, date format, and onboarding seeding (see `tools-deepening/issues/03-onboarding-seed-hook.md` — seeding diverges, keep it out of this component).

Call sites to repoint:
- `src/tools/thought-record/screens/RecordListScreen.tsx`: styles `:17-112`, focus `:119-123`, filter `:142-150`, renderItem `:157-209`, shell `:211-249`
- `src/tools/abc-model/screens/AbcListScreen.tsx`: styles `:17-86`, focus `:94-98`, filter `:115-119`, renderItem `:126-161`, shell `:163-199`
- `src/tools/behavioral-experiment/screens/ExperimentListScreen.tsx`: styles `:14-82`, focus `:91-95`, filter `:158-162`, renderItem `:115-156`, shell `:164-200`

Record's empty-state copy is hard-coded ('Brak wpisów'…) — pass via `strings` from i18n.

Merged from `tools` ("shared entry list screen shell").

## Acceptance criteria

- [ ] `rg -n "useFocusEffect\(|^\s+(fab|fabText|emptyIcon|emptyText):" src/tools --glob '!**/__tests__/**'` returns 0.
- [ ] Tests at the new interface: empty state when no items; no-results state with query; filter uses `matches`; FAB calls `onAdd`; card press calls `onOpen`.
- [ ] `RecordListScreen.test.tsx` and `ExperimentListScreen.test.tsx` stay green.
- [ ] Inline shells/styles deleted.

## Oracle

```
rg -n "styles\.fab\b|styles\.empty\b|<SearchBar" src/tools/*/screens/*ListScreen.tsx              # 9 @ base (3 per screen)
rg -n "^\s+(fab|fabText|emptyIcon|emptyText):" src                                                 # 12 (3 per key)
rg -n "useFocusEffect\(" src --glob '!**/__tests__/**'                                              # 3
rg -n "const filtered|showNoResults =|if \(loading\) return" src/tools --glob '!**/__tests__/**'    # 9
```
Reproduced by an independent verifier; SearchBar/FlatList used only in these 3 screens.

**Deletion-test verdict: earns its keep — deep.** ~10 props against ~150 lines of shell, styling and empty/no-results/loading logic per screen; delete it and all of that returns in 3 screens, and a 4th tool pastes it again.
