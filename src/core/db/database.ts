import * as SQLite from 'expo-sqlite';
import type { Migration } from '../types/tool';

export async function initCoreTables(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
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
