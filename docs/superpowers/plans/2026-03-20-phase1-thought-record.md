# Phase 1: Thought Record MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full Thought Record tool — 7-step guided creation flow, list, detail view, and delete — using SQLiteProvider for DB access.

**Architecture:** `SQLiteProvider` wraps the entire app in `_layout.tsx`; all screens reach the DB via `useSQLiteContext()`. The 7-step wizard lives in a single `NewRecordFlow` component with local React state; it persists to SQLite on every step transition. Steps 3–6 reuse one `TextStep` component parameterised by field key.

**Tech Stack:** React Native 0.83 / Expo SDK 55, expo-sqlite 55 (SQLiteProvider API), expo-router, TypeScript strict, date-fns, @react-native-community/datetimepicker, jest-expo + @testing-library/react-native

---

## File Map

**Modified:**
- `src/app/_layout.tsx` — replace manual openDatabase() with SQLiteProvider + Suspense
- `src/core/db/database.ts` — export initCoreTables (currently private)
- `src/tools/thought-record/hooks/useThoughtRecords.ts` — add useThoughtRecord(db, id) hook
- `src/tools/thought-record/screens/NewRecordFlow.tsx` — full 7-step wizard
- `src/tools/thought-record/screens/RecordListScreen.tsx` — full list with FAB
- `src/tools/thought-record/screens/RecordDetailScreen.tsx` — read-only view + delete

**Created:**
- `src/core/theme/index.ts` — color tokens used by all screens
- `src/core/components/EmotionPicker.tsx` — selectable emotion chips
- `src/core/components/IntensitySlider.tsx` — 0-100 slider with label + value display
- `src/tools/thought-record/components/StepProgress.tsx` — 7-segment progress bar
- `src/tools/thought-record/components/TextStep.tsx` — reusable multi-line text step
- `__tests__/core/components/EmotionPicker.test.tsx`
- `__tests__/core/components/IntensitySlider.test.tsx`
- `__tests__/tools/thought-record/repository.test.ts`
- `jest.config.js`

---

## Task 0: Test infrastructure

**Files:**
- Create: `jest.config.js`
- Modify: `package.json` (add test script + devDeps)

- [ ] **Step 1: Install test packages**

```bash
npx expo install jest-expo @testing-library/react-native
npm install --save-dev @types/jest
```

- [ ] **Step 2: Create jest.config.js**

```js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  testPathPattern: '__tests__',
};
```

- [ ] **Step 3: Add test script to package.json**

In `package.json` scripts section, add:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 4: Verify jest works**

```bash
npm test -- --passWithNoTests
```

Expected: `Test Suites: 0 passed, 0 total` (no errors)

- [ ] **Step 5: Commit**

```bash
git add jest.config.js package.json package-lock.json
git commit -m "chore: add jest-expo test infrastructure"
```

---

## Task 1: Theme tokens

**Files:**
- Create: `src/core/theme/index.ts`

- [ ] **Step 1: Create theme file**

```typescript
export const colors = {
  bg: '#0C0B09',
  surface: '#161510',
  surfaceRaised: '#1E1C17',
  border: '#2C2920',
  borderFocus: '#4A4438',
  accent: '#C4956A',
  accentDim: 'rgba(196,149,106,0.13)',
  accentBorder: 'rgba(196,149,106,0.25)',
  text: '#EDE5D8',
  textMuted: '#8C8276',
  textDim: '#4A453E',
  danger: '#C4605A',
  dangerDim: 'rgba(196,96,90,0.12)',
  success: '#7A9E7E',
  inProgress: '#B8974A',
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
} as const;

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20,
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/core/theme/index.ts
git commit -m "feat: add core theme tokens"
```

---

## Task 2: SQLiteProvider migration

**Files:**
- Modify: `src/core/db/database.ts`
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Export initCoreTables from database.ts**

In `src/core/db/database.ts`, change `async function initCoreTables` to `export async function initCoreTables`.
Remove the `openDatabase` function entirely (no longer needed).

Final file:

```typescript
import * as SQLite from 'expo-sqlite';
import type { Migration } from '../types/tool';

export async function initCoreTables(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tool_entries (
      id TEXT PRIMARY KEY,
      tool_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_complete INTEGER NOT NULL DEFAULT 0,
      current_step INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_tool_entries_tool_id ON tool_entries(tool_id);
    CREATE INDEX IF NOT EXISTS idx_tool_entries_created_at ON tool_entries(created_at);
    CREATE TABLE IF NOT EXISTS migrations_log (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export async function runMigrations(
  db: SQLite.SQLiteDatabase,
  migrations: Migration[]
): Promise<void> {
  for (const migration of migrations) {
    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM migrations_log WHERE id = ?',
      [migration.id]
    );
    if (!existing) {
      await migration.up(db);
      await db.runAsync('INSERT INTO migrations_log (id) VALUES (?)', [migration.id]);
    }
  }
}
```

- [ ] **Step 2: Replace _layout.tsx with SQLiteProvider**

```typescript
import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Tabs } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { initCoreTables, runMigrations } from '../core/db/database';
import { getAllMigrations } from '../tools/registry';
import { pl } from '../core/i18n/pl';
import { colors } from '../core/theme';

async function onInit(db: import('expo-sqlite').SQLiteDatabase) {
  await initCoreTables(db);
  await runMigrations(db, getAllMigrations());
}

function DbLoading() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

export default function RootLayout(): React.JSX.Element {
  return (
    <Suspense fallback={<DbLoading />}>
      <SQLiteProvider databaseName="cbt-toolkit.db" onInit={onInit}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textDim,
          }}
        >
          <Tabs.Screen name="index" options={{ title: pl.nav.home }} />
          <Tabs.Screen name="settings" options={{ title: pl.nav.settings }} />
        </Tabs>
      </SQLiteProvider>
    </Suspense>
  );
}
```

- [ ] **Step 3: Verify app compiles**

```bash
npx expo start --no-dev
```

Scan QR code. Expected: app loads (no white screen crash), home screen shows "Zapis Myśli" card.

- [ ] **Step 4: Commit**

```bash
git add src/core/db/database.ts src/app/_layout.tsx
git commit -m "feat: migrate DB init to SQLiteProvider"
```

---

## Task 3: EmotionPicker component

**Files:**
- Create: `src/core/components/EmotionPicker.tsx`
- Create: `__tests__/core/components/EmotionPicker.test.tsx`

The emotion list lives here (single source of truth for the component).

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/core/components/EmotionPicker.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmotionPicker, PREDEFINED_EMOTIONS } from '../../../src/core/components/EmotionPicker';
import type { Emotion } from '../../../src/tools/thought-record/types';

describe('EmotionPicker', () => {
  const onChange = jest.fn();
  const noEmotions: Emotion[] = [];

  beforeEach(() => onChange.mockClear());

  it('renders all predefined emotions', () => {
    const { getByText } = render(
      <EmotionPicker selected={noEmotions} onChange={onChange} />
    );
    PREDEFINED_EMOTIONS.forEach(e => expect(getByText(e.label)).toBeTruthy());
  });

  it('calls onChange with new emotion when unselected chip is pressed', () => {
    const { getByText } = render(
      <EmotionPicker selected={noEmotions} onChange={onChange} />
    );
    fireEvent.press(getByText('Lęk'));
    expect(onChange).toHaveBeenCalledWith([
      { name: 'Lęk', intensityBefore: 50 },
    ]);
  });

  it('removes emotion when selected chip is pressed again', () => {
    const selected: Emotion[] = [{ name: 'Lęk', intensityBefore: 70 }];
    const { getByText } = render(
      <EmotionPicker selected={selected} onChange={onChange} />
    );
    fireEvent.press(getByText('Lęk'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- EmotionPicker
```

Expected: FAIL — `EmotionPicker` not found

- [ ] **Step 3: Implement EmotionPicker**

```typescript
// src/core/components/EmotionPicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import type { Emotion } from '../../tools/thought-record/types';

export const PREDEFINED_EMOTIONS = [
  { key: 'anxiety',        label: 'Niepokój',       negative: true },
  { key: 'fear',           label: 'Lęk',            negative: true },
  { key: 'sadness',        label: 'Smutek',         negative: true },
  { key: 'anger',          label: 'Złość',          negative: true },
  { key: 'guilt',          label: 'Poczucie winy',  negative: true },
  { key: 'shame',          label: 'Wstyd',          negative: true },
  { key: 'frustration',    label: 'Frustracja',     negative: true },
  { key: 'helplessness',   label: 'Bezradność',     negative: true },
  { key: 'loneliness',     label: 'Samotność',      negative: true },
  { key: 'disappointment', label: 'Rozczarowanie',  negative: true },
  { key: 'jealousy',       label: 'Zazdrość',       negative: true },
  { key: 'disgust',        label: 'Obrzydzenie',    negative: true },
  { key: 'joy',            label: 'Radość',         negative: false },
  { key: 'relief',         label: 'Ulga',           negative: false },
  { key: 'pride',          label: 'Duma',           negative: false },
  { key: 'gratitude',      label: 'Wdzięczność',    negative: false },
  { key: 'hope',           label: 'Nadzieja',       negative: false },
  { key: 'excitement',     label: 'Ekscytacja',     negative: false },
  { key: 'calm',           label: 'Spokój',         negative: false },
  { key: 'satisfaction',   label: 'Satysfakcja',    negative: false },
] as const;

interface Props {
  selected: Emotion[];
  onChange: (emotions: Emotion[]) => void;
}

export function EmotionPicker({ selected, onChange }: Props) {
  const selectedNames = new Set(selected.map(e => e.name));

  function toggle(label: string) {
    if (selectedNames.has(label)) {
      onChange(selected.filter(e => e.name !== label));
    } else {
      onChange([...selected, { name: label, intensityBefore: 50 }]);
    }
  }

  return (
    <View style={styles.grid}>
      {PREDEFINED_EMOTIONS.map(em => {
        const isSelected = selectedNames.has(em.label);
        return (
          <TouchableOpacity
            key={em.key}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => toggle(em.label)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {em.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.accent,
  },
});
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- EmotionPicker
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/core/components/EmotionPicker.tsx __tests__/core/components/EmotionPicker.test.tsx
git commit -m "feat: EmotionPicker shared component"
```

---

## Task 4: IntensitySlider component

**Files:**
- Create: `src/core/components/IntensitySlider.tsx`
- Create: `__tests__/core/components/IntensitySlider.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/core/components/IntensitySlider.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IntensitySlider } from '../../../src/core/components/IntensitySlider';

describe('IntensitySlider', () => {
  it('displays the current value', () => {
    const { getByText } = render(
      <IntensitySlider value={65} onChange={jest.fn()} label="Lęk" />
    );
    expect(getByText('65%')).toBeTruthy();
    expect(getByText('Lęk')).toBeTruthy();
  });

  it('calls onChange when slider value changes', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <IntensitySlider value={50} onChange={onChange} />
    );
    fireEvent(getByTestId('intensity-slider'), 'valueChange', 80);
    expect(onChange).toHaveBeenCalledWith(80);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- IntensitySlider
```

Expected: FAIL

- [ ] **Step 3: Install @react-native-community/slider**

```bash
npx expo install @react-native-community/slider
```

- [ ] **Step 4: Implement IntensitySlider**

```typescript
// src/core/components/IntensitySlider.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme';

interface Props {
  value: number;       // 0–100
  onChange: (v: number) => void;
  label?: string;
}

export function IntensitySlider({ value, onChange, label }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {label ? <Text style={styles.label}>{label}</Text> : <View />}
        <Text style={styles.value}>{value}%</Text>
      </View>
      <Slider
        testID="intensity-slider"
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  slider: { width: '100%', height: 30 },
});
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npm test -- IntensitySlider
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/core/components/IntensitySlider.tsx __tests__/core/components/IntensitySlider.test.tsx package.json
git commit -m "feat: IntensitySlider shared component"
```

---

## Task 5: Add useThoughtRecord hook + install date picker

**Files:**
- Modify: `src/tools/thought-record/hooks/useThoughtRecords.ts`

- [ ] **Step 1: Add useThoughtRecord (singular) to the hook file**

Append to `src/tools/thought-record/hooks/useThoughtRecords.ts`:

```typescript
export function useThoughtRecord(
  db: SQLite.SQLiteDatabase | null,
  id: string
) {
  const [record, setRecord] = useState<ThoughtRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    setLoading(true);
    repo.getRecordById(db, id)
      .then(setRecord)
      .finally(() => setLoading(false));
  }, [db, id]);

  return { record, loading };
}
```

- [ ] **Step 2: Install date picker**

```bash
npx expo install @react-native-community/datetimepicker
```

- [ ] **Step 3: Commit**

```bash
git add src/tools/thought-record/hooks/useThoughtRecords.ts package.json
git commit -m "feat: add useThoughtRecord hook, install datetimepicker"
```

---

## Task 6: NewRecordFlow — scaffold + state + navigation

**Files:**
- Create: `src/tools/thought-record/components/StepProgress.tsx`
- Modify: `src/tools/thought-record/screens/NewRecordFlow.tsx`

- [ ] **Step 1: Create StepProgress component**

```typescript
// src/tools/thought-record/components/StepProgress.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../../core/theme';

interface Props {
  totalSteps: number;
  currentStep: number; // 1-based
}

export function StepProgress({ totalSteps, currentStep }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        let bg = colors.border;
        if (stepNum < currentStep) bg = 'rgba(196,149,106,0.35)';
        if (stepNum === currentStep) bg = colors.accent;
        return <View key={i} style={[styles.seg, { backgroundColor: bg }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, paddingHorizontal: 20, paddingVertical: 12 },
  seg: { flex: 1, height: 3, borderRadius: 2 },
});
```

- [ ] **Step 2: Write NewRecordFlow scaffold**

The full component with state, step navigation, auto-save. Step content is rendered by `renderStep()` — fill in placeholders for now, each step returns a simple `<View />`. Steps 1–7 are implemented in Tasks 7–9.

```typescript
// src/tools/thought-record/screens/NewRecordFlow.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors } from '../../../core/theme';
import { StepProgress } from '../components/StepProgress';
import * as repo from '../repository';
import type { Emotion } from '../types';

const TOTAL_STEPS = 7;

interface FlowState {
  recordId: string | null;
  situation: string;
  situationDate: string;
  emotions: Emotion[];
  automaticThoughts: string;
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
  outcome: string;
}

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

export function NewRecordFlow(): React.JSX.Element {
  const db = useSQLiteContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<FlowState>({
    recordId: null,
    situation: '',
    situationDate: todayIso(),
    emotions: [],
    automaticThoughts: '',
    evidenceFor: '',
    evidenceAgainst: '',
    alternativeThought: '',
    outcome: '',
  });
  const [emotionsError, setEmotionsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Create the DB record on mount
  useEffect(() => {
    repo.createRecord(db).then(record => {
      setState(s => ({ ...s, recordId: record.id }));
    });
  }, [db]);

  const update = useCallback(<K extends keyof FlowState>(key: K, value: FlowState[K]) => {
    setState(s => ({ ...s, [key]: value }));
  }, []);

  async function persistCurrentStep(step: number) {
    if (!state.recordId) return;
    setSaving(true);
    try {
      await repo.updateRecord(db, state.recordId, {
        situation: state.situation,
        situationDate: state.situationDate || null,
        emotions: state.emotions,
        automaticThoughts: state.automaticThoughts,
        evidenceFor: state.evidenceFor,
        evidenceAgainst: state.evidenceAgainst,
        alternativeThought: state.alternativeThought,
        outcome: state.outcome || null,
        currentStep: step,
      });
    } finally {
      setSaving(false);
    }
  }

  async function goNext() {
    if (currentStep === 2 && state.emotions.length === 0) {
      setEmotionsError(true);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setEmotionsError(false);

    if (currentStep === TOTAL_STEPS) {
      await persistCurrentStep(TOTAL_STEPS);
      await repo.updateRecord(db, state.recordId!, { isComplete: true });
      router.replace(`/(tools)/thought-record/${state.recordId}`);
      return;
    }

    await persistCurrentStep(currentStep + 1);
    setCurrentStep(s => s + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  async function goBack() {
    if (currentStep === 1) {
      router.back();
      return;
    }
    await persistCurrentStep(currentStep - 1);
    setCurrentStep(s => s - 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  if (!state.recordId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StepProgress totalSteps={TOTAL_STEPS} currentStep={currentStep} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep(currentStep, state, update, emotionsError)}
      </ScrollView>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.btnGhost} onPress={goBack}>
          <Text style={styles.btnGhostText}>
            {currentStep === 1 ? 'Anuluj' : '← Wstecz'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnPrimary, currentStep === TOTAL_STEPS && styles.btnSuccess]}
          onPress={goNext}
          disabled={saving}
        >
          <Text style={styles.btnPrimaryText}>
            {saving ? '...' : currentStep === TOTAL_STEPS ? 'Zakończ ✓' : 'Dalej →'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Placeholder — replaced in Tasks 7–9
function renderStep(
  step: number,
  state: FlowState,
  update: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void,
  emotionsError: boolean,
): React.ReactNode {
  return <View />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 4 },
  nav: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  btnGhost: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  btnGhostText: { color: colors.textMuted, fontSize: 15 },
  btnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  btnSuccess: { backgroundColor: colors.success },
  btnPrimaryText: { color: colors.bg, fontSize: 15, fontWeight: '600' },
});
```

- [ ] **Step 3: Verify app launches and new record screen shows progress bar**

Open Expo Go → Tap "Zapis Myśli" → Tap "+" button. Expected: progress bar visible, "Anuluj" and "Dalej →" buttons.

- [ ] **Step 4: Commit**

```bash
git add src/tools/thought-record/components/StepProgress.tsx src/tools/thought-record/screens/NewRecordFlow.tsx
git commit -m "feat: NewRecordFlow scaffold with state management and auto-save"
```

---

## Task 7: Steps 1 and 2 — Situation + Emotions

**Files:**
- Create: `src/tools/thought-record/components/TextStep.tsx`
- Modify: `src/tools/thought-record/screens/NewRecordFlow.tsx` (replace renderStep)

- [ ] **Step 1: Create reusable TextStep component**

Used by Steps 1, 3, 4, 5, 6:

```typescript
// src/tools/thought-record/components/TextStep.tsx
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../core/theme';

interface Props {
  prompt: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function TextStep({ prompt, value, onChange, placeholder, minHeight = 130 }: Props) {
  return (
    <View>
      <Text style={styles.prompt}>{prompt}</Text>
      <TextInput
        style={[styles.input, { minHeight }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? ''}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: { fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: 16, fontStyle: 'italic' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
});
```

- [ ] **Step 2: Implement Step 1 (Situation + date)**

Replace `renderStep` in `NewRecordFlow.tsx` with:

```typescript
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { TextStep } from '../components/TextStep';
import { EmotionPicker } from '../../../core/components/EmotionPicker';
import { IntensitySlider } from '../../../core/components/IntensitySlider';
import { pl } from '../i18n/pl';

// Add to FlowState usage in renderStep:
function renderStep(
  step: number,
  state: FlowState,
  update: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void,
  emotionsError: boolean,
): React.ReactNode {
  switch (step) {
    case 1: return <Step1Situation state={state} update={update} />;
    case 2: return <Step2Emotions state={state} update={update} error={emotionsError} />;
    case 3: return (
      <TextStep
        prompt={pl.step3.prompt}
        value={state.automaticThoughts}
        onChange={v => update('automaticThoughts', v)}
        placeholder="Np. Zaraz coś złego się stanie..."
      />
    );
    case 4: return (
      <TextStep
        prompt={pl.step4.prompt}
        value={state.evidenceFor}
        onChange={v => update('evidenceFor', v)}
        placeholder="Np. Ostatnio popełniłem błąd..."
      />
    );
    case 5: return (
      <TextStep
        prompt={pl.step5.prompt}
        value={state.evidenceAgainst}
        onChange={v => update('evidenceAgainst', v)}
        placeholder="Np. Przez ostatni rok radziłem sobie dobrze..."
      />
    );
    case 6: return (
      <TextStep
        prompt={pl.step6.prompt}
        value={state.alternativeThought}
        onChange={v => update('alternativeThought', v)}
        placeholder="Np. Chociaż czuję niepokój, mam wiele dowodów..."
      />
    );
    case 7: return <Step7Outcome state={state} update={update} />;
    default: return null;
  }
}
```

- [ ] **Step 3: Implement Step1Situation sub-component**

Add inside `NewRecordFlow.tsx` (above the main component or in a separate file at same level):

```typescript
function Step1Situation({
  state,
  update,
}: {
  state: FlowState;
  update: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const date = parseISO(state.situationDate);
  const dateLabel = format(date, 'd MMMM yyyy', { locale: dateFnsPl });

  return (
    <View>
      <TextStep
        prompt={pl.step1.prompt}
        value={state.situation}
        onChange={v => update('situation', v)}
        placeholder="Np. Kłótnia z partnerem o obowiązki domowe..."
        minHeight={150}
      />
      <TouchableOpacity
        style={styles.dateRow}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateLabel}>{pl.step1.dateLabel}</Text>
        <Text style={styles.dateValue}>{dateLabel}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          maximumDate={new Date()}
          onChange={(_, selected) => {
            setShowPicker(false);
            if (selected) update('situationDate', selected.toISOString().split('T')[0]);
          }}
        />
      )}
    </View>
  );
}

// Add to styles:
// dateRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center',
//             backgroundColor:colors.surface, borderWidth:1, borderColor:colors.border,
//             borderRadius:12, padding:14, marginTop:14 },
// dateLabel: { fontSize:13, color:colors.textMuted },
// dateValue: { fontSize:14, color:colors.accent, fontWeight:'600' },
```

- [ ] **Step 4: Implement Step2Emotions sub-component**

```typescript
function Step2Emotions({
  state,
  update,
  error,
}: {
  state: FlowState;
  update: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
  error: boolean;
}) {
  return (
    <View>
      <Text style={styles.prompt}>{pl.step2.prompt}</Text>
      {error && (
        <Text style={styles.errorText}>Wybierz co najmniej jedną emocję, aby kontynuować.</Text>
      )}
      <EmotionPicker
        selected={state.emotions}
        onChange={emotions => update('emotions', emotions)}
      />
      {state.emotions.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.fieldLabel}>{pl.step2.intensityLabel}</Text>
          {state.emotions.map(em => (
            <IntensitySlider
              key={em.name}
              label={em.name}
              value={em.intensityBefore}
              onChange={v =>
                update(
                  'emotions',
                  state.emotions.map(e =>
                    e.name === em.name ? { ...e, intensityBefore: v } : e
                  )
                )
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Add to styles:
// prompt: { fontSize:15, color:colors.textMuted, lineHeight:22, marginBottom:12, fontStyle:'italic' },
// fieldLabel: { fontSize:11, color:colors.textMuted, letterSpacing:1.2, textTransform:'uppercase', marginBottom:8 },
// errorText: { fontSize:13, color:colors.danger, fontStyle:'italic', marginBottom:12 },
```

- [ ] **Step 5: Implement Step7Outcome sub-component**

```typescript
function Step7Outcome({
  state,
  update,
}: {
  state: FlowState;
  update: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void;
}) {
  return (
    <View>
      <Text style={styles.prompt}>{pl.step7.prompt}</Text>
      {state.emotions.map(em => (
        <IntensitySlider
          key={em.name}
          label={em.name}
          value={em.intensityAfter ?? em.intensityBefore}
          onChange={v =>
            update(
              'emotions',
              state.emotions.map(e =>
                e.name === em.name ? { ...e, intensityAfter: v } : e
              )
            )
          }
        />
      ))}
      <View style={{ marginTop: 16 }}>
        <Text style={styles.fieldLabel}>Notatki końcowe (opcjonalne)</Text>
        <TextInput
          style={[styles.input, { minHeight: 90 }]}
          value={state.outcome}
          onChangeText={v => update('outcome', v)}
          placeholder="Dodatkowe przemyślenia..."
          placeholderTextColor={colors.textDim}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 6: Test the full flow in Expo Go**

Steps to verify:
1. Tap + → Step 1 loads with text area + date row
2. Type situation → tap Dalej → Step 2 loads
3. Tap no emotion → tap Dalej → error message appears
4. Select Lęk → slider appears → tap Dalej → Step 3
5. Navigate steps 3-6 → each saves on Dalej
6. Step 7 → re-rate slider → tap "Zakończ ✓" → navigate to detail screen

- [ ] **Step 7: Commit**

```bash
git add src/tools/thought-record/components/ src/tools/thought-record/screens/NewRecordFlow.tsx
git commit -m "feat: NewRecordFlow all 7 steps implemented"
```

---

## Task 8: RecordListScreen

**Files:**
- Modify: `src/tools/thought-record/screens/RecordListScreen.tsx`

- [ ] **Step 1: Implement RecordListScreen**

```typescript
// src/tools/thought-record/screens/RecordListScreen.tsx
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { colors } from '../../../core/theme';
import { useThoughtRecords } from '../hooks/useThoughtRecords';
import type { ThoughtRecord } from '../types';

export function RecordListScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { records, loading } = useThoughtRecords(db);

  function formatDate(iso: string) {
    return format(parseISO(iso), 'd MMM yyyy · HH:mm', { locale: dateFnsPl });
  }

  function renderItem({ item }: { item: ThoughtRecord }) {
    const emotionNames = item.emotions.map(e => e.name);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tools)/thought-record/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          {item.isComplete ? (
            <Text style={[styles.badge, styles.badgeComplete]}>Kompletny</Text>
          ) : (
            <Text style={[styles.badge, styles.badgeInProgress]}>W toku</Text>
          )}
        </View>
        {item.situation ? (
          <Text style={styles.situation} numberOfLines={2}>{item.situation}</Text>
        ) : (
          <Text style={[styles.situation, { color: colors.textDim, fontStyle: 'italic' }]}>
            Brak opisu sytuacji
          </Text>
        )}
        {emotionNames.length > 0 && (
          <View style={styles.tags}>
            {emotionNames.slice(0, 3).map(name => (
              <Text key={name} style={styles.tag}>{name}</Text>
            ))}
            {emotionNames.length > 3 && (
              <Text style={[styles.tag, { color: colors.textDim }]}>+{emotionNames.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📓</Text>
          <Text style={styles.emptyText}>Brak wpisów</Text>
          <Text style={styles.emptySub}>Dotknij + aby dodać pierwszy zapis myśli.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
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
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { fontSize: 11, color: colors.textMuted, letterSpacing: 0.5 },
  badge: { fontSize: 10, letterSpacing: 0.8, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', textTransform: 'uppercase' },
  badgeComplete: { backgroundColor: 'rgba(122,158,126,0.12)', color: colors.success },
  badgeInProgress: { backgroundColor: 'rgba(184,151,74,0.1)', color: colors.inProgress },
  situation: { fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { fontSize: 10, color: colors.accent, backgroundColor: colors.accentDim, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyIcon: { fontSize: 40, opacity: 0.2 },
  emptyText: { fontSize: 18, color: colors.textMuted, fontStyle: 'italic' },
  emptySub: { fontSize: 13, color: colors.textDim, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { fontSize: 28, color: colors.bg, lineHeight: 32, fontWeight: '300' },
});
```

- [ ] **Step 2: Test in Expo Go**

- Back-navigate to home, tap Zapis Myśli
- List shows existing incomplete record ("W toku") + any completed ones
- FAB taps to new record flow
- Tapping a record navigates to `[id]` route (detail screen — stub for now)

- [ ] **Step 3: Commit**

```bash
git add src/tools/thought-record/screens/RecordListScreen.tsx
git commit -m "feat: RecordListScreen with list, FAB, empty state"
```

---

## Task 9: RecordDetailScreen + delete

**Files:**
- Modify: `src/tools/thought-record/screens/RecordDetailScreen.tsx`
- Modify: `src/app/(tools)/thought-record/[id].tsx` (pass id param)

- [ ] **Step 1: Update [id].tsx route to pass id**

```typescript
// src/app/(tools)/thought-record/[id].tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { RecordDetailScreen } from '../../../../tools/thought-record/screens/RecordDetailScreen';

export default function DetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecordDetailScreen id={id} />;
}
```

- [ ] **Step 2: Implement RecordDetailScreen**

```typescript
// src/tools/thought-record/screens/RecordDetailScreen.tsx
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { format, parseISO } from 'date-fns';
import { pl as dateFnsPl } from 'date-fns/locale';
import { colors } from '../../../core/theme';
import { useThoughtRecord } from '../hooks/useThoughtRecords';
import * as repo from '../repository';
import type { Emotion } from '../types';

interface Props {
  id: string;
}

export function RecordDetailScreen({ id }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const { record, loading } = useThoughtRecord(db, id);

  function confirmDelete() {
    Alert.alert(
      'Usuń wpis',
      'Czy na pewno chcesz usunąć ten zapis? Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await repo.deleteRecord(db, id);
            router.back();
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Nie znaleziono wpisu.</Text>
      </View>
    );
  }

  const formattedDate = record.situationDate
    ? format(parseISO(record.situationDate), 'd MMMM yyyy', { locale: dateFnsPl })
    : format(parseISO(record.createdAt), 'd MMMM yyyy · HH:mm', { locale: dateFnsPl });

  const sections = [
    { step: '01', title: 'Sytuacja', text: record.situation },
    { step: '03', title: 'Myśli automatyczne', text: record.automaticThoughts },
    { step: '04', title: 'Argumenty za', text: record.evidenceFor },
    { step: '05', title: 'Argumenty przeciw', text: record.evidenceAgainst },
    { step: '06', title: 'Myśl alternatywna', text: record.alternativeThought },
    { step: '07', title: 'Podsumowanie', text: record.outcome ?? '' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerDate}>{formattedDate}</Text>
          {record.isComplete ? (
            <Text style={[styles.badge, styles.badgeComplete]}>Kompletny</Text>
          ) : (
            <Text style={[styles.badge, styles.badgeInProgress]}>W toku</Text>
          )}
        </View>

        {/* Emotions (step 02) */}
        <View style={styles.section}>
          <Text style={styles.stepNum}>Krok 02</Text>
          <Text style={styles.stepTitle}>Emocje</Text>
          {record.emotions.length === 0 ? (
            <Text style={styles.emptyField}>—</Text>
          ) : (
            record.emotions.map(em => (
              <EmotionRow key={em.name} emotion={em} />
            ))
          )}
        </View>
        <View style={styles.divider} />

        {/* Text sections */}
        {sections.map((sec, i) => (
          <React.Fragment key={sec.step}>
            <View style={styles.section}>
              <Text style={styles.stepNum}>Krok {sec.step}</Text>
              <Text style={styles.stepTitle}>{sec.title}</Text>
              <Text style={[styles.bodyText, !sec.text && styles.emptyField]}>
                {sec.text || '—'}
              </Text>
            </View>
            {i < sections.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}

        {/* Delete button */}
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
          <Text style={styles.deleteBtnText}>Usuń wpis</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function EmotionRow({ emotion }: { emotion: Emotion }) {
  const before = emotion.intensityBefore;
  const after = emotion.intensityAfter;
  return (
    <View style={styles.emotionRow}>
      <Text style={styles.emotionName}>{emotion.name}</Text>
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
        <View style={[styles.ibarFill, { width: `${value}%` as any, backgroundColor: accent ? colors.accent : 'rgba(196,149,106,0.4)' }]} />
      </View>
      <Text style={styles.ibarNum}>{value}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerDate: { fontSize: 12, color: colors.textMuted, letterSpacing: 0.5 },
  badge: { fontSize: 10, letterSpacing: 0.8, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', textTransform: 'uppercase' },
  badgeComplete: { backgroundColor: 'rgba(122,158,126,0.12)', color: colors.success },
  badgeInProgress: { backgroundColor: 'rgba(184,151,74,0.1)', color: colors.inProgress },
  section: { marginBottom: 20 },
  stepNum: { fontSize: 10, color: colors.textDim, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 },
  stepTitle: { fontSize: 17, color: colors.accent, fontWeight: '500', marginBottom: 8 },
  bodyText: { fontSize: 14, color: colors.text, lineHeight: 23 },
  emptyField: { color: colors.textDim, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 20 },
  emotionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  emotionName: { fontSize: 14, color: colors.text },
  intensityBars: { gap: 4 },
  ibarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ibarLabel: { fontSize: 10, color: colors.textDim, width: 28, textAlign: 'right' },
  ibarTrack: { width: 80, height: 3, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  ibarFill: { height: '100%', borderRadius: 2 },
  ibarNum: { fontSize: 11, color: colors.textMuted, width: 32 },
  deleteBtn: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.dangerDim,
    borderWidth: 1,
    borderColor: 'rgba(196,96,90,0.22)',
    alignItems: 'center',
  },
  deleteBtnText: { color: colors.danger, fontSize: 15 },
  errorText: { fontSize: 15, color: colors.textMuted },
});
```

- [ ] **Step 3: Test full flow end-to-end in Expo Go**

1. Create a new record (all 7 steps) → lands on detail screen
2. Detail shows all 7 sections with real data
3. Tap "Usuń wpis" → Alert → "Anuluj" → stays on screen
4. Tap "Usuń wpis" → Alert → "Usuń" → back to list, record gone

- [ ] **Step 4: Commit**

```bash
git add src/tools/thought-record/screens/RecordDetailScreen.tsx src/app/(tools)/thought-record/[id].tsx
git commit -m "feat: RecordDetailScreen with read-only view and delete"
```

---

## Task 10: Final verification + cleanup

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: all pass

- [ ] **Step 2: Full E2E walkthrough in Expo Go**

Acceptance criteria checklist:
- [ ] Create new record, complete all 7 steps
- [ ] Step 2: skip emotions → error shown → add emotion → proceed
- [ ] Abandon mid-flow → back to list → record shows "W toku"
- [ ] Tap abandoned record → opens detail screen (read-only, shows partial data with "W toku" badge)
- [ ] Complete record shows "Kompletny" in list
- [ ] Detail screen: all 7 sections visible, before/after emotion bars
- [ ] Delete: confirmation → record removed from list
- [ ] Empty state shows when no records
- [ ] All text in Polish

- [ ] **Step 3: Delete old `app/` directory (default Expo template, now unused)**

```bash
# Verify expo-router still reads from src/app by running the app first
# Then:
rm -rf app/
git add -A
git commit -m "chore: remove unused default app/ directory"
```

- [ ] **Step 4: Update EXECUTION_PLAN.md in vault**

Mark all Phase 1 items complete in `../cbt-toolkit-brain/00_Active/EXECUTION_PLAN.md`.

- [ ] **Step 5: Final commit tag**

```bash
git tag v0.1.0-alpha
git commit --allow-empty -m "feat: Phase 1 MVP complete — Thought Record tool"
```
