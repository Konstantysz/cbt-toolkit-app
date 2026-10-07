# 03 — `useOnboardingSeed` hook

**Strength:** Worth-exploring
**Blocked by:** none (decide intended behaviour for B4 first)

## What to build

`src/core/hooks/useOnboardingSeed.ts`:

```ts
export function useOnboardingSeed(opts: { key: string; loading: boolean; isEmpty: boolean; seed: () => Promise<void>; onSeeded: () => void }): void;
```

Rule: once `!loading && isEmpty`, check the AsyncStorage flag `key`; if unset, `seed()`, set the flag, `onSeeded()`; swallow errors. Combines BE's `!loading` guard with TR/ABC's flag (TR/ABC currently run before the first fetch completes, so a missing flag with existing data would seed anyway).

Call sites to repoint:
- `src/tools/thought-record/screens/RecordListScreen.tsx:15` (key), `:125-140`
- `src/tools/abc-model/screens/AbcListScreen.tsx:15` (key), `:100-113`
- `src/tools/behavioral-experiment/screens/ExperimentListScreen.tsx:97-108` — only if B4 is fixed (adopting the flag changes behaviour: deleted examples stop coming back).

## Acceptance criteria

- [ ] `rg -n "onboarding-seeded" src --glob '!**/__tests__/**'` keys are passed into the hook, not read/written inline.
- [ ] Tests at the new interface: seeds once when empty and flag unset; never seeds while `loading`; never seeds when flag set; errors swallowed.
- [ ] Inline seeding effects deleted from the repointed screens.

## Oracle

```
rg -n "onboarding-seeded" src --glob '!**/__tests__/**'   # 2 @ base (RecordListScreen.tsx:15, AbcListScreen.tsx:15)
rg -n "insertSeed\w+\(db\)" src/tools                    # 3 (RecordListScreen.tsx:132, AbcListScreen.tsx:106, ExperimentListScreen.tsx:102)
```
Reproduced by an independent verifier.

**Deletion-test verdict: earns its keep, thinly.** Only 2 sites share the identical rule today; the third shares it only after its bug (B4) is fixed. Real but narrow seam → Worth-exploring.
