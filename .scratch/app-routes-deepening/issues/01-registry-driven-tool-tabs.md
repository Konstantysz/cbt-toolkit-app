# 01 — Generate hidden tool tab screens from the registry

**Strength:** Worth-exploring
**Blocked by:** none

## What to build

- `src/tools/registry.ts`: add `export function getAllTools(): ToolDefinition[]` returning the same `ALL_TOOLS` array `getAllMigrations` uses — **all** tools, not `getEnabledTools()` (a disabled tool's route folder still exists and would otherwise appear as a visible tab; `/new-tool` scaffolds tools as disabled).
- `src/app/_layout.tsx:128-130`: replace the three hand-written `<Tabs.Screen name="(tools)/<id>" options={{ href: null }} />` with
  ```tsx
  {getAllTools().map((t) => (
    <Tabs.Screen key={t.id} name={`(tools)/${t.id}`} options={{ href: null }} />
  ))}
  ```
  (`tool.id` equals the route folder name for all three tools; `routePrefix` works too but is a navigation value.) Keep the screens after `index` and `settings`. The registry import already exists at `_layout.tsx:8`.

## Acceptance criteria

- [ ] `rg -n 'Tabs.Screen name="\(tools\)' src/app/_layout.tsx` returns 0.
- [ ] Test (or manual check on device/web): every registered tool's route group is absent from the tab bar, including a tool with `enabled: false`.
- [ ] Verify at runtime that expo-router accepts the mapped array of `Tabs.Screen` children (expected — it flattens children — but not verified in this sweep since `node_modules` was absent).
- [ ] Optional: note in `.claude/commands/new-tool.md` that no root-layout edit is needed.

## Oracle

```
rg -n 'Tabs.Screen name="\(tools\)' src/app/_layout.tsx   # 3 @ base (lines 128-130)
rg -n "routePrefix:" src/tools                            # 3 (thought-record/index.ts:10, behavioral-experiment/index.ts:10, abc-model/index.ts:9)
```
Reproduced by an independent verifier; independent search found no other tab-hiding sites.

**Deletion-test verdict: real seam, shallow module.** One rule ("every tool route group is a hidden tab") is hand-copied 3× from data the registry already holds, and the copy has been forgotten before (`caba8eb`). But the replacement is a one-line map with no hidden logic — deleting it just moves 3 lines back — so it removes a forgotten step without adding depth. Worth-exploring.
