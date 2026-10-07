# 03 — `ConfirmDeleteButton`

**Strength:** Worth-exploring
**Blocked by:** none

## What to build

`src/core/components/ConfirmDeleteButton.tsx`:

```tsx
<ConfirmDeleteButton
  label confirmTitle confirmMessage errorMessage
  cancelLabel?={pl.common default 'Anuluj'} confirmLabel?={pl.common default 'Usuń'}
  onDelete={() => Promise<void>} onDeleted?={() => router.back()}
  borderColor?   // behaviour-preserving override for the two screens using the literal
/>
```

Hides the danger button styling, `Alert.alert` confirm with cancel/destructive, `try { await onDelete(); onDeleted() } catch { Alert.alert('Błąd', errorMessage) }`. The repository call is injected, so core gains no tool dependency.

Call sites to repoint:
- `src/tools/abc-model/screens/AbcDetailScreen.tsx`: styles `:88-97`, handler `:108-124`, render `:216-217`
- `src/tools/thought-record/screens/RecordDetailScreen.tsx`: styles `:112-121`, handler `:221-240`, render `:360-361`
- `src/tools/behavioral-experiment/screens/ExperimentDetailScreen.tsx`: styles `:117-126`, handler `:136-155`, render `:293-294`

Drift: Record uses `colors.dangerBorder`; Abc (`:95`) and Experiment (`:124`) hard-code `'rgba(196,96,90,0.22)'`. Preserve via `borderColor`, or switch all to the token in a separate, visible-change commit.

## Acceptance criteria

- [ ] `rg -n "const confirmDelete|^\s+deleteBtn: \{" src` returns 0 in tool screens.
- [ ] Tests at the new interface: pressing shows a confirm alert; confirming calls `onDelete` then `onDeleted`; a rejected `onDelete` shows the error alert and does not navigate.
- [ ] Inline copies deleted.

## Oracle

```
rg -n "const confirmDelete" src          # 3 @ base
rg -n "^\s+deleteBtn: \{" src            # 3
```
Reproduced by an independent verifier.

**Deletion-test verdict: earns its keep, borderline.** 3 sites with ~35 lines each of styling + async control flow, already drifted. But the interface (≈5 strings + callback) is large relative to the hidden logic, and one independent proposer judged it shallow — so Worth-exploring, not Strong.
