# 06 — `MultilineField`

**Strength:** Worth-exploring
**Blocked by:** none

## What to build

`src/core/components/MultilineField.tsx`:

```tsx
export function MultilineField(props: { value: string; onChangeText: (s: string) => void; placeholder?: string; minHeight?: number; style?: StyleProp<TextStyle> }): React.JSX.Element;
// surface bg, 1px border, radius.md (12), padding 15, font 15, lineHeight 24, placeholderTextColor, multiline, textAlignVertical="top"
```

`thought-record/components/TextStep.tsx` becomes a prompt label over it (TextStep can stay as a tool-local thin wrapper).

Call sites to repoint (13 inputs, 4 style blocks):
- `src/tools/abc-model/screens/NewAbcFlow.tsx`: style `:76` (minHeight 80), inputs `:237`, `:247`, `:276`, `:286`, `:296`
- `src/tools/behavioral-experiment/screens/NewExperimentFlow.tsx`: style `:77` (minHeight 100), inputs `:325`, `:346`, `:362`, `:378`, `:393`, `:440` (extra margin), `:473`
- `src/tools/thought-record/screens/NewRecordFlow.tsx`: style `:80` (90 inline), input `:245`
- `src/tools/thought-record/components/TextStep.tsx`: style `:25` (default 130), input `:44`

## Acceptance criteria

- [ ] `rg -n "textAlignVertical=\"top\"" src/tools` returns 0.
- [ ] Test at the new interface: renders multiline input with given placeholder/minHeight; typing calls `onChangeText`.
- [ ] Per-site `minHeight` preserved; inputs look identical.
- [ ] Inline style blocks deleted.

## Oracle

```
rg -n "<TextInput" src/tools     # 13 @ base, in 4 files
```
Reproduced by an independent verifier (outside tools only SearchBar uses TextInput — different shape).

**Deletion-test verdict: earns its keep, modestly.** Removes 4 style blocks and ~3 repeated props per site, but the interface is close to `TextInput`'s own — a fairly shallow module. Worth-exploring.
