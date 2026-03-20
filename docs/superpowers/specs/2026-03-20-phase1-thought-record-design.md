# Phase 1 Design: Thought Record MVP

## Decisions

**DB access:** `SQLiteProvider` + `useSQLiteContext()` (expo-sqlite v14+). Replace manual `openDatabase()` in `_layout.tsx` with provider; `onInit` callback runs migrations.

**7-step wizard:** Single route (`new.tsx` → `NewRecordFlow`), internal `useState` for step + all field values. Auto-save to SQLite on each step transition. Steps 2 and 7 share `Emotion[]` state in the same component.

**No edit flow in v0.1.0.** Create, view, delete only.

## Architecture

```
_layout.tsx → SQLiteProvider(onInit: runMigrations) → Tabs
  (tools)/thought-record/_layout → Stack
    index.tsx  → RecordListScreen
    new.tsx    → NewRecordFlow
    [id].tsx   → RecordDetailScreen
```

## Shared components (src/core/components/)

- `EmotionPicker` — props: `selected: Emotion[]`, `onChange`
- `IntensitySlider` — props: `value`, `onChange`, `label?`

## NewRecordFlow state shape

```typescript
type FlowState = {
  recordId: string | null;
  currentStep: number;        // 1–7
  situation: string;
  situationDate: string;      // ISO date, default today
  emotions: Emotion[];
  automaticThoughts: string;
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
  outcome: string;
}
```

Steps 3–6 rendered via single `TextStep` component parameterised by `fieldKey`.

## RecordListScreen

- `useThoughtRecords(db)` hook → sorted list
- FAB → `router.push('./new')`
- Incomplete records show "(w toku)" badge
- Empty state with prompt

## RecordDetailScreen

- `useRecordById(db, id)` → read-only all 7 fields
- Trash icon in header → Alert confirm → `deleteRecord` → `router.back()`
- Emotion bars show before/after intensity side by side

## Acceptance criteria (v0.1.0)

- User can complete all 7 steps
- Each step auto-saves on navigation
- Min 1 emotion required to leave step 2
- Completed records in list sorted by date
- Incomplete records visible with "(w toku)"
- View + delete a record
- All UI text in Polish
- No crash on empty fields
