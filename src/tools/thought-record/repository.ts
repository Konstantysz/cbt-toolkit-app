import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import type { ThoughtRecord, Emotion } from './types';

type DbRow = {
  id: string;
  situation: string;
  situation_date: string | null;
  emotions: string;
  automatic_thoughts: string;
  evidence_for: string;
  evidence_against: string;
  alternative_thought: string;
  outcome: string | null;
  is_complete: number;
  is_example: number;
  current_step: number;
  created_at: string;
  updated_at: string;
};

function rowToRecord(row: DbRow): ThoughtRecord {
  return {
    id: row.id,
    situation: row.situation,
    situationDate: row.situation_date,
    emotions: JSON.parse(row.emotions) as Emotion[],
    automaticThoughts: row.automatic_thoughts,
    evidenceFor: row.evidence_for,
    evidenceAgainst: row.evidence_against,
    alternativeThought: row.alternative_thought,
    outcome: row.outcome,
    isComplete: row.is_complete === 1,
    isExample: row.is_example === 1,
    currentStep: row.current_step,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createRecord(db: SQLite.SQLiteDatabase): Promise<ThoughtRecord> {
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO tool_entries (id, tool_id, created_at, updated_at) VALUES (?, 'thought-record', ?, ?)`,
    [id, now, now]
  );
  await db.runAsync(
    `INSERT INTO thought_records (id) VALUES (?)`,
    [id]
  );
  return (await getRecordById(db, id))!;
}

export async function getRecords(db: SQLite.SQLiteDatabase): Promise<ThoughtRecord[]> {
  const rows = await db.getAllAsync<DbRow>(`
    SELECT tr.*, te.is_complete, te.current_step, te.created_at, te.updated_at
    FROM thought_records tr
    JOIN tool_entries te ON tr.id = te.id
    ORDER BY te.created_at DESC
  `);
  return rows.map(rowToRecord);
}

export async function getRecordById(
  db: SQLite.SQLiteDatabase,
  id: string
): Promise<ThoughtRecord | null> {
  const row = await db.getFirstAsync<DbRow>(`
    SELECT tr.*, te.is_complete, te.current_step, te.created_at, te.updated_at
    FROM thought_records tr
    JOIN tool_entries te ON tr.id = te.id
    WHERE tr.id = ?
  `, [id]);
  return row ? rowToRecord(row) : null;
}

export async function updateRecord(
  db: SQLite.SQLiteDatabase,
  id: string,
  updates: Partial<Omit<ThoughtRecord, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const now = new Date().toISOString();
  if (updates.emotions !== undefined ||
      updates.situation !== undefined ||
      updates.situationDate !== undefined ||
      updates.automaticThoughts !== undefined ||
      updates.evidenceFor !== undefined ||
      updates.evidenceAgainst !== undefined ||
      updates.alternativeThought !== undefined ||
      updates.outcome !== undefined) {
    await db.runAsync(`
      UPDATE thought_records SET
        situation = COALESCE(?, situation),
        situation_date = CASE WHEN ? IS NOT NULL THEN ? ELSE situation_date END,
        emotions = COALESCE(?, emotions),
        automatic_thoughts = COALESCE(?, automatic_thoughts),
        evidence_for = COALESCE(?, evidence_for),
        evidence_against = COALESCE(?, evidence_against),
        alternative_thought = COALESCE(?, alternative_thought),
        outcome = CASE WHEN ? IS NOT NULL THEN ? ELSE outcome END
      WHERE id = ?
    `, [
      updates.situation ?? null,
      updates.situationDate ?? null, updates.situationDate ?? null,
      updates.emotions ? JSON.stringify(updates.emotions) : null,
      updates.automaticThoughts ?? null,
      updates.evidenceFor ?? null,
      updates.evidenceAgainst ?? null,
      updates.alternativeThought ?? null,
      updates.outcome ?? null, updates.outcome ?? null,
      id,
    ]);
  }
  if (updates.isComplete !== undefined || updates.currentStep !== undefined) {
    await db.runAsync(`
      UPDATE tool_entries SET
        is_complete = COALESCE(?, is_complete),
        current_step = COALESCE(?, current_step),
        updated_at = ?
      WHERE id = ?
    `, [
      updates.isComplete !== undefined ? (updates.isComplete ? 1 : 0) : null,
      updates.currentStep ?? null,
      now,
      id,
    ]);
  }
}

export async function deleteRecord(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM tool_entries WHERE id = ?', [id]);
}
