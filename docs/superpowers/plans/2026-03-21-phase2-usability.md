# Phase 2 Usability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six usability features to the Thought Record tool: enhanced emotion bars, side-by-side compare view, edit records, per-step helper text, search/filter, and onboarding seed record.

**Architecture:** Three sequential implementation stages, each a separate git branch. Stage 1 modifies `RecordDetailScreen` and adds two new screens. Stage 2 adds a reusable `StepHelper` component. Stage 3 adds search and onboarding to `RecordListScreen`. All changes stay within `src/tools/thought-record/` and `src/app/(tools)/thought-record/`.

**Tech Stack:** React Native 0.83, Expo SDK 52, expo-router, expo-sqlite, @react-native-async-storage/async-storage (new), jest-expo + @testing-library/react-native

**Spec:** `docs/superpowers/specs/2026-03-21-phase2-design.md`
**Mockup:** `docs/mockups/phase2-mockup.html`

---

## File Map

### New files
| File | Purpose |
|------|---------|
| `src/app/(tools)/thought-record/[id]/index.tsx` | Detail route (renamed from `[id].tsx`) |
| `src/app/(tools)/thought-record/[id]/compare.tsx` | Compare view route |
| `src/app/(tools)/thought-record/[id]/edit.tsx` | Edit record route |
| `src/tools/thought-record/screens/CompareScreen.tsx` | 4-page side-by-side comparison |
| `src/tools/thought-record/components/StepHelper.tsx` | Collapsible hint component |
| `src/tools/thought-record/migrations/002-add-is-example-flag.ts` | Adds `is_example` column |
| `__tests__/tools/thought-record/RecordDetailScreen.test.tsx` | Tests for enhanced bars + buttons |
| `__tests__/tools/thought-record/CompareScreen.test.tsx` | Tests for compare view |
| `__tests__/tools/thought-record/NewRecordFlow.edit.test.tsx` | Tests for edit mode |
| `__tests__/tools/thought-record/StepHelper.test.tsx` | Tests for helper component |
| `__tests__/tools/thought-record/RecordListScreen.test.tsx` | Tests for search + onboarding |

### Modified files
| File | What changes |
|------|-------------|
| `src/app/(tools)/thought-record/[id].tsx` | **Deleted** — replaced by `[id]/index.tsx` |
| `src/tools/thought-record/screens/RecordDetailScreen.tsx` | Enhanced bars, header buttons |
| `src/tools/thought-record/screens/NewRecordFlow.tsx` | Add `existingId` prop + edit mode |
| `src/tools/thought-record/screens/RecordListScreen.tsx` | Search bar + onboarding seed |
| `src/tools/thought-record/types.ts` | Add `isExample` field |
| `src/tools/thought-record/repository.ts` | Update `DbRow`, `rowToRecord`, add `insertSeedRecord` |
| `src/tools/thought-record/migrations/index.ts` (or wherever migrations are registered) | Export `migration002` |
| `src/tools/thought-record/i18n/pl.ts` | Add all new strings |

---

## ════ STAGE 1: RecordDetailScreen ════

*Branch: `feat/phase2-stage1-detail`*
*Worktree: create with `superpowers:using-git-worktrees` before starting.*

---

### Task 1: Refactor route structure — `[id].tsx` → `[id]/index.tsx`

expo-router requires a directory `[id]/` to support sub-routes like `[id]/compare`. The current `[id].tsx` must become `[id]/index.tsx`.

**Files:**
- Delete: `src/app/(tools)/thought-record/[id].tsx`
- Create: `src/app/(tools)/thought-record/[id]/index.tsx`
- Create (empty stubs): `src/app/(tools)/thought-record/[id]/compare.tsx`, `[id]/edit.tsx`

- [ ] **Step 1: Create the `[id]/` directory and move `index.tsx`**

Create `src/app/(tools)/thought-record/[id]/index.tsx` with identical content to the current `[id].tsx`:

```tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { RecordDetailScreen } from '../../../../tools/thought-record/screens/RecordDetailScreen';

export default function DetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecordDetailScreen id={id} />;
}
```

Note the import path change: `../../../tools/` → `../../../../tools/` (one level deeper).

- [ ] **Step 2: Delete the old `[id].tsx`**

```bash
rm "src/app/(tools)/thought-record/[id].tsx"
```

- [ ] **Step 3: Create stub for `compare.tsx`**

```tsx
// src/app/(tools)/thought-record/[id]/compare.tsx
import React from 'react';
import { View } from 'react-native';

export default function CompareRoute() {
  return <View />;
}
```

- [ ] **Step 4: Create stub for `edit.tsx`**

```tsx
// src/app/(tools)/thought-record/[id]/edit.tsx
import React from 'react';
import { View } from 'react-native';

export default function EditRoute() {
  return <View />;
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/
git commit -m "refactor: convert [id].tsx to [id]/index.tsx for sub-routes"
```

---

### Task 2: Add i18n strings for Stage 1

**Files:**
- Modify: `src/tools/thought-record/i18n/pl.ts`

- [ ] **Step 1: Add compare and edit strings**

Append to the exported `pl` object in `src/tools/thought-record/i18n/pl.ts`:

```ts
export const pl = {
  // ...existing...
  compare: {
    title: 'Widok porównawczy',
    btnLabel: 'Porównaj',
    page1: 'Sytuacja + Emocje',
    page2: 'Emocje + Myśli automatyczne',
    page3: 'Myśli + Argumenty za i przeciw',
    page4: 'Za + Przeciw + Alternatywa',
  },
  edit: {
    title: 'Edytuj zapis',
  },
} as const;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/tools/thought-record/i18n/pl.ts
git commit -m "feat(i18n): add compare and edit strings"
```

---

### Task 3: Enhanced emotion bars — TDD

**Files:**
- Create: `__tests__/tools/thought-record/RecordDetailScreen.test.tsx`
- Modify: `src/tools/thought-record/screens/RecordDetailScreen.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/tools/thought-record/RecordDetailScreen.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { RecordDetailScreen } from '../../../src/tools/thought-record/screens/RecordDetailScreen';
import type { ThoughtRecord } from '../../../src/tools/thought-record/types';

// Mock the hook so we don't need a real SQLite database
jest.mock('../../../src/tools/thought-record/hooks/useThoughtRecords', () => ({
  useThoughtRecord: jest.fn(),
}));

// Mock expo-sqlite context
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: jest.fn(() => ({})),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

import { useThoughtRecord } from '../../../src/tools/thought-record/hooks/useThoughtRecords';
const mockUseThoughtRecord = useThoughtRecord as jest.Mock;

const baseRecord: ThoughtRecord = {
  id: 'test-id',
  situation: 'Test situation',
  situationDate: null,
  emotions: [],
  automaticThoughts: 'Test thoughts',
  evidenceFor: 'For',
  evidenceAgainst: 'Against',
  alternativeThought: 'Alternative',
  outcome: 'Outcome',
  isComplete: true,
  isExample: false,
  currentStep: 7,
  createdAt: '2026-03-21T09:00:00.000Z',
  updatedAt: '2026-03-21T09:00:00.000Z',
};

describe('RecordDetailScreen — emotion bars', () => {
  it('renders ↓ indicator when intensityAfter < intensityBefore', () => {
    mockUseThoughtRecord.mockReturnValue({
      record: {
        ...baseRecord,
        emotions: [{ name: 'Złość', intensityBefore: 75, intensityAfter: 40 }],
      },
      loading: false,
    });

    const { getByText } = render(<RecordDetailScreen id="test-id" />);
    expect(getByText('↓')).toBeTruthy();
  });

  it('does not render ↓ when intensityAfter is undefined', () => {
    mockUseThoughtRecord.mockReturnValue({
      record: {
        ...baseRecord,
        emotions: [{ name: 'Złość', intensityBefore: 75 }],
      },
      loading: false,
    });

    const { queryByText } = render(<RecordDetailScreen id="test-id" />);
    expect(queryByText('↓')).toBeNull();
  });

  it('does not render "po" bar row when intensityAfter is undefined', () => {
    mockUseThoughtRecord.mockReturnValue({
      record: {
        ...baseRecord,
        emotions: [{ name: 'Złość', intensityBefore: 75 }],
      },
      loading: false,
    });

    const { queryByText } = render(<RecordDetailScreen id="test-id" />);
    expect(queryByText('po')).toBeNull();
  });

  it('renders "po" bar row when intensityAfter is defined', () => {
    mockUseThoughtRecord.mockReturnValue({
      record: {
        ...baseRecord,
        emotions: [{ name: 'Złość', intensityBefore: 75, intensityAfter: 40 }],
      },
      loading: false,
    });

    const { getByText } = render(<RecordDetailScreen id="test-id" />);
    expect(getByText('po')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests — expect them to FAIL**

```bash
npx jest __tests__/tools/thought-record/RecordDetailScreen.test.tsx --no-coverage
```

Expected: FAIL (type error: `isExample` not on `ThoughtRecord`, and `↓` not rendered).

- [ ] **Step 3: Add `isExample` to `ThoughtRecord` type**

In `src/tools/thought-record/types.ts`:

```ts
export interface ThoughtRecord {
  id: string;
  situation: string;
  situationDate: string | null;
  emotions: Emotion[];
  automaticThoughts: string;
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
  outcome: string | null;
  isComplete: boolean;
  isExample: boolean;        // ← NEW
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 4: Update `repository.ts` to handle `isExample`**

In `src/tools/thought-record/repository.ts`, add `is_example` to `DbRow` and `rowToRecord`:

```ts
type DbRow = {
  // ...existing fields...
  is_example: number;   // ← NEW
};

function rowToRecord(row: DbRow): ThoughtRecord {
  return {
    // ...existing fields...
    isExample: row.is_example === 1,   // ← NEW
  };
}
```

Also update both SELECT queries in `getRecords` and `getRecordById` — since `is_example` is on `thought_records`, the `tr.*` already covers it.

- [ ] **Step 5: Update `RecordDetailScreen.tsx` — enhanced emotion bars**

Replace the `EmotionRow` and `IntensityBar` components in `RecordDetailScreen.tsx`:

```tsx
function EmotionRow({ emotion }: { emotion: Emotion }) {
  const before = emotion.intensityBefore;
  const after = emotion.intensityAfter;
  const improved = after !== undefined && after < before;

  return (
    <View style={styles.emotionRow}>
      <View style={styles.emotionNameRow}>
        <Text style={styles.emotionName}>{emotion.name}</Text>
        {improved && <Text style={styles.emotionDrop}>↓</Text>}
      </View>
      <View style={styles.intensityBars}>
        <IntensityBar label="przed" value={before} />
        {after !== undefined && <IntensityBar label="po" value={after} accent />}
      </View>
    </View>
  );
}

function IntensityBar({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View style={styles.ibarRow}>
      <Text style={styles.ibarLabel}>{label}</Text>
      <View style={styles.ibarTrack}>
        <View
          style={[
            styles.ibarFill,
            { width: `${value}%` as `${number}%`, backgroundColor: accent ? colors.accent : 'rgba(196,149,106,0.35)' },
          ]}
        />
      </View>
      <Text style={styles.ibarNum}>{value}%</Text>
    </View>
  );
}
```

Update the relevant styles:

```ts
emotionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
emotionNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 90 },
emotionName: { fontSize: 13, color: colors.text },
emotionDrop: { fontSize: 12, color: colors.success, fontWeight: '700' },
ibarTrack: { width: 120, height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
ibarFill: { height: '100%', borderRadius: 3 },
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
npx jest __tests__/tools/thought-record/RecordDetailScreen.test.tsx --no-coverage
```

Expected: 4/4 PASS.

- [ ] **Step 7: Run full suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/tools/thought-record/types.ts src/tools/thought-record/repository.ts src/tools/thought-record/screens/RecordDetailScreen.tsx __tests__/tools/thought-record/RecordDetailScreen.test.tsx
git commit -m "feat: enhanced emotion intensity bars with ↓ indicator"
```

---

### Task 4: Header action buttons in RecordDetailScreen

**Files:**
- Modify: `src/tools/thought-record/screens/RecordDetailScreen.tsx`

- [ ] **Step 1: Replace the header meta section**

In `RecordDetailScreen.tsx`, find the block that renders the date and badge. Replace it with a row containing date+badge on the left and the two action buttons on the right:

```tsx
import { router } from 'expo-router';
import { pl } from '../i18n/pl';

// Inside the main render, before the sections:
<View style={styles.metaRow}>
  <View style={styles.metaLeft}>
    <Text style={styles.headerDate}>{formattedDate}</Text>
    {record.isComplete
      ? <Text style={[styles.badge, styles.badgeComplete]}>Kompletny</Text>
      : <Text style={[styles.badge, styles.badgeInProgress]}>W toku</Text>
    }
  </View>
  <View style={styles.actionBtns}>
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={() => router.push(`/(tools)/thought-record/${id}/compare`)}
    >
      <Text style={styles.actionBtnText}>⊞ {pl.compare.btnLabel}</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={() => router.push(`/(tools)/thought-record/${id}/edit`)}
    >
      <Text style={styles.actionBtnText}>✏ Edytuj</Text>
    </TouchableOpacity>
  </View>
</View>
```

Add styles:

```ts
metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
metaLeft: { flexDirection: 'column', gap: 5 },
actionBtns: { flexDirection: 'row', gap: 8, flexShrink: 0 },
actionBtn: {
  borderWidth: 1, borderColor: colors.border, borderRadius: 9,
  paddingVertical: 6, paddingHorizontal: 10,
},
actionBtnText: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.06 },
```

Remove the old `nav-action` trash icon from the `NavHeader` (if it was there). The delete button stays at the bottom of the scroll area.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Run full suite**

```bash
npm test
```

- [ ] **Step 4: Commit**

```bash
git add src/tools/thought-record/screens/RecordDetailScreen.tsx
git commit -m "feat: add Porównaj and Edytuj action buttons to RecordDetailScreen"
```

---

### Task 5: CompareScreen — TDD

**Files:**
- Create: `__tests__/tools/thought-record/CompareScreen.test.tsx`
- Create: `src/tools/thought-record/screens/CompareScreen.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/tools/thought-record/CompareScreen.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CompareScreen } from '../../../src/tools/thought-record/screens/CompareScreen';
import type { ThoughtRecord } from '../../../src/tools/thought-record/types';

jest.mock('../../../src/tools/thought-record/hooks/useThoughtRecords', () => ({
  useThoughtRecord: jest.fn(),
}));
jest.mock('expo-sqlite', () => ({ useSQLiteContext: jest.fn(() => ({})) }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

import { useThoughtRecord } from '../../../src/tools/thought-record/hooks/useThoughtRecords';
const mockHook = useThoughtRecord as jest.Mock;

const record: ThoughtRecord = {
  id: 'abc',
  situation: 'Test situation text',
  situationDate: null,
  emotions: [{ name: 'Złość', intensityBefore: 75, intensityAfter: 40 }],
  automaticThoughts: 'Test thought',
  evidenceFor: 'Evidence for',
  evidenceAgainst: 'Evidence against',
  alternativeThought: 'Alternative thought',
  outcome: 'Outcome text',
  isComplete: true,
  isExample: false,
  currentStep: 7,
  createdAt: '2026-03-21T09:00:00.000Z',
  updatedAt: '2026-03-21T09:00:00.000Z',
};

describe('CompareScreen', () => {
  beforeEach(() => {
    mockHook.mockReturnValue({ record, loading: false });
  });

  it('shows page 1 label on mount', () => {
    const { getByText } = render(<CompareScreen id="abc" />);
    expect(getByText('Sytuacja + Emocje')).toBeTruthy();
  });

  it('shows situation text on page 1', () => {
    const { getByText } = render(<CompareScreen id="abc" />);
    expect(getByText('Test situation text')).toBeTruthy();
  });

  it('advances to page 2 when › is pressed', () => {
    const { getByText } = render(<CompareScreen id="abc" />);
    fireEvent.press(getByText('›'));
    expect(getByText('Emocje + Myśli automatyczne')).toBeTruthy();
  });

  it('goes back to page 1 when ‹ is pressed from page 2', () => {
    const { getByText } = render(<CompareScreen id="abc" />);
    fireEvent.press(getByText('›'));
    fireEvent.press(getByText('‹'));
    expect(getByText('Sytuacja + Emocje')).toBeTruthy();
  });

  it('shows page 3 label correctly', () => {
    const { getByText } = render(<CompareScreen id="abc" />);
    fireEvent.press(getByText('›'));
    fireEvent.press(getByText('›'));
    expect(getByText('Myśli + Argumenty za i przeciw')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest __tests__/tools/thought-record/CompareScreen.test.tsx --no-coverage
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `CompareScreen.tsx`**

Create `src/tools/thought-record/screens/CompareScreen.tsx`:

```tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors } from '../../../core/theme';
import { useThoughtRecord } from '../hooks/useThoughtRecords';
import { pl } from '../i18n/pl';
import type { Emotion } from '../types';

interface CompareScreenProps {
  id: string;
}

const PAGE_LABELS = [
  pl.compare.page1,
  pl.compare.page2,
  pl.compare.page3,
  pl.compare.page4,
];

const TOTAL_PAGES = 4;

export function CompareScreen({ id }: CompareScreenProps): React.JSX.Element {
  const db = useSQLiteContext();
  const { record, loading } = useThoughtRecord(db, id);
  const [page, setPage] = useState(0); // 0-indexed

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={colors.accent} /></View>;
  }
  if (!record) {
    return <View style={styles.centered}><Text style={styles.errorText}>Nie znaleziono wpisu.</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Dots + label */}
      <View style={styles.topBar}>
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.pageLabel}>{PAGE_LABELS[page]}</Text>
      </View>

      {/* Columns */}
      <View style={styles.cols}>
        <LeftColumn page={page} record={record} />
        <RightColumn page={page} record={record} />
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.arrowBtn, page === 0 && styles.arrowBtnDisabled]}
          onPress={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.pageNum}>{page + 1} / {TOTAL_PAGES}</Text>
        <TouchableOpacity
          style={[styles.arrowBtn, page === TOTAL_PAGES - 1 && styles.arrowBtnDisabled]}
          onPress={() => setPage(p => Math.min(TOTAL_PAGES - 1, p + 1))}
          disabled={page === TOTAL_PAGES - 1}
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ColPanel({ title, children, titleColor }: {
  title: string; children: React.ReactNode; titleColor?: string;
}) {
  return (
    <ScrollView style={styles.col} contentContainerStyle={styles.colContent}>
      <Text style={[styles.colTitle, titleColor ? { color: titleColor } : undefined]}>{title}</Text>
      {children}
    </ScrollView>
  );
}

function ColText({ text }: { text: string }) {
  return <Text style={styles.colText}>{text || '—'}</Text>;
}

function CompactEmotionBars({ emotions }: { emotions: Emotion[] }) {
  return (
    <>
      {emotions.map(em => (
        <View key={em.name} style={styles.compactEmRow}>
          <Text style={styles.compactEmName}>{em.name}{em.intensityAfter !== undefined && em.intensityAfter < em.intensityBefore ? ' ↓' : ''}</Text>
          <View style={styles.compactBars}>
            <View style={styles.compactBarRow}>
              <Text style={styles.compactBarLabel}>przed</Text>
              <View style={styles.compactTrack}>
                <View style={[styles.compactFill, { width: `${em.intensityBefore}%` as `${number}%`, backgroundColor: 'rgba(196,149,106,0.35)' }]} />
              </View>
              <Text style={styles.compactBarNum}>{em.intensityBefore}%</Text>
            </View>
            {em.intensityAfter !== undefined && (
              <View style={styles.compactBarRow}>
                <Text style={styles.compactBarLabel}>po</Text>
                <View style={styles.compactTrack}>
                  <View style={[styles.compactFill, { width: `${em.intensityAfter}%` as `${number}%`, backgroundColor: colors.accent }]} />
                </View>
                <Text style={styles.compactBarNum}>{em.intensityAfter}%</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </>
  );
}

function LeftColumn({ page, record }: { page: number; record: NonNullable<ReturnType<typeof useThoughtRecord>['record']> }) {
  switch (page) {
    case 0: return <ColPanel title="Sytuacja"><ColText text={record.situation} /></ColPanel>;
    case 1: return <ColPanel title="Emocje"><CompactEmotionBars emotions={record.emotions} /></ColPanel>;
    case 2: return <ColPanel title="Myśli automatyczne"><ColText text={record.automaticThoughts} /></ColPanel>;
    case 3: return (
      <ColPanel title="">
        <Text style={[styles.colTitle, { color: colors.success }]}>Argumenty za</Text>
        <ColText text={record.evidenceFor} />
        <View style={styles.subDivider} />
        <Text style={[styles.colTitle, { color: colors.danger }]}>Argumenty przeciw</Text>
        <ColText text={record.evidenceAgainst} />
      </ColPanel>
    );
    default: return null;
  }
}

function RightColumn({ page, record }: { page: number; record: NonNullable<ReturnType<typeof useThoughtRecord>['record']> }) {
  switch (page) {
    case 0: return <ColPanel title="Emocje"><CompactEmotionBars emotions={record.emotions} /></ColPanel>;
    case 1: return <ColPanel title="Myśli automatyczne"><ColText text={record.automaticThoughts} /></ColPanel>;
    case 2: return (
      <ColPanel title="">
        <Text style={[styles.colTitle, { color: colors.success }]}>Argumenty za</Text>
        <ColText text={record.evidenceFor} />
        <View style={styles.subDivider} />
        <Text style={[styles.colTitle, { color: colors.danger }]}>Argumenty przeciw</Text>
        <ColText text={record.evidenceAgainst} />
      </ColPanel>
    );
    case 3: return <ColPanel title="Myśl alternatywna"><ColText text={record.alternativeThought} /></ColPanel>;
    default: return null;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16, paddingBottom: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  errorText: { fontSize: 15, color: colors.textMuted },
  topBar: { alignItems: 'center', paddingVertical: 14, gap: 6 },
  dots: { flexDirection: 'row', gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 18, borderRadius: 3, backgroundColor: colors.accent },
  pageLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase' },
  cols: { flex: 1, flexDirection: 'row', gap: 10 },
  col: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 13 },
  colContent: { padding: 13, gap: 8 },
  colTitle: { fontSize: 14, color: colors.accent, fontWeight: '500', marginBottom: 6 },
  colText: { fontSize: 12, color: colors.text, lineHeight: 19 },
  subDivider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 },
  arrowBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  arrowBtnDisabled: { opacity: 0.25 },
  arrowText: { fontSize: 20, color: colors.textMuted },
  pageNum: { fontSize: 11, color: colors.textDim, letterSpacing: 0.1 },
  compactEmRow: { marginBottom: 10 },
  compactEmName: { fontSize: 11, color: colors.text, marginBottom: 3 },
  compactBars: { gap: 3 },
  compactBarRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  compactBarLabel: { fontSize: 8, color: colors.textDim, width: 24, textAlign: 'right' },
  compactTrack: { width: 72, height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  compactFill: { height: '100%', borderRadius: 3 },
  compactBarNum: { fontSize: 9, color: colors.textMuted },
});
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx jest __tests__/tools/thought-record/CompareScreen.test.tsx --no-coverage
```

Expected: 5/5 PASS.

- [ ] **Step 5: Wire up compare route**

Replace stub in `src/app/(tools)/thought-record/[id]/compare.tsx`:

```tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { CompareScreen } from '../../../../tools/thought-record/screens/CompareScreen';

export default function CompareRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CompareScreen id={id} />;
}
```

- [ ] **Step 6: Run full suite**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/tools/thought-record/screens/CompareScreen.tsx src/app/"(tools)"/thought-record/"[id]"/compare.tsx __tests__/tools/thought-record/CompareScreen.test.tsx
git commit -m "feat: add side-by-side compare view (CompareScreen)"
```

---

### Task 6: Edit mode in NewRecordFlow — TDD

**Files:**
- Create: `__tests__/tools/thought-record/NewRecordFlow.edit.test.tsx`
- Modify: `src/tools/thought-record/screens/NewRecordFlow.tsx`
- Modify: `src/app/(tools)/thought-record/[id]/edit.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/tools/thought-record/NewRecordFlow.edit.test.tsx`:

```tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NewRecordFlow } from '../../../src/tools/thought-record/screens/NewRecordFlow';

jest.mock('expo-sqlite', () => ({ useSQLiteContext: jest.fn(() => ({})) }));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() } }));
jest.mock('../../../src/tools/thought-record/repository', () => ({
  createRecord: jest.fn(),
  getRecordById: jest.fn(),
  updateRecord: jest.fn(),
  deleteRecord: jest.fn(),
}));

import * as repo from '../../../src/tools/thought-record/repository';

const mockGetRecordById = repo.getRecordById as jest.Mock;
const mockCreateRecord = repo.createRecord as jest.Mock;

describe('NewRecordFlow — edit mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRecordById.mockResolvedValue({
      id: 'existing-id',
      situation: 'Loaded situation',
      situationDate: null,
      emotions: [{ name: 'Lęk', intensityBefore: 70 }],
      automaticThoughts: 'Loaded thoughts',
      evidenceFor: '',
      evidenceAgainst: '',
      alternativeThought: '',
      outcome: null,
      isComplete: false,
      isExample: false,
      currentStep: 3,
      createdAt: '2026-03-21T09:00:00.000Z',
      updatedAt: '2026-03-21T09:00:00.000Z',
    });
  });

  it('does NOT call createRecord when existingId is provided', async () => {
    render(<NewRecordFlow existingId="existing-id" />);
    await waitFor(() => expect(mockGetRecordById).toHaveBeenCalledWith(expect.anything(), 'existing-id'));
    expect(mockCreateRecord).not.toHaveBeenCalled();
  });

  it('shows loading state while fetching existing record', () => {
    // getRecordById never resolves in this test
    mockGetRecordById.mockReturnValue(new Promise(() => {}));
    const { getByTestId } = render(<NewRecordFlow existingId="existing-id" />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('pre-populates situation from existing record', async () => {
    const { findByDisplayValue } = render(<NewRecordFlow existingId="existing-id" />);
    // First step shows situation textarea with loaded text
    const input = await findByDisplayValue('Loaded situation');
    expect(input).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest __tests__/tools/thought-record/NewRecordFlow.edit.test.tsx --no-coverage
```

Expected: FAIL (`existingId` prop does not exist yet).

- [ ] **Step 3: Add `existingId` prop and edit mode to `NewRecordFlow.tsx`**

At the top of `NewRecordFlow.tsx`, update the component signature and add loading logic:

```tsx
interface NewRecordFlowProps {
  existingId?: string;
}

export function NewRecordFlow({ existingId }: NewRecordFlowProps): React.JSX.Element {
  const db = useSQLiteContext();
  const [editLoading, setEditLoading] = useState(existingId !== undefined);

  // FlowState initialization
  const [state, setState] = useState<FlowState>({
    recordId: existingId ?? null,  // set immediately so saves use update not create
    situation: '',
    situationDate: todayIso(),
    emotions: [],
    automaticThoughts: '',
    evidenceFor: '',
    evidenceAgainst: '',
    alternativeThought: '',
    outcome: '',
  });

  // Load existing record in edit mode
  useEffect(() => {
    if (!existingId) return;
    repo.getRecordById(db, existingId).then(record => {
      if (!record) return;
      setState({
        recordId: existingId,
        situation: record.situation,
        situationDate: record.situationDate ?? todayIso(),
        emotions: record.emotions,
        automaticThoughts: record.automaticThoughts,
        evidenceFor: record.evidenceFor,
        evidenceAgainst: record.evidenceAgainst,
        alternativeThought: record.alternativeThought,
        outcome: record.outcome ?? '',
      });
    }).finally(() => setEditLoading(false));
  }, [existingId, db]);

  if (editLoading) {
    return (
      <View testID="loading-indicator" style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  // ... rest of the component unchanged
```

In the `saveStep` function, the existing logic already works: if `state.recordId` is set, it uses `updateRecord`. Since we set `recordId: existingId` immediately, `createRecord` is never called. Verify this is the existing pattern in `NewRecordFlow.tsx` and adjust if needed.

On completion ("Zakończ"), navigate back to detail view when in edit mode:

```tsx
// In the finish handler (step 7 "Zakończ" button):
onPress={async () => {
  await saveCurrentStep();
  await repo.updateRecord(db, state.recordId!, { isComplete: true, currentStep: 7 });
  if (existingId) {
    router.replace(`/(tools)/thought-record/${existingId}`);
  } else {
    router.replace('/(tools)/thought-record/');
  }
}}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx jest __tests__/tools/thought-record/NewRecordFlow.edit.test.tsx --no-coverage
```

Expected: 3/3 PASS.

- [ ] **Step 5: Wire up edit route**

Replace stub in `src/app/(tools)/thought-record/[id]/edit.tsx`:

```tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { NewRecordFlow } from '../../../../tools/thought-record/screens/NewRecordFlow';

export default function EditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NewRecordFlow existingId={id} />;
}
```

- [ ] **Step 6: Run full suite**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/tools/thought-record/screens/NewRecordFlow.tsx src/app/"(tools)"/thought-record/"[id]"/edit.tsx __tests__/tools/thought-record/NewRecordFlow.edit.test.tsx
git commit -m "feat: edit existing records via NewRecordFlow existingId prop"
```

---

## ════ STAGE 2: NewRecordFlow — Helper Text ════

*Branch: `feat/phase2-stage2-helpers`*
*Create new worktree from `main` after Stage 1 is merged.*

---

### Task 7: StepHelper component — TDD

**Files:**
- Create: `__tests__/tools/thought-record/StepHelper.test.tsx`
- Create: `src/tools/thought-record/components/StepHelper.tsx`
- Modify: `src/tools/thought-record/i18n/pl.ts`

- [ ] **Step 1: Add i18n strings for helper**

In `src/tools/thought-record/i18n/pl.ts`, add to the `pl` object:

```ts
helper: {
  toggle: 'Wskazówka',
  exampleLabel: 'Przykład',
  hints: {
    step1: '„np. Rano przed wyjściem do pracy poczułem nagły niepokój. Byłem sam w domu, była godzina 8:15."',
    step3: '„np. Nie dam rady. Wszyscy widzą, że jestem słaby. Coś jest ze mną nie tak."',
    step4: '„np. Tydzień temu zapomniałem o ważnym spotkaniu. Zdarza mi się mylić daty."',
    step5: '„np. Przez ostatni rok nie miałem poważnych problemów w pracy. Szef niedawno mnie pochwalił."',
    step6: '„np. Odczuwam niepokój, ale to uczucie przeminie. Mam dowody na to, że sobie radzę."',
  },
},
```

- [ ] **Step 2: Write the failing tests**

Create `__tests__/tools/thought-record/StepHelper.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StepHelper } from '../../../src/tools/thought-record/components/StepHelper';

describe('StepHelper', () => {
  const hint = 'np. Przykładowy tekst wskazówki';

  it('does not show hint text by default', () => {
    const { queryByText } = render(<StepHelper hint={hint} />);
    expect(queryByText(hint)).toBeNull();
  });

  it('shows hint text after pressing toggle button', () => {
    const { getByText } = render(<StepHelper hint={hint} />);
    fireEvent.press(getByText('Wskazówka'));
    expect(getByText(hint)).toBeTruthy();
  });

  it('shows "Przykład" label when open', () => {
    const { getByText } = render(<StepHelper hint={hint} />);
    fireEvent.press(getByText('Wskazówka'));
    expect(getByText('Przykład')).toBeTruthy();
  });

  it('hides hint text after pressing toggle button twice', () => {
    const { getByText, queryByText } = render(<StepHelper hint={hint} />);
    fireEvent.press(getByText('Wskazówka'));
    fireEvent.press(getByText('Wskazówka'));
    expect(queryByText(hint)).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
npx jest __tests__/tools/thought-record/StepHelper.test.tsx --no-coverage
```

Expected: FAIL (module not found).

- [ ] **Step 4: Implement `StepHelper.tsx`**

Create `src/tools/thought-record/components/StepHelper.tsx`:

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../core/theme';
import { pl } from '../i18n/pl';

interface StepHelperProps {
  hint: string;
}

export function StepHelper({ hint }: StepHelperProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity style={styles.toggle} onPress={() => setOpen(o => !o)}>
        <Text style={[styles.toggleText, open && styles.toggleOpen]}>
          💡 {pl.helper.toggle}
        </Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.panel}>
          <Text style={styles.label}>{pl.helper.exampleLabel}</Text>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { paddingVertical: 6, marginTop: 10, alignSelf: 'flex-start' },
  toggleText: { fontSize: 10, color: colors.textDim, letterSpacing: 0.08 },
  toggleOpen: { color: colors.accent },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  label: {
    fontSize: 9,
    color: colors.textDim,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hint: { fontSize: 15, color: colors.textMuted, lineHeight: 22, fontStyle: 'italic' },
});
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npx jest __tests__/tools/thought-record/StepHelper.test.tsx --no-coverage
```

Expected: 4/4 PASS.

- [ ] **Step 6: Run full suite**

```bash
npm test
```

- [ ] **Step 7: Commit**

```bash
git add src/tools/thought-record/components/StepHelper.tsx src/tools/thought-record/i18n/pl.ts __tests__/tools/thought-record/StepHelper.test.tsx
git commit -m "feat: StepHelper collapsible hint component"
```

---

### Task 8: Wire StepHelper into NewRecordFlow

**Files:**
- Modify: `src/tools/thought-record/screens/NewRecordFlow.tsx`

- [ ] **Step 1: Import StepHelper and add to steps 1, 3, 4, 5, 6**

In `NewRecordFlow.tsx`:

```tsx
import { StepHelper } from '../components/StepHelper';
import { pl } from '../i18n/pl';
```

In `Step1Situation` component, after the textarea and before the date-row:
```tsx
<StepHelper hint={pl.helper.hints.step1} />
```

In `Step3AutomaticThoughts`, after the textarea:
```tsx
<StepHelper hint={pl.helper.hints.step3} />
```

In `Step4EvidenceFor`, after the textarea:
```tsx
<StepHelper hint={pl.helper.hints.step4} />
```

In `Step5EvidenceAgainst`, after the textarea:
```tsx
<StepHelper hint={pl.helper.hints.step5} />
```

In `Step6AlternativeThought`, after the textarea:
```tsx
<StepHelper hint={pl.helper.hints.step6} />
```

Steps 2 (EmotionPicker) and 7 (re-rate) do NOT get a `StepHelper`.

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Run full suite**

```bash
npm test
```

- [ ] **Step 4: Commit**

```bash
git add src/tools/thought-record/screens/NewRecordFlow.tsx
git commit -m "feat: add StepHelper hints to steps 1,3,4,5,6 in NewRecordFlow"
```

---

## ════ STAGE 3: RecordListScreen + Onboarding ════

*Branch: `feat/phase2-stage3-list`*
*Create new worktree from `main` after Stage 2 is merged.*

---

### Task 9: Install expo-async-storage

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install**

```bash
npx expo install @react-native-async-storage/async-storage
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @react-native-async-storage/async-storage"
```

---

### Task 10: Migration 002 — `is_example` column

**Files:**
- Create: `src/tools/thought-record/migrations/002-add-is-example-flag.ts`
- Modify: `src/tools/thought-record/index.ts` (wherever migrations array is built)

- [ ] **Step 1: Create migration file**

Create `src/tools/thought-record/migrations/002-add-is-example-flag.ts`:

```ts
import type { Migration } from '../../../core/types/tool';

export const migration002: Migration = {
  id: 'thought-record-002',
  description: 'Add is_example flag to thought_records',
  up: async (db) => {
    await db.execAsync(
      `ALTER TABLE thought_records ADD COLUMN is_example INTEGER NOT NULL DEFAULT 0;`
    );
  },
};
```

- [ ] **Step 2: Register migration in tool definition**

Find `src/tools/thought-record/index.ts`. Add `migration002` to the `migrations` array:

```ts
import { migration001 } from './migrations/001-create-thought-records';
import { migration002 } from './migrations/002-add-is-example-flag';

export const thoughtRecordTool: ToolDefinition = {
  // ...
  migrations: [migration001, migration002],
  // ...
};
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/tools/thought-record/migrations/002-add-is-example-flag.ts src/tools/thought-record/index.ts
git commit -m "feat(db): migration 002 — add is_example column to thought_records"
```

---

### Task 11: Add `insertSeedRecord` to repository

**Files:**
- Modify: `src/tools/thought-record/repository.ts`

- [ ] **Step 1: Add `insertSeedRecord` function**

In `repository.ts`, after `deleteRecord`:

```ts
export async function insertSeedRecord(db: SQLite.SQLiteDatabase): Promise<void> {
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO tool_entries (id, tool_id, created_at, updated_at, is_complete, current_step)
     VALUES (?, 'thought-record', ?, ?, 1, 7)`,
    [id, now, now]
  );

  const emotions = JSON.stringify([
    { name: 'Lęk', intensityBefore: 80, intensityAfter: 45 },
    { name: 'Niepokój', intensityBefore: 75, intensityAfter: 40 },
    { name: 'Wstyd', intensityBefore: 60, intensityAfter: 30 },
  ]);

  await db.runAsync(
    `INSERT INTO thought_records
       (id, situation, emotions, automatic_thoughts, evidence_for, evidence_against,
        alternative_thought, outcome, is_example)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      id,
      'Spotkanie z przełożonym, na którym bałem się oceny mojej pracy. Serce biło szybciej, trudno mi było myśleć jasno.',
      emotions,
      'Na pewno coś powiem nie tak. Szef zobaczy, że jestem niekompetentny. Moje pomysły są do niczego.',
      'Raz popełniłem błąd w raporcie miesiąc temu. Zdarza mi się jąkać przy prezentacjach.',
      'Szef kilka tygodni temu pochwalił mój poprzedni projekt. Mam dobre wyniki od roku. Współpracownicy proszą mnie o pomoc.',
      'Mogę się denerwować i to normalne. Mam konkretne dowody na to, że jestem kompetentny. Jedna rozmowa nie definiuje mnie jako pracownika.',
      'Po ćwiczeniu poczułem się spokojniejszy. Lęk zmniejszył się niemal o połowę.',
    ]
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/tools/thought-record/repository.ts
git commit -m "feat(repo): add insertSeedRecord for onboarding"
```

---

### Task 12: Search + Onboarding in RecordListScreen — TDD

**Files:**
- Create: `__tests__/tools/thought-record/RecordListScreen.test.tsx`
- Modify: `src/tools/thought-record/screens/RecordListScreen.tsx`
- Modify: `src/tools/thought-record/i18n/pl.ts`

- [ ] **Step 1: Add i18n strings for search and onboarding**

In `src/tools/thought-record/i18n/pl.ts`, add:

```ts
search: {
  placeholder: 'Szukaj wpisów...',
  noResults: (q: string) => `Brak wyników dla „${q}"`,
},
onboarding: {
  badge: 'Przykład',
  deleteNote: 'To jest przykładowy wpis. Możesz go usunąć, gdy nie jest już potrzebny.',
},
```

- [ ] **Step 2: Write the failing tests**

Create `__tests__/tools/thought-record/RecordListScreen.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RecordListScreen } from '../../../src/tools/thought-record/screens/RecordListScreen';

jest.mock('expo-sqlite', () => ({ useSQLiteContext: jest.fn(() => ({})) }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../../../src/tools/thought-record/hooks/useThoughtRecords', () => ({
  useThoughtRecords: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('../../../src/tools/thought-record/repository', () => ({
  insertSeedRecord: jest.fn(() => Promise.resolve()),
}));

import { useThoughtRecords } from '../../../src/tools/thought-record/hooks/useThoughtRecords';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as repo from '../../../src/tools/thought-record/repository';

const mockUseThoughtRecords = useThoughtRecords as jest.Mock;
const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockInsertSeed = repo.insertSeedRecord as jest.Mock;

const records = [
  {
    id: '1', situation: 'Kłótnia z partnerem', emotions: [{ name: 'Złość', intensityBefore: 70 }],
    situationDate: null, automaticThoughts: '', evidenceFor: '', evidenceAgainst: '',
    alternativeThought: '', outcome: null, isComplete: true, isExample: false,
    currentStep: 7, createdAt: '2026-03-18T21:14:00.000Z', updatedAt: '2026-03-18T21:14:00.000Z',
  },
  {
    id: '2', situation: 'Spotkanie z szefem', emotions: [{ name: 'Lęk', intensityBefore: 80 }],
    situationDate: null, automaticThoughts: '', evidenceFor: '', evidenceAgainst: '',
    alternativeThought: '', outcome: null, isComplete: true, isExample: false,
    currentStep: 7, createdAt: '2026-03-15T14:32:00.000Z', updatedAt: '2026-03-15T14:32:00.000Z',
  },
];

describe('RecordListScreen — search', () => {
  beforeEach(() => {
    mockUseThoughtRecords.mockReturnValue({ records, loading: false, refresh: jest.fn() });
    mockGetItem.mockResolvedValue('1'); // already seeded — skip onboarding
  });

  it('renders all records when query is empty', () => {
    const { getByText } = render(<RecordListScreen />);
    expect(getByText('Kłótnia z partnerem')).toBeTruthy();
    expect(getByText('Spotkanie z szefem')).toBeTruthy();
  });

  it('filters records by situation text', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<RecordListScreen />);
    fireEvent.changeText(getByPlaceholderText('Szukaj wpisów...'), 'Kłótnia');
    expect(getByText('Kłótnia z partnerem')).toBeTruthy();
    expect(queryByText('Spotkanie z szefem')).toBeNull();
  });

  it('filters records by emotion name', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<RecordListScreen />);
    fireEvent.changeText(getByPlaceholderText('Szukaj wpisów...'), 'Lęk');
    expect(getByText('Spotkanie z szefem')).toBeTruthy();
    expect(queryByText('Kłótnia z partnerem')).toBeNull();
  });

  it('uses OR logic — matches either situation or emotion', () => {
    const { getByPlaceholderText, getByText } = render(<RecordListScreen />);
    fireEvent.changeText(getByPlaceholderText('Szukaj wpisów...'), 'szef');
    // "Spotkanie z szefem" matches situation
    expect(getByText('Spotkanie z szefem')).toBeTruthy();
  });

  it('shows no-results message when nothing matches', () => {
    const { getByPlaceholderText, getByText } = render(<RecordListScreen />);
    fireEvent.changeText(getByPlaceholderText('Szukaj wpisów...'), 'xyzxyz');
    expect(getByText(/Brak wyników/)).toBeTruthy();
  });
});

describe('RecordListScreen — onboarding seed', () => {
  it('inserts seed record when list is empty and flag is not set', async () => {
    mockUseThoughtRecords.mockReturnValue({ records: [], loading: false, refresh: jest.fn() });
    mockGetItem.mockResolvedValue(null); // not yet seeded

    render(<RecordListScreen />);

    await waitFor(() => expect(mockInsertSeed).toHaveBeenCalled());
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('thought-record:onboarding-seeded', '1');
  });

  it('skips seed insertion when flag is already set', async () => {
    mockUseThoughtRecords.mockReturnValue({ records: [], loading: false, refresh: jest.fn() });
    mockGetItem.mockResolvedValue('1'); // already seeded

    render(<RecordListScreen />);

    await waitFor(() => expect(mockGetItem).toHaveBeenCalled());
    expect(mockInsertSeed).not.toHaveBeenCalled();
  });

  it('skips seed insertion when records already exist', async () => {
    mockUseThoughtRecords.mockReturnValue({ records, loading: false, refresh: jest.fn() });
    mockGetItem.mockResolvedValue(null);

    render(<RecordListScreen />);

    // Give async effects time to run
    await new Promise(r => setTimeout(r, 50));
    expect(mockInsertSeed).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
npx jest __tests__/tools/thought-record/RecordListScreen.test.tsx --no-coverage
```

Expected: FAIL (no search input, no seed logic).

- [ ] **Step 4: Update `RecordListScreen.tsx`**

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { colors } from '../../../core/theme';
import { useThoughtRecords } from '../hooks/useThoughtRecords';
import { insertSeedRecord } from '../repository';
import { pl } from '../i18n/pl';
import type { ThoughtRecord } from '../types';

const ONBOARDING_KEY = 'thought-record:onboarding-seeded';

export function RecordListScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { records, loading, refresh } = useThoughtRecords(db);
  const [query, setQuery] = useState('');

  // Onboarding seed
  useEffect(() => {
    if (records.length > 0) return;
    AsyncStorage.getItem(ONBOARDING_KEY).then(val => {
      if (val !== null) return;
      insertSeedRecord(db).then(() => {
        AsyncStorage.setItem(ONBOARDING_KEY, '1');
        refresh();
      });
    });
  }, [records, db, refresh]);

  // Search filter — OR logic, case-insensitive
  const filtered = useMemo(() => {
    if (!query) return records;
    const q = query.toLowerCase();
    return records.filter(r =>
      r.situation.toLowerCase().includes(q) ||
      r.emotions.some(e => e.name.toLowerCase().includes(q))
    );
  }, [records, query]);

  const formatDate = useCallback((iso: string) =>
    format(parseISO(iso), 'd MMM yyyy · HH:mm', { locale: dateFnsPl }), []);

  const renderItem = useCallback(({ item }: { item: ThoughtRecord }) => {
    const emotionNames = item.emotions.map(e => e.name);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tools)/thought-record/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          {item.isExample
            ? <Text style={[styles.badge, styles.badgeExample]}>{pl.onboarding.badge}</Text>
            : item.isComplete
              ? <Text style={[styles.badge, styles.badgeComplete]}>Kompletny</Text>
              : <Text style={[styles.badge, styles.badgeInProgress]}>W toku</Text>
          }
        </View>
        {item.situation
          ? <Text style={styles.situation} numberOfLines={2}>{item.situation}</Text>
          : <Text style={[styles.situation, styles.situationEmpty]}>Brak opisu sytuacji</Text>
        }
        {emotionNames.length > 0 && (
          <View style={styles.tags}>
            {emotionNames.slice(0, 3).map(name => (
              <Text key={name} style={styles.tag}>{name}</Text>
            ))}
            {emotionNames.length > 3 && (
              <Text style={[styles.tag, styles.tagOverflow]}>+{emotionNames.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }, [formatDate]);

  if (loading) return <View style={styles.container} />;

  const showEmpty = filtered.length === 0;
  const showNoResults = showEmpty && query.length > 0;

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={pl.search.placeholder}
          placeholderTextColor={colors.textDim}
          clearButtonMode="while-editing"
        />
      </View>

      {showEmpty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📓</Text>
          {showNoResults
            ? <Text style={styles.emptyText}>{pl.search.noResults(query)}</Text>
            : <>
                <Text style={styles.emptyText}>Brak wpisów</Text>
                <Text style={styles.emptySub}>Dotknij + aby dodać pierwszy zapis myśli.</Text>
              </>
          }
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tools)/thought-record/new')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ...copy existing styles, then add:
  searchWrap: { position: 'relative', marginHorizontal: 16, marginTop: 12, marginBottom: 4 },
  searchIcon: { position: 'absolute', left: 14, top: 11, fontSize: 14, color: colors.textDim, zIndex: 1 },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingVertical: 11, paddingHorizontal: 14, paddingLeft: 36,
    fontSize: 13, color: colors.text,
  },
  badgeExample: { backgroundColor: 'rgba(184,151,74,0.12)', color: colors.inProgress, borderWidth: 1, borderColor: 'rgba(184,151,74,0.25)' },
  // ...all existing styles unchanged
});
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npx jest __tests__/tools/thought-record/RecordListScreen.test.tsx --no-coverage
```

Expected: 8/8 PASS.

- [ ] **Step 6: Run full suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/tools/thought-record/screens/RecordListScreen.tsx src/tools/thought-record/i18n/pl.ts __tests__/tools/thought-record/RecordListScreen.test.tsx
git commit -m "feat: search/filter and onboarding seed record in RecordListScreen"
```

---

## Final Steps (after all 3 stages merged to main)

- [ ] Update `COPY.md` in vault with all new i18n keys
- [ ] Update `EXECUTION_PLAN.md` — mark Phase 2 items complete
- [ ] Update `CURRENT_FOCUS.md` — set Phase 3 as next goal
- [ ] Run `/wrap-up` to create session handoff
- [ ] Tag `v0.2.0`

```bash
git tag v0.2.0
```
