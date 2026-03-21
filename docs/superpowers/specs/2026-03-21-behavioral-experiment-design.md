# Design: Behavioral Experiment Tool (Phase 3)

Date: 2026-03-21
Status: Approved
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

| Step | Field | UI |
|------|-------|----|
| 1 | `belief` + `beliefStrengthBefore` | TextInput + BeliefSlider 0–100 |
| 2 | `alternativeBelief` | TextInput |
| 3 | `plan` | TextInput multiline |
| 4 | `predictedOutcome` | TextInput → save, status=`planned` |

### Phase: Result (steps 5–7)

| Step | Field | UI |
|------|-------|----|
| 5 | `executionDate` + `actualOutcome` (part 1) | TextInput date + TextInput multiline |
| 6 | `actualOutcome` (full) | TextInput multiline |
| 7 | `conclusion` + `beliefStrengthAfter` | TextInput + BeliefSlider 0–100 → status=`completed` |

Auto-save occurs on each "Dalej" press in both phases.

---

## Architecture

### Approach: Single `NewExperimentFlow` component with `phase` prop

```
NewExperimentFlow({ phase: 'plan' | 'result', experimentId?: string })
```

- `phase='plan'`: renders steps 1–4, creates new record
- `phase='result'`: loads existing record by `experimentId`, renders steps 5–7, updates to `completed`

Mirrors the `existingId` pattern from `NewRecordFlow` in thought-record.

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
├── components/
│   └── BeliefSlider.tsx
└── i18n/
    └── pl.ts

src/app/(tools)/behavioral-experiment/
├── _layout.tsx
├── index.tsx       → ExperimentListScreen
├── new.tsx         → NewExperimentFlow phase='plan'
└── [id]/
    ├── index.tsx   → ExperimentDetailScreen
    └── result.tsx  → NewExperimentFlow phase='result'
```

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
  executionDate: string | null;
  actualOutcome: string | null;
  conclusion: string | null;
  beliefStrengthAfter: number | null; // 0–100

  isExample: boolean;
  createdAt: string;
  updatedAt: string;
}
```

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
- Seed example shown on first launch (AsyncStorage flag)

### NewExperimentFlow (phase=plan)
- 4-step wizard with step indicator dots
- StepHelper (collapsible hint) in each step
- Auto-save on each step

### NewExperimentFlow (phase=result)
- 3-step wizard with step indicator dots
- Loads existing experiment data
- StepHelper in each step

### ExperimentDetailScreen
- Top card: belief text + BeliefSlider comparison (before / after)
- Sections: Plan (alt belief, plan, predicted), Result (execution date, actual outcome, conclusion)
- "Dodaj wynik" button visible only when status=`planned`

---

## BeliefSlider Component

```typescript
interface BeliefSliderProps {
  value: number;        // 0–100
  onChange: (v: number) => void;
  label: string;
}
```

- Wrapper around core `IntensitySlider`
- Color: green (0%) → red (100%) gradient
- Shows percentage value numerically above track

---

## Testing Plan (TDD)

| Unit | Tests | Count |
|------|-------|-------|
| `BeliefSlider` | render, value change, percentage label | 3 |
| `NewExperimentFlow` phase=plan | step 1 render, step 1→2 transition, auto-save | 3 |
| `NewExperimentFlow` phase=result | load existing record, step 7 save, status=completed | 3 |
| `ExperimentListScreen` | empty state, seed record, status badges | 3 |
| `repository` | insert, getAll, update, seed | 4 |

Total: ~16 tests

---

## Onboarding Seed

One completed example experiment inserted on first launch (AsyncStorage key: `behavioral-experiment-seeded`).

Seed data:
- belief: "Jeśli powiem 'nie', wszyscy się na mnie obrażą."
- beliefStrengthBefore: 85
- beliefStrengthAfter: 30
- status: completed

---

## Polish Copy (key strings)

| Key | Polish |
|-----|--------|
| `tool.name` | Eksperyment Behawioralny |
| `list.title` | Eksperymenty |
| `list.empty` | Brak eksperymentów |
| `list.new` | Nowy eksperyment |
| `status.planned` | Zaplanowany |
| `status.completed` | Ukończony |
| `step1.title` | Jakie przekonanie chcesz sprawdzić? |
| `step1.hint` | Opisz myśl, którą chcesz przetestować. Zazwyczaj zaczyna się od "Jeśli..., to..." |
| `step1.slider` | Jak bardzo w to wierzysz? |
| `step2.title` | Jaka jest alternatywna hipoteza? |
| `step2.hint` | Co by się mogło stać, gdyby Twoje przekonanie było błędne? |
| `step3.title` | Co konkretnie zrobisz? |
| `step3.hint` | Opisz eksperyment — co dokładnie zrobisz, kiedy i gdzie. |
| `step4.title` | Jak myślisz — co się stanie? |
| `step4.hint` | Zapisz swoje przewidywanie zanim przeprowadzisz eksperyment. |
| `step5.title` | Kiedy i co zrobiłeś? |
| `step6.title` | Co się wydarzyło? |
| `step6.hint` | Opisz rzeczywisty wynik eksperymentu. |
| `step7.title` | Czego się nauczyłeś? |
| `step7.hint` | Opisz wnioski. Co to mówi o Twoim pierwotnym przekonaniu? |
| `step7.slider` | Jak mocno teraz wierzysz w to przekonanie? |
| `detail.addResult` | Dodaj wynik |
| `detail.beliefBefore` | Przed |
| `detail.beliefAfter` | Po |
| `nav.next` | Dalej |
| `nav.back` | Wstecz |
| `nav.finish` | Zakończ |

---

## Acceptance Criteria

- [ ] Tool card appears on home screen
- [ ] 4-step plan wizard creates experiment with status=`planned`
- [ ] Planned experiment appears on list with correct badge
- [ ] 3-step result wizard loads existing data, updates status=`completed`
- [ ] DetailScreen shows belief change (before/after sliders)
- [ ] "Dodaj wynik" button only visible for planned experiments
- [ ] Seed example present on first launch
- [ ] All text in Polish
- [ ] 16 tests passing
- [ ] TypeScript strict mode: 0 errors
- [ ] Zero changes to thought-record or core files (except registry auto-update)
