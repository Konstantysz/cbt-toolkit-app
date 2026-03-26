# Home Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the horizontal-list home screen with a 2-column square-tile grid showing icon + name per tool.

**Architecture:** Single file change — `src/app/index.tsx`. Replace `FlatList` with `ScrollView` + `flexWrap` grid. Card width calculated from screen dimensions. Icons rendered via existing `ToolDefinition.icon` field (Ionicons names already stored there).

**Tech Stack:** React Native, Expo Router, `@expo/vector-icons` (Ionicons), `react-native-safe-area-context`

---

## File Map

| Action | File | Notes |
|---|---|---|
| Modify | `src/app/index.tsx` | Complete rewrite of layout — only file changed |

---

### Task 0: Create worktree

- [ ] **Step 1: Create worktree**

```bash
git worktree add .worktrees/home-redesign -b feat/home-redesign
```

- [ ] **Step 2: Verify baseline tests pass**

```bash
cd F:/cbt-toolkit/cbt-toolkit-app
npx jest --passWithNoTests 2>&1 | tail -5
```

Expected: all tests pass (108/108).

---

### Task 1: Implement 2-column grid home screen

**Files:**
- Modify: `src/app/index.tsx`

- [ ] **Step 1: Replace `src/app/index.tsx` with new implementation**

```tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getEnabledTools } from '../tools/registry';
import { colors, spacing, radius } from '../core/theme';
import type { ToolDefinition } from '../core/types/tool';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_SIZE = (SCREEN_WIDTH - 2 * spacing.lg - spacing.sm) / 2;

export default function HomeScreen(): React.JSX.Element {
  const tools = getEnabledTools();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <Text style={styles.appTitle}>CBT Toolkit</Text>
        <Text style={styles.appSubtitle}>
          Narzędzia terapii poznawczo-behawioralnej
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>NARZĘDZIA</Text>
        <View style={styles.sectionLine} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        {tools.map((tool: ToolDefinition) => (
          <TouchableOpacity
            key={tool.id}
            style={styles.card}
            activeOpacity={0.75}
            onPress={() =>
              router.navigate(
                `/(tools)${tool.routePrefix}` as Parameters<
                  typeof router.navigate
                >[0],
              )
            }
          >
            <View style={styles.cardAccentLine} />
            <Ionicons
              name={tool.icon as React.ComponentProps<typeof Ionicons>['name']}
              size={52}
              color={colors.accent}
            />
            <Text style={styles.toolName}>{tool.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 1.5,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  cardAccentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accentBorder,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 19,
  },
});
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd F:/cbt-toolkit/cbt-toolkit-app
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Run tests**

```bash
npx jest --passWithNoTests 2>&1 | tail -5
```

Expected: 108/108 tests pass (no home screen logic tests exist — this verifies nothing regressed).

- [ ] **Step 4: Run ESLint**

```bash
npx eslint src/app/index.tsx 2>&1
```

Expected: no errors or warnings.

- [ ] **Step 5: Commit**

```bash
git add src/app/index.tsx
git commit -m "feat: redesign home screen with 2-column icon grid"
```

---

### Task 2: PR + merge

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/home-redesign
```

- [ ] **Step 2: Create PR**

```bash
gh pr create \
  --title "feat: home screen 2-column icon grid" \
  --body "$(cat <<'EOF'
## Summary
- Replace FlatList horizontal list with 2-column square tile grid
- Each tile: large Ionicons icon (52px, accent) + tool name
- 2px accent top border on each card
- ScrollView replaces FlatList for future growth
- Zero changes outside src/app/index.tsx

## Test plan
- [ ] 108/108 Jest tests pass
- [ ] TypeScript: no errors
- [ ] ESLint: no errors
- [ ] Visual check on Android emulator
EOF
)"
```

- [ ] **Step 3: Merge PR after CI passes**

```bash
gh pr merge --squash --delete-branch
```

- [ ] **Step 4: Pull main and remove worktree**

```bash
git checkout main && git pull
git worktree remove .worktrees/home-redesign
```
