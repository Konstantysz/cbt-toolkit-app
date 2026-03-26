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
    // Use flag+value pairs for nullable fields so callers can explicitly set them to NULL
    const aoSet = 'actualOutcome' in updates;
    const cpSet = 'confirmationPercent' in updates;
    const clSet = 'conclusion' in updates;

    await db.runAsync(`
      UPDATE behavioral_experiments SET
        status               = COALESCE(?, status),
        belief               = COALESCE(?, belief),
        plan                 = COALESCE(?, plan),
        predicted_outcome    = COALESCE(?, predicted_outcome),
        potential_problems   = COALESCE(?, potential_problems),
        problem_strategies   = COALESCE(?, problem_strategies),
        actual_outcome       = CASE WHEN ? = 1 THEN ? ELSE actual_outcome END,
        confirmation_percent = CASE WHEN ? = 1 THEN ? ELSE confirmation_percent END,
        conclusion           = CASE WHEN ? = 1 THEN ? ELSE conclusion END
      WHERE id = ?
    `, [
      updates.status ?? null,
      updates.belief ?? null,
      updates.plan ?? null,
      updates.predictedOutcome ?? null,
      updates.potentialProblems ?? null,
      updates.problemStrategies ?? null,
      aoSet ? 1 : 0, aoSet ? (updates.actualOutcome ?? null) : null,
      cpSet ? 1 : 0, cpSet ? (updates.confirmationPercent ?? null) : null,
      clSet ? 1 : 0, clSet ? (updates.conclusion ?? null) : null,
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
