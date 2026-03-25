import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import type { AbcEntry } from './types';

type DbRow = {
  id: string;
  situation: string;
  thoughts: string;
  behaviors: string;
  emotions: string;
  physical_symptoms: string;
  is_example: number;
  is_complete: number;
  current_step: number;
  created_at: string;
  updated_at: string;
};

function rowToEntry(row: DbRow): AbcEntry {
  return {
    id: row.id,
    situation: row.situation,
    thoughts: row.thoughts,
    behaviors: row.behaviors,
    emotions: row.emotions,
    physicalSymptoms: row.physical_symptoms,
    isExample: row.is_example === 1,
    isComplete: row.is_complete === 1,
    currentStep: row.current_step,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createEntry(db: SQLite.SQLiteDatabase): Promise<AbcEntry> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO tool_entries (id, tool_id, created_at, updated_at) VALUES (?, 'abc-model', ?, ?)`,
    [id, now, now]
  );
  await db.runAsync(`INSERT INTO abc_entries (id) VALUES (?)`, [id]);
  return (await getEntryById(db, id))!;
}

export async function getEntries(db: SQLite.SQLiteDatabase): Promise<AbcEntry[]> {
  const rows = await db.getAllAsync<DbRow>(`
    SELECT ae.*, te.is_complete, te.current_step, te.created_at, te.updated_at
    FROM abc_entries ae
    JOIN tool_entries te ON ae.id = te.id
    ORDER BY te.created_at DESC
  `);
  return rows.map(rowToEntry);
}

export async function getEntryById(
  db: SQLite.SQLiteDatabase,
  id: string
): Promise<AbcEntry | null> {
  const row = await db.getFirstAsync<DbRow>(`
    SELECT ae.*, te.is_complete, te.current_step, te.created_at, te.updated_at
    FROM abc_entries ae
    JOIN tool_entries te ON ae.id = te.id
    WHERE ae.id = ?
  `, [id]);
  return row ? rowToEntry(row) : null;
}

export async function updateEntry(
  db: SQLite.SQLiteDatabase,
  id: string,
  updates: Partial<Omit<AbcEntry, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const now = new Date().toISOString();
  const hasContent = (
    updates.situation !== undefined ||
    updates.thoughts !== undefined ||
    updates.behaviors !== undefined ||
    updates.emotions !== undefined ||
    updates.physicalSymptoms !== undefined
  );
  if (hasContent) {
    await db.runAsync(`
      UPDATE abc_entries SET
        situation = COALESCE(?, situation),
        thoughts = COALESCE(?, thoughts),
        behaviors = COALESCE(?, behaviors),
        emotions = COALESCE(?, emotions),
        physical_symptoms = COALESCE(?, physical_symptoms)
      WHERE id = ?
    `, [
      updates.situation ?? null,
      updates.thoughts ?? null,
      updates.behaviors ?? null,
      updates.emotions ?? null,
      updates.physicalSymptoms ?? null,
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

export async function deleteEntry(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM tool_entries WHERE id = ?', [id]);
}

export async function insertSeedEntry(db: SQLite.SQLiteDatabase): Promise<void> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO tool_entries (id, tool_id, created_at, updated_at, is_complete, current_step)
     VALUES (?, 'abc-model', ?, ?, 1, 2)`,
    [id, now, now]
  );
  await db.runAsync(
    `INSERT INTO abc_entries (id, situation, thoughts, behaviors, emotions, physical_symptoms, is_example)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [
      id,
      'Prezentacja przed całym zespołem — szef poprosił mnie o zabranie głosu bez wcześniejszego uprzedzenia.',
      'Jestem beznadziejny w mówieniu publicznie. Wszyscy widzą, że się trzęsę. Na pewno zrobię z siebie głupka.',
      'Mówiłem jak najkrócej i unikałem kontaktu wzrokowego. Po spotkaniu zamknąłem się w biurze.',
      'Wstyd, lęk, bezsilność.',
      'Przyspieszone bicie serca, drżenie rąk, napięcie karku i ramion.',
    ]
  );
}

export async function deleteAll(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync("DELETE FROM tool_entries WHERE tool_id = 'abc-model'");
}
