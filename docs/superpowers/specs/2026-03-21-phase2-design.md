# Phase 2 Design — CBT Toolkit (Zapis Myśli)

**Date:** 2026-03-21
**Status:** Approved (rev 2 — post spec review)
**Mockup:** `docs/mockups/phase2-mockup.html`
**Target version:** v0.2.0

---

## Context

Phase 1 (v0.1.0) delivered the full 7-step Thought Record flow, record list, read-only detail view, and delete. Phase 2 adds six usability features across three screens, grouped by the screen they affect. Priority order: therapeutic value (a) → retention/engagement (c) → completeness (b).

---

## Approach: Screen-Based Grouping

Features are grouped into three implementation stages. Each stage is one git worktree + PR. The ordering minimises repeated edits to the same file.

| Stage | Screen(s) affected | Features |
|-------|-------------------|----------|
| 1 | `RecordDetailScreen` + new `CompareScreen` | Enhanced emotion chart, Side-by-side compare view, Edit records |
| 2 | `NewRecordFlow` | Helper text per step |
| 3 | `RecordListScreen` + app init | Search/filter, Onboarding seed record |

---

## Stage 1 — RecordDetailScreen

### 1a. Enhanced Emotion Bars

**What:** The before/after intensity bars in the Emocje section become larger and more expressive.

**Changes to `RecordDetailScreen.tsx`:**
- Bar track: `width: 120`, `height: 6` (was 72 / 3)
- "przed" fill: `rgba(196,149,106,0.35)`
- "po" fill: `colors.accent` (`#C4956A`)
- If `intensityAfter < intensityBefore`: render `↓` symbol, `fontSize: 12`, `color: colors.success`, `marginLeft: 6`, displayed inline after emotion name
- If `intensityAfter === undefined`: render only the "przed" bar row; omit "po" row entirely

**No data model changes.** Pure visual upgrade.

---

### 1b. Side-by-Side Compare View

**What:** A new full-screen "compare" experience reachable from RecordDetailScreen. Shows the 7 columns in 4 paired pages as specified in SPEC.md.

**New route:** `src/app/(tools)/thought-record/[id]/compare.tsx`
- Expo Router segment: `(tools)/thought-record/[id]/compare`
- The file reads `id` from `useLocalSearchParams<{ id: string }>()`
- Renders `<CompareScreen id={id} />`

**New screen component:** `src/tools/thought-record/screens/CompareScreen.tsx`

```typescript
interface CompareScreenProps {
  id: string;
}
```

**4 pages:**

| Page | Left column | Right column |
|------|------------|--------------|
| 1 | Sytuacja | Emocje (compact bars) |
| 2 | Emocje (compact bars) | Myśli automatyczne |
| 3 | Myśli automatyczne | Argumenty za + Argumenty przeciw (stacked) |
| 4 | Argumenty za + Argumenty przeciw (stacked) | Myśl alternatywna |

**UI spec:**
- Pagination indicator: 4 dots, active dot expands to pill (`width: 18`, `borderRadius: 3`), inactive dots `width: 6`, `height: 6`, `borderRadius: 3`. Color: active = `colors.accent`, inactive = `colors.border`.
- Page label below dots: Courier Prime 10px, `colors.textMuted`, uppercase. Text from i18n key `tr.compare.page{N}`.
- Two columns: each `flex: 1`, `backgroundColor: colors.surface`, `borderWidth: 1`, `borderColor: colors.border`, `borderRadius: 13`, `padding: 13`, `overflow: 'scroll'`
- Page 3 & 4 right column: two sub-sections **stacked vertically** in one column panel. Layout: "Argumenty za" title (Cormorant Garamond 14px, `colors.success`) → text → horizontal divider (`height: 1`, `backgroundColor: colors.border`, `marginVertical: 10`) → "Argumenty przeciw" title (Cormorant Garamond 14px, `colors.danger`) → text.
- Bottom nav: `height: 40`, ghost arrow buttons (‹ ›) with `borderWidth: 1`, `borderRadius: 10`, first disabled on page 1, last disabled on page 4. Center: page number ("1 / 4"), Courier Prime 11px, `colors.textDim`.
- Screen title in NavHeader: "Widok porównawczy" (i18n key `tr.compare.title`)
- Access: "⊞ Porównaj" ghost button in RecordDetailScreen header. This is the button *label*; the screen title rendered in CompareScreen's NavHeader is "Widok porównawczy".
- No tab bar on this screen.

**RecordDetailScreen header changes:**
- Remove existing `nav-action` trash icon from NavHeader.
- Add two ghost action buttons in a `flexDirection: 'row'`, `gap: 8` View, placed to the right of the date/badge block in the meta row.
  - Button 1: "⊞ Porównaj" → navigates to `/(tools)/thought-record/${id}/compare`
  - Button 2: "✏ Edytuj" → navigates to `/(tools)/thought-record/${id}/edit`
  - Style: `borderWidth: 1`, `borderColor: colors.border`, `borderRadius: 9`, `paddingVertical: 6`, `paddingHorizontal: 10`, Courier Prime 10px, `colors.textMuted`
- Delete button stays at bottom of scroll content (unchanged).

---

### 1c. Edit Existing Records

**What:** Users can edit any saved record (currently read-only). Edit reuses `NewRecordFlow` in edit mode.

**New route:** `src/app/(tools)/thought-record/[id]/edit.tsx`
- Reads `id` from `useLocalSearchParams<{ id: string }>()`
- Renders `<NewRecordFlow existingId={id} />`

**`NewRecordFlow` prop change:**
```typescript
interface NewRecordFlowProps {
  existingId?: string;  // if provided → edit mode
}
```

**Edit mode loading pattern:**
1. Component renders a loading state (`<ActivityIndicator>`) while fetching.
2. On mount, if `existingId` is provided: call `repo.getRecord(db, existingId)` and populate `FlowState` fully before showing any form step.
3. `FlowState.recordId` is set to `existingId` immediately — all subsequent `saveStep()` calls use `repo.updateRecord()` (skipping the initial `createRecord()` branch).
4. On completion ("Zakończ"): navigate to `/(tools)/thought-record/${existingId}` (detail screen), not to list.

**Repository:** `repo.updateRecord()` already exists. No new DB functions needed.

---

## Stage 2 — NewRecordFlow

### 2a. Helper Text Per Step

**What:** Steps 1, 3, 4, 5, 6 each have a collapsible "💡 Wskazówka" button. Steps 2 (Emocje picker) and 7 (Podsumowanie/re-rate) do **not** use the helper — their UI is self-explanatory; omit `<StepHelper>` from those steps.

**New component:** `src/tools/thought-record/components/StepHelper.tsx`

```typescript
interface StepHelperProps {
  hint: string;  // Polish example text to display when open
}
```

**UI spec:**
- Toggle button: `fontFamily: 'CourierPrime'`, `fontSize: 10`, `color: colors.textDim`, no border/background, left-aligned, `paddingVertical: 6`, `marginTop: 10`
- Button text: `💡 Wskazówka` (static label; step-specific context comes from the `hint` prop content)
- Panel (visible when open): `backgroundColor: colors.surface`, `borderWidth: 1`, `borderColor: colors.border`, `borderRadius: 10`, `padding: 12`, `marginTop: 8`
- Panel label: "Przykład" (Courier Prime 9px, uppercase, `colors.textDim`, `marginBottom: 6`)
- Example text: Cormorant Garamond italic, `colors.textMuted`, `fontSize: 15`, `lineHeight: 22`
- State: local `useState<boolean>(false)` inside `StepHelper`, resets to `false` automatically when component unmounts (i.e., on step navigation — no explicit reset needed)

**Helper content per step (Polish):**

| Step | `hint` prop value |
|------|-------------------|
| 1 — Sytuacja | „np. Rano przed wyjściem do pracy poczułem nagły niepokój. Byłem sam w domu, była godzina 8:15." |
| 3 — Myśli auto. | „np. Nie dam rady. Wszyscy widzą, że jestem słaby. Coś jest ze mną nie tak." |
| 4 — Arg. za | „np. Tydzień temu zapomniałem o ważnym spotkaniu. Zdarza mi się mylić daty." |
| 5 — Arg. przeciw | „np. Przez ostatni rok nie miałem poważnych problemów w pracy. Szef niedawno mnie pochwalił." |
| 6 — Alternatywa | „np. Odczuwam niepokój, ale to uczucie przeminie. Mam dowody na to, że sobie radzę." |

---

## Stage 3 — RecordListScreen + App Init

### 3a. Search / Filter

**What:** A search input above the record list. Filters records by situation text OR emotion names (OR logic, case-insensitive, no diacritics normalization required).

**UI spec:**
- Input wrapper: `position: 'relative'`, `marginBottom: 16`
- Leading icon: `⌕` emoji or `🔍`, `position: 'absolute'`, `left: 14`, vertically centered, `color: colors.textDim`, `fontSize: 14`, `pointerEvents: 'none'`
- Input: `backgroundColor: colors.surface`, `borderWidth: 1`, `borderColor: colors.border`, `borderRadius: 12`, `paddingVertical: 11`, `paddingHorizontal: 14`, `paddingLeft: 36`, Lora 13px, `colors.text`
- Placeholder: "Szukaj wpisów..." (`colors.textDim`)
- Trailing × button: visible only when `query.length > 0`, clears query; same position as icon but right side
- Filtering: real-time on every keystroke (no debounce — list is small, SQLite data already in memory)
- Empty result state: existing EmptyState component with message: `Brak wyników dla „${query}"`

**Implementation:**
```typescript
const [query, setQuery] = useState('');
const filtered = useMemo(
  () => records.filter(r =>
    r.situation.toLowerCase().includes(query.toLowerCase()) ||
    r.emotions.some(e => e.name.toLowerCase().includes(query.toLowerCase()))
  ),
  [records, query]  // dependencies
);
```

No new hook or repo function needed.

---

### 3b. Onboarding Seed Record

**What:** On first launch of the Thought Record tool, a pre-filled example record is inserted. It appears in the list with a "Przykład" badge.

**New dependency:** `expo-async-storage`
```bash
npx expo install @react-native-async-storage/async-storage
```

**Trigger logic (in `RecordListScreen` `useEffect`):**
```typescript
useEffect(() => {
  if (records.length > 0) return;  // already has records, skip
  AsyncStorage.getItem('thought-record:onboarding-seeded').then(val => {
    if (val !== null) return;  // already seeded
    // insert seed record, then:
    AsyncStorage.setItem('thought-record:onboarding-seeded', '1');
  });
}, [records]);
```

**Deleting the seed record does NOT clear the AsyncStorage flag.** If user deletes it, it will not reappear. This is intentional.

**Seed record data:**
```
situation: "Spotkanie z przełożonym, na którym bałem się oceny mojej pracy. Serce biło szybciej, trudno mi było myśleć jasno."
situationDate: null
emotions: [
  { name: "Lęk", intensityBefore: 80, intensityAfter: 45 },
  { name: "Niepokój", intensityBefore: 75, intensityAfter: 40 },
  { name: "Wstyd", intensityBefore: 60, intensityAfter: 30 }
]
automaticThoughts: "Na pewno coś powiem nie tak. Szef zobaczy, że jestem niekompetentny. Moje pomysły są do niczego."
evidenceFor: "Raz popełniłem błąd w raporcie miesiąc temu. Zdarza mi się jąkać przy prezentacjach."
evidenceAgainst: "Szef kilka tygodni temu pochwalił mój poprzedni projekt. Mam dobre wyniki od roku. Współpracownicy proszą mnie o pomoc."
alternativeThought: "Mogę się denerwować i to normalne. Mam konkretne dowody na to, że jestem kompetentny. Jedna rozmowa nie definiuje mnie jako pracownika."
outcome: "Po ćwiczeniu poczułem się spokojniejszy. Lęk zmniejszył się niemal o połowę."
is_complete: 1
is_example: 1
```

**New migration:** `002-add-is-example-flag.ts`
- Migration ID (in code): `'thought-record-002'` (consistent with existing pattern `thought-record-001`)
- SQL: `ALTER TABLE thought_records ADD COLUMN is_example INTEGER NOT NULL DEFAULT 0`

**Type update — `ThoughtRecord` in `src/tools/thought-record/types.ts`:**
```typescript
export interface ThoughtRecord {
  // ... existing fields ...
  isExample: boolean;  // mapped from is_example column
}
```

`RecordListScreen` reads `record.isExample` to conditionally render "Przykład" badge instead of "Kompletny"/"W toku".

**Delete confirmation for seed record:** When `record.isExample === true`, append to confirmation message: "To jest przykładowy wpis. Możesz go usunąć, gdy nie jest już potrzebny."

---

## Architecture Constraints

All changes are contained within:
- `src/tools/thought-record/` — screens, components, hooks, repository, migrations
- `src/app/(tools)/thought-record/` — new routes (`[id]/compare.tsx`, `[id]/edit.tsx`)

No changes to `src/core/` or other tools. No new tool-to-tool imports. Consistent with the plugin architecture principle.

---

## New Dependencies

| Package | Stage | Install command |
|---------|-------|-----------------|
| `@react-native-async-storage/async-storage` | 3 | `npx expo install @react-native-async-storage/async-storage` |

No other new dependencies.

---

## Testing Plan

Each stage gets TDD coverage:

**Stage 1:**
- Unit: `RecordDetailScreen` renders ↓ indicator when `intensityAfter < intensityBefore`
- Unit: `RecordDetailScreen` hides "po" bar row when `intensityAfter` is undefined
- Unit: `CompareScreen` renders correct `tr.compare.page{N}` label for each page index (1–4)
- Unit: `NewRecordFlow` shows loading state while fetching when `existingId` provided
- Unit: `NewRecordFlow` pre-populates all `FlowState` fields from loaded record when `existingId` provided

**Stage 2:**
- Unit: `StepHelper` toggles open/closed on press
- Unit: `StepHelper` renders correct hint text when open

**Stage 3:**
- Unit: `RecordListScreen` filters records matching `query` in `situation` field
- Unit: `RecordListScreen` filters records matching `query` in any emotion name
- Unit: `RecordListScreen` applies OR logic (matches either field)
- Unit: seed insertion skipped when `AsyncStorage` flag already set
- Unit: seed insertion skipped when `records.length > 0`

---

## Data Model Changes

| Change | Stage | Migration ID | File |
|--------|-------|-------------|------|
| `thought_records.is_example INTEGER NOT NULL DEFAULT 0` | 3 | `thought-record-002` | `002-add-is-example-flag.ts` |

No other schema changes required.

---

## Polish Copy (new strings)

All new strings go to `src/tools/thought-record/i18n/pl.ts`:

| Key | Polish |
|-----|--------|
| `tr.compare.title` | Widok porównawczy |
| `tr.compare.page1` | Sytuacja + Emocje |
| `tr.compare.page2` | Emocje + Myśli automatyczne |
| `tr.compare.page3` | Myśli + Argumenty za i przeciw |
| `tr.compare.page4` | Za + Przeciw + Alternatywa |
| `tr.compare.btnLabel` | Porównaj |
| `tr.helper.toggle` | Wskazówka |
| `tr.helper.exampleLabel` | Przykład |
| `tr.search.placeholder` | Szukaj wpisów... |
| `tr.search.noResults` | Brak wyników dla „{query}" |
| `tr.onboarding.badge` | Przykład |
| `tr.onboarding.deleteNote` | To jest przykładowy wpis. Możesz go usunąć, gdy nie jest już potrzebny. |
| `tr.edit.title` | Edytuj zapis |

COPY.md in the vault must be updated to include these keys after implementation.
