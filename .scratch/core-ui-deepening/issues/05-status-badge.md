# 05 — `StatusBadge` primitive

**Strength:** Strong
**Blocked by:** none

## What to build

`src/core/components/StatusBadge.tsx`:

```tsx
export type StatusTone = 'complete' | 'inProgress' | 'example' | 'planned';
export function StatusBadge(props: { label: string; tone: StatusTone; backgroundColor?: string }): React.JSX.Element;
```

One tone table owns badge colours. Behaviour-preserving step: the table holds today's literals (`rgba(122,158,126,0.12)`, `rgba(184,151,74,0.1)`, example `rgba(184,151,74,0.12)` + border `rgba(184,151,74,0.25)`, planned `rgba(108,142,239,0.12)`), and RecordDetail passes its token colours via `backgroundColor`. Switching the table to theme tokens (and adding tokens for example/planned) is a follow-up visible change.

Call sites to repoint (5 style blocks, 13 render points):
- `src/tools/thought-record/screens/RecordListScreen.tsx`: styles `:37-73` (incl. duplicated `badgeTextComplete`/`badgeTextInProgress`), render `:169`, `:173`, `:177`
- `src/tools/abc-model/screens/AbcListScreen.tsx`: styles `:37-60`, render `:136`, `:140`, `:144`
- `src/tools/behavioral-experiment/screens/ExperimentListScreen.tsx`: styles `:34-57`, render `:131`, `:137`, `:143`
- `src/tools/abc-model/screens/AbcDetailScreen.tsx`: styles `:40-58`, render `:161`, `:165`
- `src/tools/thought-record/screens/RecordDetailScreen.tsx`: styles `:56-88` (tokens `successDim`/`inProgressDim` at `:71-72`), render `:279`, `:283`

Merged from `tools` (status badge part of "entry list screen shell").

## Acceptance criteria

- [ ] `rg -n "^\s+badge: \{" src` returns 0 in tool screens.
- [ ] Test at the new interface: each tone renders its label with the tone's colours; `backgroundColor` overrides.
- [ ] Badges look identical before/after on the default palette.
- [ ] Inline style blocks deleted.

## Oracle

```
rg -n "^\s+badge: \{" src                                                                       # 5 @ base
rg -n "style=\{\[styles\.badge," src                                                            # 13
rg -n "rgba\(122,158,126,0.12\)|rgba\(184,151,74,0.1\)|rgba\(184,151,74,0.12\)" src/tools        # 10 across 4 files
```
Reproduced by an independent verifier.

**Deletion-test verdict: earns its keep.** One visual rule (badge shape + tone colours) duplicated in 5 files / 13 render points, already drifted between tokens and literals; delete the primitive and ~25 style lines return per file.
