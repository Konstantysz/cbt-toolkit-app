import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import type { BehavioralExperiment, ExperimentStatus } from './types';

type DbRow = {
  id: string;
  status: string;
  belief: string;
  belief_strength_before: number;
  alternative_belief: string;
  plan: string;
  predicted_outcome: string;
  execution_date: string | null;
  execution_notes: string | null;
  actual_outcome: string | null;
  conclusion: string | null;
  belief_strength_after: number | null;
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
    beliefStrengthBefore: row.belief_strength_before,
    alternativeBelief: row.alternative_belief,
    plan: row.plan,
    predictedOutcome: row.predicted_outcome,
    executionDate: row.execution_date,
    executionNotes: row.execution_notes,
    actualOutcome: row.actual_outcome,
    conclusion: row.conclusion,
    beliefStrengthAfter: row.belief_strength_after,
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
    'belief', 'beliefStrengthBefore', 'alternativeBelief', 'plan', 'predictedOutcome',
  ] as const;
  const resultFields = [
    'executionDate', 'executionNotes', 'actualOutcome', 'conclusion', 'beliefStrengthAfter', 'status',
  ] as const;

  const hasBEUpdate = [...planFields, ...resultFields].some(k => updates[k] !== undefined);
  if (hasBEUpdate) {
    await db.runAsync(`
      UPDATE behavioral_experiments SET
        status             = COALESCE(?, status),
        belief             = COALESCE(?, belief),
        belief_strength_before = COALESCE(?, belief_strength_before),
        alternative_belief = COALESCE(?, alternative_belief),
        plan               = COALESCE(?, plan),
        predicted_outcome  = COALESCE(?, predicted_outcome),
        execution_date     = CASE WHEN ? IS NOT NULL THEN ? ELSE execution_date END,
        execution_notes    = CASE WHEN ? IS NOT NULL THEN ? ELSE execution_notes END,
        actual_outcome     = CASE WHEN ? IS NOT NULL THEN ? ELSE actual_outcome END,
        conclusion         = CASE WHEN ? IS NOT NULL THEN ? ELSE conclusion END,
        belief_strength_after = CASE WHEN ? IS NOT NULL THEN ? ELSE belief_strength_after END
      WHERE id = ?
    `, [
      updates.status ?? null,
      updates.belief ?? null,
      updates.beliefStrengthBefore ?? null,
      updates.alternativeBelief ?? null,
      updates.plan ?? null,
      updates.predictedOutcome ?? null,
      updates.executionDate ?? null, updates.executionDate ?? null,
      updates.executionNotes ?? null, updates.executionNotes ?? null,
      updates.actualOutcome ?? null, updates.actualOutcome ?? null,
      updates.conclusion ?? null, updates.conclusion ?? null,
      updates.beliefStrengthAfter ?? null, updates.beliefStrengthAfter ?? null,
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
  const today = now.split('T')[0];

  await db.runAsync(
    `INSERT INTO tool_entries (id, tool_id, created_at, updated_at, is_complete, current_step)
     VALUES (?, 'behavioral-experiment', ?, ?, ?, ?)`,
    [id, now, now, 1, 7]
  );

  await db.runAsync(
    `INSERT INTO behavioral_experiments
       (id, status, belief, belief_strength_before, alternative_belief, plan, predicted_outcome,
        execution_date, execution_notes, actual_outcome, conclusion, belief_strength_after, is_example)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      'completed',
      "Jeśli powiem 'nie', wszyscy się na mnie obrażą.",
      85,
      'Może koleżanka to przyjmie spokojnie — odmowa nie musi niszczyć relacji.',
      'W rozmowie z koleżanką odmówię pożyczenia pieniędzy i zobaczę, jak zareaguje.',
      'Koleżanka się obrazi i przestanie się do mnie odzywać.',
      today,
      'Odmówiłam koleżance pożyczenia pieniędzy.',
      'Koleżanka była zaskoczona, ale nie obraziła się. Nadal rozmawiamy normalnie.',
      'Odmowa nie zniszczyła relacji. Moje przekonanie było przesadzone.',
      30,
      1,
    ]
  );
}

export async function deleteAll(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM behavioral_experiments');
  await db.runAsync("DELETE FROM tool_entries WHERE tool_id = 'behavioral-experiment'");
}
