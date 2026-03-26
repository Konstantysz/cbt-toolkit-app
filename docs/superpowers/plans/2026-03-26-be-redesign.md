# Behavioral Experiment Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Przerobić narzędzie "Eksperyment Behawioralny" zgodnie z klasycznym formularzem CBT (6 kolumn: eksperyment, przewidywana reakcja, potencjalne problemy, strategie, wynik, % potwierdzenia) — czyste cięcie, brak backward compat.

**Architecture:** Migracja 002 dropuje i odtwarza tabelę `behavioral_experiments` z nowym schematem. Nowy flow planowania ma 5 kroków (był 4), flow wyników pozostaje 3-krokowy. Detail screen pokazuje dane w dwóch sekcjach: Plan i Wynik.

**Tech Stack:** expo-sqlite, React Native, TypeScript, Jest + @testing-library/react-native

---

## Files changed

| Plik | Zmiana |
|---|---|
| `src/tools/behavioral-experiment/types.ts` | nowy model (usunięte 5 pól, dodane 3) |
| `src/tools/behavioral-experiment/migrations/002-recreate-behavioral-experiments.ts` | DROP + CREATE |
| `src/tools/behavioral-experiment/index.ts` | dodaj migration002 |
| `src/tools/behavioral-experiment/repository.ts` | nowe pola w DbRow, rowToExperiment, updateExperiment, insertSeedExperiment |
| `src/tools/behavioral-experiment/i18n/pl.ts` | nowe i zmienione klucze |
| `src/tools/behavioral-experiment/screens/NewExperimentFlow.tsx` | 5 kroków plan + 3 result, nowe pola |
| `src/tools/behavioral-experiment/screens/ExperimentDetailScreen.tsx` | nowe sekcje, bez sliderów Before/After |
| `src/tools/behavioral-experiment/__tests__/repository.test.ts` | zaktualizowane testy |
| `src/tools/behavioral-experiment/__tests__/NewExperimentFlow.test.tsx` | zaktualizowane testy |

---

## Task 0: Worktree setup

- [ ] **Usuń stary worktree (jeśli jeszcze istnieje)**

```bash
git worktree remove .worktrees/feat-searchbar-be --force 2>/dev/null || true
git branch -d feat/searchbar-behavioral-experiment 2>/dev/null || true
```

- [ ] **Stwórz nowy worktree**

```bash
git worktree add .worktrees/feat-be-redesign -b feat/be-redesign
```

- [ ] **Przejdź do worktree i zweryfikuj baseline testów**

```bash
cd .worktrees/feat-be-redesign
npx jest --testPathPattern="behavioral-experiment" --passWithNoTests 2>&1 | tail -5
```

Oczekiwane: wszystkie testy przechodzą.

- [ ] **Commit (pusty, tylko żeby zainicjować)**

Nie trzeba — worktree jest gotowy.

---

## Task 1: Nowy model typów

**Files:**
- Modify: `src/tools/behavioral-experiment/types.ts`

- [ ] **Zamień zawartość types.ts**

```typescript
export type ExperimentStatus = 'planned' | 'completed';

export interface BehavioralExperiment {
  id: string;
  status: ExperimentStatus;

  // Plan phase (5 kroków)
  belief: string;             // Weryfikowana myśl
  plan: string;               // Eksperyment — co zrobisz
  predictedOutcome: string;   // Przewidywana reakcja
  potentialProblems: string;  // Potencjalne problemy
  problemStrategies: string;  // Strategie rozwiązania problemów

  // Result phase (3 kroki)
  actualOutcome: string | null;         // Wynik eksperymentu
  confirmationPercent: number | null;   // 0–100%
  conclusion: string | null;            // Czego nauczył mnie eksperyment

  isExample: boolean;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Sprawdź TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Oczekiwane: błędy TS w repository.ts, screens — to normalne, naprawimy w kolejnych taskach.

- [ ] **Commit**

```bash
git add src/tools/behavioral-experiment/types.ts
git commit -m "refactor(be): new data model — classic CBT form fields"
```

---

## Task 2: Migracja bazy danych

**Files:**
- Create: `src/tools/behavioral-experiment/migrations/002-recreate-behavioral-experiments.ts`
- Modify: `src/tools/behavioral-experiment/index.ts`

- [ ] **Stwórz plik migracji 002**

```typescript
// src/tools/behavioral-experiment/migrations/002-recreate-behavioral-experiments.ts
import type { Migration } from '../../../core/types/tool';

export const migration002: Migration = {
  id: 'behavioral-experiment-002',
  description: 'Recreate behavioral_experiments table with classic CBT form schema',
  up: async (db) => {
    await db.execAsync(`
      DROP TABLE IF EXISTS behavioral_experiments;
      CREATE TABLE behavioral_experiments (
        id                   TEXT PRIMARY KEY REFERENCES tool_entries(id) ON DELETE CASCADE,
        status               TEXT NOT NULL DEFAULT 'planned',
        belief               TEXT NOT NULL DEFAULT '',
        plan                 TEXT NOT NULL DEFAULT '',
        predicted_outcome    TEXT NOT NULL DEFAULT '',
        potential_problems   TEXT NOT NULL DEFAULT '',
        problem_strategies   TEXT NOT NULL DEFAULT '',
        actual_outcome       TEXT,
        confirmation_percent INTEGER,
        conclusion           TEXT,
        is_example           INTEGER NOT NULL DEFAULT 0
      );
    `);
  },
};
```

- [ ] **Zaktualizuj index.ts — dodaj migration002**

```typescript
// src/tools/behavioral-experiment/index.ts
import type { ToolDefinition } from '../../core/types/tool';
import { migration001 } from './migrations/001-create-behavioral-experiments';
import { migration002 } from './migrations/002-recreate-behavioral-experiments';

export const behavioralExperimentTool: ToolDefinition = {
  id: 'behavioral-experiment',
  name: 'Eksperyment Behawioralny',
  description: 'Testuj swoje przekonania przez działanie',
  icon: 'flask',
  routePrefix: '/behavioral-experiment',
  migrations: [migration001, migration002],
  enabled: true,
  version: '0.2.0',
};
```

- [ ] **Commit**

```bash
git add src/tools/behavioral-experiment/migrations/002-recreate-behavioral-experiments.ts
git add src/tools/behavioral-experiment/index.ts
git commit -m "feat(be): add migration 002 — recreate table with classic CBT schema"
```

---

## Task 3: Repository — nowe pola

**Files:**
- Modify: `src/tools/behavioral-experiment/repository.ts`
- Modify: `src/tools/behavioral-experiment/__tests__/repository.test.ts`

- [ ] **Napisz nowe testy repository (zastąp całą zawartość pliku testowego)**

```typescript
// src/tools/behavioral-experiment/__tests__/repository.test.ts
import * as SQLite from 'expo-sqlite';

jest.mock('expo-sqlite');
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-1234',
}));

import * as repo from '../repository';

const mockDb = {
  runAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
} as unknown as SQLite.SQLiteDatabase;

const mockRow = {
  id: 'test-uuid-1234',
  status: 'planned',
  belief: '',
  plan: '',
  predicted_outcome: '',
  potential_problems: '',
  problem_strategies: '',
  actual_outcome: null,
  confirmation_percent: null,
  conclusion: null,
  is_example: 0,
  is_complete: 0,
  current_step: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

describe('createExperiment', () => {
  it('inserts into tool_entries and behavioral_experiments, returns record', async () => {
    (mockDb.getFirstAsync as jest.Mock).mockResolvedValueOnce(mockRow);

    const result = await repo.createExperiment(mockDb);

    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
    expect(result.id).toBe('test-uuid-1234');
    expect(result.status).toBe('planned');
    expect(result.belief).toBe('');
    expect(result.potentialProblems).toBe('');
    expect(result.confirmationPercent).toBeNull();
  });
});

describe('getExperiments', () => {
  it('returns mapped array with new fields', async () => {
    (mockDb.getAllAsync as jest.Mock).mockResolvedValueOnce([
      {
        ...mockRow,
        id: 'abc',
        status: 'completed',
        belief: 'Test belief',
        plan: 'Zrobię X',
        predicted_outcome: 'Stanie się Y',
        potential_problems: 'Może przeszkodzić Z',
        problem_strategies: 'Zaradzę przez W',
        actual_outcome: 'Stało się Q',
        confirmation_percent: 30,
        conclusion: 'Nauczyłem się R',
        is_complete: 1,
        current_step: 8,
      },
    ]);

    const result = await repo.getExperiments(mockDb);

    expect(result).toHaveLength(1);
    expect(result[0].belief).toBe('Test belief');
    expect(result[0].potentialProblems).toBe('Może przeszkodzić Z');
    expect(result[0].problemStrategies).toBe('Zaradzę przez W');
    expect(result[0].confirmationPercent).toBe(30);
    expect(result[0].conclusion).toBe('Nauczyłem się R');
  });
});

describe('updateExperiment', () => {
  it('updates result fields and sets status=completed', async () => {
    await repo.updateExperiment(mockDb, 'abc', {
      conclusion: 'Learned something',
      confirmationPercent: 25,
      status: 'completed',
      isComplete: true,
      currentStep: 8,
    });

    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
  });

  it('updates plan fields', async () => {
    await repo.updateExperiment(mockDb, 'abc', {
      potentialProblems: 'Może padać deszcz',
      problemStrategies: 'Wezmę parasol',
      currentStep: 4,
    });

    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
  });
});

describe('insertSeedExperiment', () => {
  it('inserts completed seed with is_example=1 into both tables', async () => {
    await repo.insertSeedExperiment(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toContain('tool_entries');
    expect(calls[0][1]).toContain(1);  // is_complete
    expect(calls[0][1]).toContain(8);  // current_step (5 plan + 3 result)
    expect(calls[1][0]).toContain('behavioral_experiments');
    expect(calls[1][1]).toContain(1);  // is_example
  });
});

describe('deleteAll', () => {
  it('executes DELETE on behavioral_experiments and tool_entries', async () => {
    await repo.deleteAll(mockDb);

    const calls = (mockDb.runAsync as jest.Mock).mock.calls.map(
      (c: unknown[]) => c[0] as string
    );
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('behavioral_experiments'))).toBe(true);
    expect(calls.some((sql) => sql.includes('DELETE') && sql.includes('tool_entries'))).toBe(true);
  });
});
```

- [ ] **Uruchom testy — powinny failować**

```bash
npx jest --testPathPattern="behavioral-experiment/__tests__/repository" 2>&1 | tail -15
```

Oczekiwane: FAIL (stare pola w repository.ts).

- [ ] **Zaktualizuj repository.ts**

```typescript
// src/tools/behavioral-experiment/repository.ts
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import type { BehavioralExperiment, ExperimentStatus } from './types';

type DbRow = {
  id: string;
  status: string;
  belief: string;
  plan: string;
  predicted_outcome: string;
  potential_problems: string;
  problem_strategies: string;
  actual_outcome: string | null;
  confirmation_percent: number | null;
  conclusion: string | null;
  is_example: number;
  is_complete: number;
  current_step: number;
  created_at: string;
  updated_at: string;
};

function rowToExperiment(row: DbRow): BehavioralExperiment {
  return {
    id: row.id,
    status: row.status as ExperimentStatus,
    belief: row.belief,
    plan: row.plan,
    predictedOutcome: row.predicted_outcome,
    potentialProblems: row.potential_problems,
    problemStrategies: row.problem_strategies,
    actualOutcome: row.actual_outcome,
    confirmationPercent: row.confirmation_percent,
    conclusion: row.conclusion,
    isExample: row.is_example === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createExperiment(db: SQLite.SQLiteDatabase): Promise<BehavioralExperiment> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO tool_entries (id, tool_id, created_at, updated_at) VALUES (?, 'behavioral-experiment', ?, ?)`,
    [id, now, now]
  );
  await db.runAsync(
    `INSERT INTO behavioral_experiments (id) VALUES (?)`,
    [id]
  );
  return (await getExperimentById(db, id))!;
}

const JOIN_QUERY = `
  SELECT be.*, te.is_complete, te.current_step, te.created_at, te.updated_at
  FROM behavioral_experiments be
  JOIN tool_entries te ON be.id = te.id
`;

export async function getExperiments(db: SQLite.SQLiteDatabase): Promise<BehavioralExperiment[]> {
  const rows = await db.getAllAsync<DbRow>(`${JOIN_QUERY} ORDER BY te.created_at DESC`);
  return rows.map(rowToExperiment);
}

export async function getExperimentById(
  db: SQLite.SQLiteDatabase,
  id: string
): Promise<BehavioralExperiment | null> {
  const row = await db.getFirstAsync<DbRow>(`${JOIN_QUERY} WHERE be.id = ?`, [id]);
  return row ? rowToExperiment(row) : null;
}

export async function updateExperiment(
  db: SQLite.SQLiteDatabase,
  id: string,
  updates: Partial<Omit<BehavioralExperiment, 'id' | 'createdAt' | 'updatedAt'>> & { isComplete?: boolean; currentStep?: number }
): Promise<void> {
  const now = new Date().toISOString();

  const planFields = [
    'belief', 'plan', 'predictedOutcome', 'potentialProblems', 'problemStrategies',
  ] as const;
  const resultFields = [
    'actualOutcome', 'confirmationPercent', 'conclusion', 'status',
  ] as const;

  const hasBEUpdate = [...planFields, ...resultFields].some(k => updates[k] !== undefined);
  if (hasBEUpdate) {
    await db.runAsync(`
      UPDATE behavioral_experiments SET
        status               = COALESCE(?, status),
        belief               = COALESCE(?, belief),
        plan                 = COALESCE(?, plan),
        predicted_outcome    = COALESCE(?, predicted_outcome),
        potential_problems   = COALESCE(?, potential_problems),
        problem_strategies   = COALESCE(?, problem_strategies),
        actual_outcome       = CASE WHEN ? IS NOT NULL THEN ? ELSE actual_outcome END,
        confirmation_percent = CASE WHEN ? IS NOT NULL THEN ? ELSE confirmation_percent END,
        conclusion           = CASE WHEN ? IS NOT NULL THEN ? ELSE conclusion END
      WHERE id = ?
    `, [
      updates.status ?? null,
      updates.belief ?? null,
      updates.plan ?? null,
      updates.predictedOutcome ?? null,
      updates.potentialProblems ?? null,
      updates.problemStrategies ?? null,
      updates.actualOutcome ?? null, updates.actualOutcome ?? null,
      updates.confirmationPercent ?? null, updates.confirmationPercent ?? null,
      updates.conclusion ?? null, updates.conclusion ?? null,
      id,
    ]);
  }

  if (updates.isComplete !== undefined || updates.currentStep !== undefined) {
    await db.runAsync(`
      UPDATE tool_entries SET
        is_complete  = COALESCE(?, is_complete),
        current_step = COALESCE(?, current_step),
        updated_at   = ?
      WHERE id = ?
    `, [
      updates.isComplete !== undefined ? (updates.isComplete ? 1 : 0) : null,
      updates.currentStep ?? null,
      now,
      id,
    ]);
  }
}

export async function deleteExperiment(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM tool_entries WHERE id = ?', [id]);
}

export async function insertSeedExperiment(db: SQLite.SQLiteDatabase): Promise<void> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO tool_entries (id, tool_id, created_at, updated_at, is_complete, current_step)
     VALUES (?, 'behavioral-experiment', ?, ?, ?, ?)`,
    [id, now, now, 1, 8]
  );

  await db.runAsync(
    `INSERT INTO behavioral_experiments
       (id, status, belief, plan, predicted_outcome, potential_problems, problem_strategies,
        actual_outcome, confirmation_percent, conclusion, is_example)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      'completed',
      "Jeśli powiem 'nie', wszyscy się na mnie obrażą.",
      'W rozmowie z koleżanką odmówię pożyczenia pieniędzy i zobaczę, jak zareaguje.',
      'Koleżanka się obrazi i przestanie się do mnie odzywać.',
      'Koleżanka może zareagować gniewem i zakończyć rozmowę.',
      'Przypomnę sobie, że mam prawo do odmowy. Jeśli zareaguje źle, damy sobie czas na ochłonięcie.',
      'Koleżanka była zaskoczona, ale nie obraziła się. Nadal rozmawiamy normalnie.',
      20,
      'Odmowa nie zniszczyła relacji. Moje przekonanie było przesadzone.',
      1,
    ]
  );
}

export async function deleteAll(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM behavioral_experiments');
  await db.runAsync("DELETE FROM tool_entries WHERE tool_id = 'behavioral-experiment'");
}
```

- [ ] **Uruchom testy repository — powinny przechodzić**

```bash
npx jest --testPathPattern="behavioral-experiment/__tests__/repository" 2>&1 | tail -10
```

Oczekiwane: PASS (5 testów).

- [ ] **Commit**

```bash
git add src/tools/behavioral-experiment/repository.ts
git add src/tools/behavioral-experiment/__tests__/repository.test.ts
git commit -m "feat(be): update repository for new CBT form schema"
```

---

## Task 4: i18n — nowe klucze

**Files:**
- Modify: `src/tools/behavioral-experiment/i18n/pl.ts`

- [ ] **Zastąp zawartość pl.ts**

```typescript
// src/tools/behavioral-experiment/i18n/pl.ts
export const pl = {
  toolName: 'Eksperyment Behawioralny',
  toolDescription: 'Testuj swoje przekonania przez działanie',
  list: {
    title: 'Eksperymenty',
    empty: 'Brak eksperymentów',
    emptySub: 'Dotknij + aby zaplanować pierwszy eksperyment.',
    new: 'Nowy eksperyment',
    searchPlaceholder: 'Szukaj eksperymentów...',
    noResults: (q: string) => `Brak wyników dla „${q}"`,
  },
  status: {
    planned: 'Zaplanowany',
    completed: 'Ukończony',
  },
  // Plan phase
  step1: {
    title: 'Jaką myśl chcesz zweryfikować?',
    hint: 'Wpisz konkretne przekonanie, które chcesz sprawdzić działaniem. Np. „Jeśli powiem nie, wszyscy się obrażą."',
    placeholder: 'Np. Jeśli odmówię szefowi, zwolni mnie...',
  },
  step2: {
    title: 'Co konkretnie zrobisz?',
    hint: 'Opisz eksperyment — konkretną sytuację, działanie lub zachowanie, które sprawdzi twoją myśl.',
    placeholder: 'Np. W piątek na 1:1 powiem szefowi, że nie mogę wziąć dodatkowego projektu...',
  },
  step3: {
    title: 'Jak myślisz — co się stanie?',
    hint: 'Zapisz przewidywanie zanim przeprowadzisz eksperyment.',
    placeholder: 'Np. Szef się zdenerwuje i zacznie traktować mnie gorzej...',
  },
  step4: {
    title: 'Co może przeszkodzić?',
    hint: 'Jakie przeszkody mogą uniemożliwić przeprowadzenie eksperymentu?',
    placeholder: 'Np. Mogę się bać i w ostatniej chwili zmienić zdanie...',
  },
  step5: {
    title: 'Jak sobie z tym poradzisz?',
    hint: 'Jak zaradzić tym potencjalnym problemom? Zaplanuj strategie z wyprzedzeniem.',
    placeholder: 'Np. Przed rozmową przypomnę sobie, że mam prawo do odmowy...',
  },
  // Result phase
  step6: {
    title: 'Co się wydarzyło?',
    hint: 'Opisz rzeczywisty wynik eksperymentu. Co zaobserwowałeś?',
    placeholder: 'Np. Szef przyjął to spokojnie i powiedział, że docenia szczerość...',
  },
  step7: {
    title: 'W jakim stopniu to potwierdza twoją myśl?',
    hint: 'Od 0% (myśl całkowicie obalona) do 100% (myśl w pełni potwierdzona).',
    sliderLabel: 'Wynik potwierdza myśl w %',
  },
  step8: {
    title: 'Czego nauczył cię ten eksperyment?',
    hint: 'Opisz wnioski. Co to mówi o twoim pierwotnym przekonaniu?',
    placeholder: 'Np. Moje przekonanie było błędne. Odmowa nie skończyła się żadnymi negatywnymi konsekwencjami...',
  },
  detail: {
    belief: 'Weryfikowana myśl',
    planSection: 'Plan',
    resultSection: 'Wynik',
    plan: 'Eksperyment',
    predictedOutcome: 'Przewidywana reakcja',
    potentialProblems: 'Potencjalne problemy',
    problemStrategies: 'Strategie rozwiązania',
    actualOutcome: 'Co się wydarzyło',
    confirmationPercent: 'Potwierdzenie myśli',
    conclusion: 'Czego się nauczyłem',
    addResult: 'Dodaj wynik',
  },
  nav: {
    next: 'Dalej',
    back: 'Wstecz',
    finish: 'Zakończ',
  },
  onboarding: {
    badge: 'Przykład',
  },
};
```

- [ ] **Commit**

```bash
git add src/tools/behavioral-experiment/i18n/pl.ts
git commit -m "feat(be): update i18n strings for classic CBT form"
```

---

## Task 5: NewExperimentFlow — 5+3 kroków

**Files:**
- Modify: `src/tools/behavioral-experiment/screens/NewExperimentFlow.tsx`
- Modify: `src/tools/behavioral-experiment/__tests__/NewExperimentFlow.test.tsx`

- [ ] **Najpierw napisz nowe testy (zastąp cały plik)**

```typescript
// src/tools/behavioral-experiment/__tests__/NewExperimentFlow.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => ({}) }));
jest.mock('expo-router', () => ({ router: { replace: jest.fn(), back: jest.fn() } }));
jest.mock('../repository');

import * as repo from '../repository';
import { NewExperimentFlow } from '../screens/NewExperimentFlow';

const mockExperiment = {
  id: 'exp-1',
  status: 'planned' as const,
  belief: 'Test belief',
  plan: '',
  predictedOutcome: '',
  potentialProblems: '',
  problemStrategies: '',
  actualOutcome: null,
  confirmationPercent: null,
  conclusion: null,
  isExample: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

describe('NewExperimentFlow phase=plan', () => {
  it('renders step 1 title on initial render', async () => {
    (repo.createExperiment as jest.Mock).mockResolvedValue(mockExperiment);

    render(<NewExperimentFlow phase="plan" />);

    await waitFor(() => {
      expect(screen.getByText('Jaką myśl chcesz zweryfikować?')).toBeTruthy();
    });
  });

  it('"Dalej" is disabled when belief field is empty', async () => {
    (repo.createExperiment as jest.Mock).mockResolvedValue({
      ...mockExperiment,
      belief: '',
    });

    render(<NewExperimentFlow phase="plan" />);

    await waitFor(() => screen.getByText('Jaką myśl chcesz zweryfikować?'));

    const dalej = screen.getByText('Dalej');
    expect(dalej.props.accessibilityState?.disabled ?? dalej.parent?.props.disabled).toBeTruthy();
  });

  it('moves to step 2 after entering belief and pressing Dalej', async () => {
    (repo.createExperiment as jest.Mock).mockResolvedValue({ ...mockExperiment, belief: '' });
    (repo.updateExperiment as jest.Mock).mockResolvedValue(undefined);

    render(<NewExperimentFlow phase="plan" />);

    await waitFor(() => screen.getByText('Jaką myśl chcesz zweryfikować?'));

    fireEvent.changeText(
      screen.getByPlaceholderText(/Np\. Jeśli odmówię szefowi/),
      'Moje przekonanie'
    );
    fireEvent.press(screen.getByText('Dalej'));

    await waitFor(() => {
      expect(screen.getByText('Co konkretnie zrobisz?')).toBeTruthy();
    });
    expect(repo.updateExperiment).toHaveBeenCalledWith(
      expect.anything(),
      'exp-1',
      expect.objectContaining({ belief: 'Moje przekonanie', currentStep: 1 })
    );
  });

  it('shows "Zakończ" on step 5 (last plan step)', async () => {
    (repo.createExperiment as jest.Mock).mockResolvedValue(mockExperiment);
    (repo.updateExperiment as jest.Mock).mockResolvedValue(undefined);

    render(<NewExperimentFlow phase="plan" />);

    await waitFor(() => screen.getByText('Jaką myśl chcesz zweryfikować?'));

    // Step 1: type belief → Dalej
    fireEvent.changeText(screen.getByPlaceholderText(/Np\. Jeśli odmówię szefowi/), 'Przekonanie');
    fireEvent.press(screen.getByText('Dalej'));

    // Step 2: type plan → Dalej
    await waitFor(() => screen.getByText('Co konkretnie zrobisz?'));
    fireEvent.changeText(screen.getByPlaceholderText(/Np\. W piątek/), 'Zrobię X');
    fireEvent.press(screen.getByText('Dalej'));

    // Step 3: Dalej (optional)
    await waitFor(() => screen.getByText('Jak myślisz — co się stanie?'));
    fireEvent.press(screen.getByText('Dalej'));

    // Step 4: Dalej (optional)
    await waitFor(() => screen.getByText('Co może przeszkodzić?'));
    fireEvent.press(screen.getByText('Dalej'));

    // Step 5: Zakończ visible
    await waitFor(() => {
      expect(screen.getByText('Jak sobie z tym poradzisz?')).toBeTruthy();
      expect(screen.getByText('Zakończ')).toBeTruthy();
    });
  });
});

describe('NewExperimentFlow phase=result', () => {
  it('loads existing experiment and shows step 6 title', async () => {
    (repo.getExperimentById as jest.Mock).mockResolvedValue(mockExperiment);

    render(<NewExperimentFlow phase="result" experimentId="exp-1" />);

    await waitFor(() => {
      expect(screen.getByText('Co się wydarzyło?')).toBeTruthy();
    });
  });

  it('saves conclusion and sets status=completed on finish', async () => {
    (repo.getExperimentById as jest.Mock).mockResolvedValue(mockExperiment);
    (repo.updateExperiment as jest.Mock).mockResolvedValue(undefined);

    render(<NewExperimentFlow phase="result" experimentId="exp-1" />);

    // Step 6 (result step 1): actualOutcome required
    await waitFor(() => screen.getByText('Co się wydarzyło?'));
    fireEvent.changeText(
      screen.getByPlaceholderText(/Np\. Szef przyjął to spokojnie/),
      'Wszystko poszło dobrze'
    );
    fireEvent.press(screen.getByText('Dalej'));

    // Step 7 (result step 2): slider — optional, Dalej enabled
    await waitFor(() => screen.getByText('W jakim stopniu to potwierdza twoją myśl?'));
    fireEvent.press(screen.getByText('Dalej'));

    // Step 8 (result step 3): conclusion required → type → Zakończ
    await waitFor(() => screen.getByText('Czego nauczył cię ten eksperyment?'));
    fireEvent.changeText(
      screen.getByPlaceholderText(/Moje przekonanie było błędne/),
      'Nauczyłem się czegoś nowego'
    );
    fireEvent.press(screen.getByText('Zakończ'));

    await waitFor(() => {
      expect(repo.updateExperiment).toHaveBeenCalledWith(
        expect.anything(),
        'exp-1',
        expect.objectContaining({ status: 'completed', isComplete: true })
      );
    });
  });
});
```

- [ ] **Uruchom testy — powinny failować**

```bash
npx jest --testPathPattern="behavioral-experiment/__tests__/NewExperimentFlow" 2>&1 | tail -15
```

Oczekiwane: FAIL.

- [ ] **Zaktualizuj NewExperimentFlow.tsx (zastąp całą zawartość)**

```typescript
// src/tools/behavioral-experiment/screens/NewExperimentFlow.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors } from '../../../core/theme';
import { StepProgress } from '../../../core/components/StepProgress';
import { StepHelper } from '../../../core/components/StepHelper';
import { IntensitySlider } from '../../../core/components/IntensitySlider';
import { pl } from '../i18n/pl';
import * as repo from '../repository';

interface Props {
  phase: 'plan' | 'result';
  experimentId?: string;
}

interface PlanState {
  belief: string;
  plan: string;
  predictedOutcome: string;
  potentialProblems: string;
  problemStrategies: string;
}

interface ResultState {
  actualOutcome: string;
  confirmationPercent: number;
  conclusion: string;
}

const PLAN_STEPS = 5;
const RESULT_STEPS = 3;

export function NewExperimentFlow({ phase, experimentId }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const [expId, setExpId] = useState<string | null>(experimentId ?? null);
  const [loading, setLoading] = useState(phase === 'result');
  const [currentStep, setCurrentStep] = useState(1);

  const [planState, setPlanState] = useState<PlanState>({
    belief: '',
    plan: '',
    predictedOutcome: '',
    potentialProblems: '',
    problemStrategies: '',
  });

  const [resultState, setResultState] = useState<ResultState>({
    actualOutcome: '',
    confirmationPercent: 50,
    conclusion: '',
  });

  useEffect(() => {
    if (phase !== 'result' || !experimentId) return;
    (async () => {
      const exp = await repo.getExperimentById(db, experimentId);
      if (exp) {
        setExpId(exp.id);
        setResultState(prev => ({
          ...prev,
          actualOutcome: exp.actualOutcome ?? '',
          confirmationPercent: exp.confirmationPercent ?? 50,
          conclusion: exp.conclusion ?? '',
        }));
      }
      setLoading(false);
    })();
  }, [db, phase, experimentId]);

  useEffect(() => {
    if (phase !== 'plan') return;
    (async () => {
      const exp = await repo.createExperiment(db);
      setExpId(exp.id);
    })();
  }, [db, phase]);

  const totalSteps = phase === 'plan' ? PLAN_STEPS : RESULT_STEPS;

  const isNextEnabled = useCallback((): boolean => {
    if (phase === 'plan') {
      if (currentStep === 1) return planState.belief.trim().length > 0;
      if (currentStep === 2) return planState.plan.trim().length > 0;
      return true;
    } else {
      if (currentStep === 1) return resultState.actualOutcome.trim().length > 0;
      if (currentStep === 3) return resultState.conclusion.trim().length > 0;
      return true;
    }
  }, [phase, currentStep, planState, resultState]);

  const saveCurrentStep = useCallback(async () => {
    if (!expId) return;
    const stepNumber = phase === 'plan' ? currentStep : currentStep + 5;

    if (phase === 'plan') {
      const updates: Parameters<typeof repo.updateExperiment>[2] = { currentStep: stepNumber };
      if (currentStep === 1) { updates.belief = planState.belief; }
      if (currentStep === 2) { updates.plan = planState.plan; }
      if (currentStep === 3) { updates.predictedOutcome = planState.predictedOutcome; }
      if (currentStep === 4) { updates.potentialProblems = planState.potentialProblems; }
      if (currentStep === 5) { updates.problemStrategies = planState.problemStrategies; updates.status = 'planned'; }
      await repo.updateExperiment(db, expId, updates);
    } else {
      const updates: Parameters<typeof repo.updateExperiment>[2] = { currentStep: stepNumber };
      if (currentStep === 1) { updates.actualOutcome = resultState.actualOutcome; }
      if (currentStep === 2) { updates.confirmationPercent = resultState.confirmationPercent; }
      if (currentStep === 3) {
        updates.conclusion = resultState.conclusion;
        updates.status = 'completed';
        updates.isComplete = true;
      }
      await repo.updateExperiment(db, expId, updates);
    }
  }, [db, expId, phase, currentStep, planState, resultState]);

  const handleNext = useCallback(async () => {
    await saveCurrentStep();
    if (currentStep < totalSteps) {
      setCurrentStep(s => s + 1);
    } else {
      router.replace('/(tools)/behavioral-experiment');
    }
  }, [saveCurrentStep, currentStep, totalSteps]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    } else {
      router.back();
    }
  }, [currentStep]);

  const updatePlan = useCallback(<K extends keyof PlanState>(key: K, value: PlanState[K]) => {
    setPlanState(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateResult = useCallback(<K extends keyof ResultState>(key: K, value: ResultState[K]) => {
    setResultState(prev => ({ ...prev, [key]: value }));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const isLast = currentStep === totalSteps;
  const nextEnabled = isNextEnabled();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StepProgress totalSteps={totalSteps} currentStep={currentStep} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {phase === 'plan' && renderPlanStep(currentStep, planState, updatePlan)}
        {phase === 'result' && renderResultStep(currentStep, resultState, updateResult)}
      </ScrollView>

      <View style={styles.navRow}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.btnBack} onPress={handleBack}>
            <Text style={styles.btnBackText}>{pl.nav.back}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.btnNext, !nextEnabled && styles.btnDisabled, isLast && styles.btnFinish]}
          onPress={handleNext}
          disabled={!nextEnabled}
          accessibilityState={{ disabled: !nextEnabled }}
        >
          <Text
            style={[styles.btnNextText, !nextEnabled && styles.btnDisabledText]}
            accessibilityState={{ disabled: !nextEnabled }}
          >
            {isLast ? pl.nav.finish : pl.nav.next}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function renderPlanStep(
  step: number,
  state: PlanState,
  update: <K extends keyof PlanState>(key: K, value: PlanState[K]) => void,
): React.ReactNode {
  if (step === 1) return (
    <View>
      <Text style={styles.stepTitle}>{pl.step1.title}</Text>
      <TextInput
        style={styles.input}
        value={state.belief}
        onChangeText={v => update('belief', v)}
        placeholder={pl.step1.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step1.hint} />
    </View>
  );
  if (step === 2) return (
    <View>
      <Text style={styles.stepTitle}>{pl.step2.title}</Text>
      <TextInput
        style={styles.input}
        value={state.plan}
        onChangeText={v => update('plan', v)}
        placeholder={pl.step2.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step2.hint} />
    </View>
  );
  if (step === 3) return (
    <View>
      <Text style={styles.stepTitle}>{pl.step3.title}</Text>
      <TextInput
        style={styles.input}
        value={state.predictedOutcome}
        onChangeText={v => update('predictedOutcome', v)}
        placeholder={pl.step3.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step3.hint} />
    </View>
  );
  if (step === 4) return (
    <View>
      <Text style={styles.stepTitle}>{pl.step4.title}</Text>
      <TextInput
        style={styles.input}
        value={state.potentialProblems}
        onChangeText={v => update('potentialProblems', v)}
        placeholder={pl.step4.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step4.hint} />
    </View>
  );
  return (
    <View>
      <Text style={styles.stepTitle}>{pl.step5.title}</Text>
      <TextInput
        style={styles.input}
        value={state.problemStrategies}
        onChangeText={v => update('problemStrategies', v)}
        placeholder={pl.step5.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step5.hint} />
    </View>
  );
}

function renderResultStep(
  step: number,
  state: ResultState,
  update: <K extends keyof ResultState>(key: K, value: ResultState[K]) => void,
): React.ReactNode {
  if (step === 1) return (
    <View>
      <Text style={styles.stepTitle}>{pl.step6.title}</Text>
      <TextInput
        style={styles.input}
        value={state.actualOutcome}
        onChangeText={v => update('actualOutcome', v)}
        placeholder={pl.step6.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step6.hint} />
    </View>
  );
  if (step === 2) return (
    <View>
      <Text style={styles.stepTitle}>{pl.step7.title}</Text>
      <StepHelper hint={pl.step7.hint} />
      <IntensitySlider
        label={pl.step7.sliderLabel}
        value={state.confirmationPercent}
        onChange={v => update('confirmationPercent', v)}
      />
    </View>
  );
  return (
    <View>
      <Text style={styles.stepTitle}>{pl.step8.title}</Text>
      <TextInput
        style={styles.input}
        value={state.conclusion}
        onChangeText={v => update('conclusion', v)}
        placeholder={pl.step8.placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        textAlignVertical="top"
      />
      <StepHelper hint={pl.step8.hint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12, lineHeight: 28 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    padding: 15, fontSize: 15, color: colors.text, lineHeight: 24,
    minHeight: 100,
  },
  navRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  btnBack: {
    flex: 1, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  btnBackText: { fontSize: 15, color: colors.textMuted, fontWeight: '500' },
  btnNext: {
    flex: 2, backgroundColor: colors.accent,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  btnFinish: { backgroundColor: colors.success },
  btnDisabled: { backgroundColor: colors.border },
  btnNextText: { fontSize: 15, color: colors.bg, fontWeight: '600' },
  btnDisabledText: { color: colors.textDim },
});
```

- [ ] **Uruchom testy NewExperimentFlow — powinny przechodzić**

```bash
npx jest --testPathPattern="behavioral-experiment/__tests__/NewExperimentFlow" 2>&1 | tail -10
```

Oczekiwane: PASS (5 testów).

- [ ] **Commit**

```bash
git add src/tools/behavioral-experiment/screens/NewExperimentFlow.tsx
git add src/tools/behavioral-experiment/__tests__/NewExperimentFlow.test.tsx
git commit -m "feat(be): 5-step plan flow + 3-step result flow for classic CBT form"
```

---

## Task 6: ExperimentDetailScreen — nowe sekcje

**Files:**
- Modify: `src/tools/behavioral-experiment/screens/ExperimentDetailScreen.tsx`

- [ ] **Zastąp zawartość ExperimentDetailScreen.tsx**

```typescript
// src/tools/behavioral-experiment/screens/ExperimentDetailScreen.tsx
import React, { useCallback } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors } from '../../../core/theme';
import { useBehavioralExperiment } from '../hooks/useBehavioralExperiments';
import { pl } from '../i18n/pl';
import * as repo from '../repository';

interface Props { id: string; }

export function ExperimentDetailScreen({ id }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const { experiment, loading } = useBehavioralExperiment(db, id);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      'Usuń eksperyment',
      'Czy na pewno chcesz usunąć ten eksperyment? Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await repo.deleteExperiment(db, id);
              router.back();
            } catch {
              Alert.alert('Błąd', 'Nie udało się usunąć eksperymentu. Spróbuj ponownie.');
            }
          },
        },
      ]
    );
  }, [db, id]);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.accent} /></View>;
  if (!experiment) return <View style={styles.centered}><Text style={styles.missing}>Nie znaleziono eksperymentu.</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Weryfikowana myśl */}
      <View style={styles.beliefCard}>
        <Text style={styles.beliefLabel}>{pl.detail.belief}</Text>
        <Text style={styles.beliefText}>{'„'}{experiment.belief}{'"'}</Text>
      </View>

      {/* Plan section */}
      <Text style={styles.sectionHeader}>{pl.detail.planSection}</Text>
      <DetailRow label={pl.detail.plan} value={experiment.plan || '—'} />
      <DetailRow label={pl.detail.predictedOutcome} value={experiment.predictedOutcome || '—'} />
      <DetailRow label={pl.detail.potentialProblems} value={experiment.potentialProblems || '—'} />
      <DetailRow label={pl.detail.problemStrategies} value={experiment.problemStrategies || '—'} />

      {/* Add result button */}
      {experiment.status === 'planned' && (
        <TouchableOpacity
          style={styles.addResultBtn}
          onPress={() => router.push(`/(tools)/behavioral-experiment/${id}/result`)}
          activeOpacity={0.85}
        >
          <Text style={styles.addResultText}>{pl.detail.addResult}</Text>
        </TouchableOpacity>
      )}

      {/* Result section */}
      {experiment.status === 'completed' && (
        <>
          <Text style={styles.sectionHeader}>{pl.detail.resultSection}</Text>
          <DetailRow label={pl.detail.actualOutcome} value={experiment.actualOutcome || '—'} />
          {experiment.confirmationPercent != null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{pl.detail.confirmationPercent}</Text>
              <View style={styles.percentBar}>
                <View style={[styles.percentFill, { width: `${experiment.confirmationPercent}%` as `${number}%` }]} />
              </View>
              <Text style={styles.percentNum}>{experiment.confirmationPercent}%</Text>
            </View>
          )}
          <DetailRow label={pl.detail.conclusion} value={experiment.conclusion || '—'} />
        </>
      )}

      {/* Edit / Delete */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/(tools)/behavioral-experiment/${id}/edit`)}
          activeOpacity={0.8}
        >
          <Text style={styles.editBtnText}>✏ Edytuj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Usuń</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  missing: { color: colors.textMuted, fontStyle: 'italic' },
  beliefCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 20,
  },
  beliefLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  beliefText: { fontSize: 15, color: colors.text, fontStyle: 'italic', lineHeight: 22 },
  sectionHeader: { fontSize: 11, color: colors.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 8 },
  detailRow: {
    backgroundColor: colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    padding: 14, marginBottom: 8,
  },
  detailLabel: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  detailValue: { fontSize: 14, color: colors.text, lineHeight: 21 },
  percentBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginVertical: 6 },
  percentFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  percentNum: { fontSize: 13, color: colors.accent, fontWeight: '600' },
  addResultBtn: {
    backgroundColor: colors.success, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16, marginBottom: 4,
  },
  addResultText: { fontSize: 15, color: colors.bg, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  editBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  editBtnText: { fontSize: 14, color: colors.textMuted },
  deleteBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
    backgroundColor: colors.dangerDim, borderWidth: 1, borderColor: 'rgba(196,96,90,0.22)',
  },
  deleteBtnText: { fontSize: 14, color: colors.danger },
});
```

- [ ] **Commit**

```bash
git add src/tools/behavioral-experiment/screens/ExperimentDetailScreen.tsx
git commit -m "feat(be): update detail screen — plan/result sections, confirmation % bar"
```

---

## Task 7: Pełna weryfikacja i PR

- [ ] **Uruchom cały test suite BE**

```bash
npx jest --testPathPattern="behavioral-experiment" 2>&1 | tail -15
```

Oczekiwane: wszystkie testy zielone.

- [ ] **TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Oczekiwane: 0 błędów.

- [ ] **ESLint**

```bash
npx eslint src/tools/behavioral-experiment/ --max-warnings=0 2>&1 | tail -10
```

Oczekiwane: 0 warnings.

- [ ] **Pełny test suite (cały projekt)**

```bash
npx jest 2>&1 | tail -10
```

Oczekiwane: wszystkie testy zielone (≥ 106).

- [ ] **Push i PR**

```bash
git push -u origin feat/be-redesign
gh pr create --title "feat: redesign Behavioral Experiment to classic CBT form" --body "$(cat <<'EOF'
## Summary
- New data model: 5 plan fields + 3 result fields matching classic CBT paper form
- Migration 002: drop and recreate behavioral_experiments table (no backward compat)
- Plan flow: 5 steps (belief, experiment, predicted reaction, potential problems, strategies)
- Result flow: 3 steps (actual outcome, confirmation %, conclusion)
- Updated detail screen with Plan/Result sections and confirmation % bar

## Test plan
- [ ] All BE tests pass
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Manual: create new experiment through full 5-step plan flow
- [ ] Manual: add result through 3-step result flow
- [ ] Manual: verify detail screen shows all sections
EOF
)"
```
