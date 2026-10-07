# 02 — Shared tool-stack header

**Strength:** Strong
**Blocked by:** none

## What to build

`src/core/components/ToolStackHeader.tsx` (imports only `core/theme` and `core/i18n`):

```tsx
export function useToolStackScreenOptions(): NativeStackNavigationOptions; // memoised headerStyle(surface), headerTintColor, headerShadowVisible:false, headerTitleStyle(600), headerTitleAlign:'center'
export function BackToHomeButton(): React.JSX.Element;                   // chevron-back + pl.nav.home label + router.replace('/')
```

Each tool `_layout.tsx` keeps its own `<Stack>` and `Stack.Screen` title list, using `screenOptions={useToolStackScreenOptions()}` and `headerLeft: () => <BackToHomeButton />` on `index`.

Call sites to repoint (byte-identical copies):
- `src/app/(tools)/thought-record/_layout.tsx:8-24` (BackToHome), `:27-37` (options), `:42` (headerLeft)
- `src/app/(tools)/abc-model/_layout.tsx:8-24`, `:27-37`, `:42`
- `src/app/(tools)/behavioral-experiment/_layout.tsx:8-24`, `:27-37`, `:42`

Hard-coded `'Narzędzia'` (line 21 in each) → `pl.nav.home` (`src/core/i18n/pl.ts:3`, same string). Keep `router.replace('/')`, not `back()`.

Merged from `app-routes` ("shared tool-stack layout").

## Acceptance criteria

- [ ] `rg -n "function BackToHome|headerShadowVisible" "src/app/(tools)"` returns 0.
- [ ] Test at the new interface: rendering `BackToHomeButton` shows the `pl.nav.home` label and pressing it calls `router.replace('/')`; `useToolStackScreenOptions` returns the themed options for the current palette.
- [ ] Headers look identical in all three tools.
- [ ] Inline copies deleted.

## Oracle

```
rg -n "function BackToHome|const stackScreenOptions|headerShadowVisible" "src/app/(tools)"   # 3 x 3 @ base
rg -n "chevron-back" src                                                                    # 3
```
Reproduced by two independent verifications (core-ui verifier; app-routes proposer). `src/app/settings/_layout.tsx` uses `headerShown: false` — not a 4th site.

**Deletion-test verdict: earns its keep.** ~30 identical lines (component, styles, header theme) return in every tool layout, and every new tool scaffolded via `/new-tool` copies them again; any header/back-button change needs N matching edits.
