# Design: Behavioral Experiment Tool (Phase 3)

Date: 2026-03-21
Status: Approved (rev 2 — spec-reviewer fixes applied)
Mockup: `docs/mockups/behavioral-experiment-mockup.html`

---

## CBT Background

Behavioral Experiment (Eksperyment Behawioralny) is a core CBT technique where the user tests a negative automatic belief by designing a real-world experiment, executing it, and comparing the predicted outcome to what actually happened. The process weakens dysfunctional beliefs through direct experience rather than abstract disputation.

---

## User Story

As a user, I want to record a negative belief, plan an experiment to test it, and then return to log what actually happened — so I can see, in numbers and words, how much my belief has changed.

---

## Flow

### Phase: Plan (steps 1–4)

| Step | Field(s) | UI | Required? |
|------|----------|----|-----------|
| 1 | `belief` + `beliefStrengthBefore` | TextInput + IntensitySlider 0–100 | `belief` required (non-empty) |
| 2 | `alternativeBelief` | TextInput | optional (can skip) |
| 3 | `plan` | TextInput multiline | required |
| 4 | `predictedOutcome` | TextInput → save, status=`planned` | optional |

### Phase: Result (steps 5–7)

| Step | Field(s) | UI | Required? |
|------|----------|----|-----------|
| 5 | `executionDate` + `executionNotes` | DateTimePicker + TextInput multiline | `executionDate` required |
| 6 | `actualOutcome` | TextInput multiline | required |
| 7 | `conclusion` + `beliefStrengthAfter` | TextInput + IntensitySlider 0–100 → status=`completed` | `conclusion` required |

Auto-save occurs on each "Dalej" press in both phases.

**Validation:** The "Dalej" button is disabled (greyed out) if a required field is empty. No inline error messages needed for MVP — disabling the button is sufficient.

---

## Architecture

### Approach: Single `NewExperimentFlow` with `phase` prop

```typescript
interface NewExperimentFlowProps {
  phase: 'plan' | 'result';
  experimentId?: string; // required when phase='result'
}
```

- `phase='plan'`: steps 1–4, creates new record via repository
- `phase='result'`: loads existing record by `experimentId`, steps 5–7, updates to `completed`

Route files pass `experimentId` via `useLocalSearchParams`:

```typescript
// src/app/(tools)/behavioral-experiment/[id]/result.tsx
export default function ResultRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NewExperimentFlow phase="result" experimentId={id} />;
}
```

This mirrors the `existingId` pattern from `NewRecordFlow` in thought-record.

### `index.ts` ToolDefinition (explicit)

```typescript
import type { ToolDefinition } from '../../core/types/tool';
import { migration001 } from './migrations/001-create-behavioral-experiments';

export const behavioralExperimentTool: ToolDefinition = {
  id: 'behavioral-experiment',
  name: 'Eksperyment Behawioralny',
  description: 'Testuj swoje przekonania przez działanie',
  icon: 'flask',
  routePrefix: '/behavioral-experiment',
  migrations: [migration001],
  enabled: true,
  version: '0.1.0',
};
```

### `_layout.tsx` Stack screens (explicit)

```typescript
<Stack screenOptions={stackScreenOptions}>
  <Stack.Screen name="index" options={{ title: 'Eksperymenty', headerLeft: () => <BackToHome /> }} />
  <Stack.Screen name="new" options={{ title: 'Nowy eksperyment' }} />
  <Stack.Screen name="[id]/index" options={{ title: 'Eksperyment' }} />
  <Stack.Screen name="[id]/result" options={{ title: 'Dodaj wynik' }} />
</Stack>
```

### File structure

```
src/tools/behavioral-experiment/
├── index.ts
├── types.ts
├── repository.ts
├── migrations/
│   └── 001-create-behavioral-experiments.ts
├── hooks/
│   └── useBehavioralExperiments.ts
├── screens/
│   ├── ExperimentListScreen.tsx
│   ├── NewExperimentFlow.tsx
│   └── ExperimentDetailScreen.tsx
└── i18n/
    └── pl.ts

src/app/(tools)/behavioral-experiment/
├── _layout.tsx
├── index.tsx        → ExperimentListScreen
├── new.tsx          → <NewExperimentFlow phase="plan" />
└── [id]/
    ├── index.tsx    → ExperimentDetailScreen
    └── result.tsx   → <NewExperimentFlow phase="result" experimentId={id} />
```

Note: no `components/` subdirectory — `IntensitySlider` from core is used directly (see below).

---

## Data Model

```typescript
export type ExperimentStatus = 'planned' | 'completed';

export interface BehavioralExperiment {
  id: string;
  status: ExperimentStatus;

  // Plan phase
  belief: string;
  beliefStrengthBefore: number;       // 0–100
  alternativeBelief: string;
  plan: string;
  predictedOutcome: string;

  // Result phase
  executionDate: string | null;       // ISO date string
  executionNotes: string | null;      // what the user actually did (step 5)
  actualOutcome: string | null;       // what happened (step 6)
  conclusion: string | null;          // learnings (step 7)
  beliefStrengthAfter: number | null; // 0–100

  isExample: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Relationship to `tool_entries`

The repository writes to both tables (as thought-record does):
- `tool_entries`: `is_complete` = 1 when status=`completed`, `current_step` tracks last saved step
- `behavioral_experiments.status` is the semantic source of truth for the two-phase lifecycle

The `id` field is shared — `behavioral_experiments.id` references `tool_entries.id`. `createdAt` and `updatedAt` are read from `tool_entries` and mapped into the TypeScript interface.

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS behavioral_experiments (
  id TEXT PRIMARY KEY REFERENCES tool_entries(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'planned',
  belief TEXT NOT NULL DEFAULT '',
  belief_strength_before INTEGER NOT NULL DEFAULT 50,
  alternative_belief TEXT NOT NULL DEFAULT '',
  plan TEXT NOT NULL DEFAULT '',
  predicted_outcome TEXT NOT NULL DEFAULT '',
  execution_date TEXT,
  execution_notes TEXT,
  actual_outcome TEXT,
  conclusion TEXT,
  belief_strength_after INTEGER,
  is_example INTEGER NOT NULL DEFAULT 0
);
```

---

## UI Screens

### ExperimentListScreen
- FlatList, chronological, no grouping
- Each card shows: belief (truncated), badge (`Zaplanowany` / `Ukończony`), date, belief change (75% → 25% or 75% → —)
- FAB "Nowy eksperyment" at bottom
- Seed: insert one completed example when `records.length === 0` on first load (no AsyncStorage — same empty-list pattern as thought-record)

### NewExperimentFlow (phase=plan)
- 4-step wizard, step indicator dots (4 dots)
- StepHelper (collapsible hint) in each step
- "Dalej" disabled when required field empty

### NewExperimentFlow (phase=result)
- 3-step wizard, step indicator dots (3 dots)
- Loads existing experiment by `experimentId`
- "Dalej" disabled when required field empty; last step shows "Zakończ" button

### ExperimentDetailScreen
- Top card: belief text + belief strength comparison (before / after), using `IntensitySlider` in read-only mode (no `onChange`)
- Sections: Plan (alt belief, plan, predicted), Result (execution date, execution notes, actual outcome, conclusion)
- "Dodaj wynik" button visible only when status=`planned`

---

## Slider

Use `IntensitySlider` from `src/core/components/IntensitySlider.tsx` directly in steps 1 and 7. No new component — existing props (`value`, `onChange`, `label`) cover all requirements. The green/red color gradient is a nice-to-have deferred to post-MVP.

For the read-only belief comparison in DetailScreen, render `IntensitySlider` with `onChange={() => {}}` (no-op) — or accept that it remains interactive visually (acceptable for MVP).

---

## Testing Plan (TDD)

| Unit | Tests | Count |
|------|-------|-------|
| `NewExperimentFlow` phase=plan | step 1 render, "Dalej" disabled when belief empty, "Dalej" enabled + auto-save after filling | 3 |
| `NewExperimentFlow` phase=result | loads existing record, step 7 save, status=completed after finish | 3 |
| `ExperimentListScreen` | empty state, seed record shown, status badges (planned/completed) | 3 |
| `repository` | insert plan, getAll, update to completed, seed insert | 4 |
| `IntensitySlider` (already tested in core) | — | skip |

Total: 13 tests

---

## Onboarding Seed

Insert one completed example when `experiments.length === 0` on first list load (checked inside `useBehavioralExperiments` hook). No AsyncStorage flag — consistent with how thought-record handles it.

The seed repository function must write to both tables:
- `tool_entries`: `is_complete=1`, `current_step=7` (final step — tool has 7 steps total: steps 1–4 plan phase + steps 5–7 result phase, as defined in the Flow section above)
- `behavioral_experiments`: full record as below

Seed data:
- `belief`: "Jeśli powiem 'nie', wszyscy się na mnie obrażą."
- `beliefStrengthBefore`: 85
- `executionDate`: (date of first app run)
- `executionNotes`: "Odmówiłam koleżance pożyczenia pieniędzy."
- `actualOutcome`: "Koleżanka była zaskoczona, ale nie obraziła się. Nadal rozmawiamy normalnie."
- `conclusion`: "Odmowa nie zniszczyła relacji. Moje przekonanie było przesadzone."
- `beliefStrengthAfter`: 30
- `status`: `completed`
- `isExample`: true

---

## Polish Copy

| Key | Polish |
|-----|--------|
| `tool.name` | Eksperyment Behawioralny |
| `tool.description` | Testuj swoje przekonania przez działanie |
| `list.title` | Eksperymenty |
| `list.empty` | Brak eksperymentów |
| `list.new` | Nowy eksperyment |
| `status.planned` | Zaplanowany |
| `status.completed` | Ukończony |
| `step1.title` | Jakie przekonanie chcesz sprawdzić? |
| `step1.hint` | Opisz myśl, którą chcesz przetestować. Zazwyczaj zaczyna się od "Jeśli..., to..." |
| `step1.sliderLabel` | Jak bardzo w to wierzysz? |
| `step2.title` | Jaka jest alternatywna hipoteza? |
| `step2.hint` | Co by się mogło stać, gdyby Twoje przekonanie było błędne? |
| `step3.title` | Co konkretnie zrobisz? |
| `step3.hint` | Opisz eksperyment — co dokładnie zrobisz, kiedy i gdzie. |
| `step4.title` | Jak myślisz — co się stanie? |
| `step4.hint` | Zapisz swoje przewidywanie zanim przeprowadzisz eksperyment. |
| `step5.title` | Kiedy i co zrobiłeś? |
| `step5.hint` | Wybierz datę i opisz co dokładnie zrobiłeś w ramach eksperymentu. |
| `step6.title` | Co się wydarzyło? |
| `step6.hint` | Opisz rzeczywisty wynik eksperymentu. |
| `step7.title` | Czego się nauczyłeś? |
| `step7.hint` | Opisz wnioski. Co to mówi o Twoim pierwotnym przekonaniu? |
| `step7.sliderLabel` | Jak mocno teraz wierzysz w to przekonanie? |
| `detail.addResult` | Dodaj wynik |
| `detail.beliefBefore` | Przed |
| `detail.beliefAfter` | Po |
| `nav.next` | Dalej |
| `nav.back` | Wstecz |
| `nav.finish` | Zakończ |
| `plan.sectionHeader` | Plan |
| `result.sectionHeader` | Wynik |
| `detail.alternativeBelief` | Alternatywna hipoteza |
| `detail.plan` | Co zrobiłem |
| `detail.predictedOutcome` | Przewidywany wynik |
| `detail.executionDate` | Data wykonania |
| `detail.executionNotes` | Co zrobiłem |
| `detail.actualOutcome` | Co się wydarzyło |
| `detail.conclusion` | Wnioski |

---

## Acceptance Criteria

- [ ] Tool card appears on home screen
- [ ] 4-step plan wizard creates experiment with status=`planned`
- [ ] "Dalej" disabled when required field is empty in steps 1, 3, and 5 (executionDate)
- [ ] Planned experiment appears on list with "Zaplanowany" badge
- [ ] "Dodaj wynik" button navigates to result.tsx with correct id param
- [ ] 3-step result wizard loads plan-phase data, updates status=`completed`
- [ ] DetailScreen shows belief before/after with IntensitySlider (read-only)
- [ ] "Dodaj wynik" button only visible for planned experiments
- [ ] Seed example present on first launch (no AsyncStorage — empty-list check)
- [ ] All text in Polish
- [ ] 13 tests passing
- [ ] TypeScript strict mode: 0 errors
- [ ] Zero changes to thought-record or core files (except registry auto-update by scaffold)

---

## Edge Cases

- User taps "Dodaj wynik" on an already-completed experiment: button is hidden, not reachable
- User starts plan, closes app mid-wizard: auto-save on each step means partial data is preserved with `status=planned`
- `beliefStrengthAfter` initialisation in result phase: when `NewExperimentFlow phase='result'` loads an experiment, it must initialise the step-7 slider state to `experiment.beliefStrengthBefore` (not 50) if `beliefStrengthAfter` is null. This forces the user to consciously move the slider to reflect the actual change. Implementation: `useState(experiment.beliefStrengthAfter ?? experiment.beliefStrengthBefore)`
