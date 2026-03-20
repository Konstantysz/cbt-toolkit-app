import type { Migration } from '../../../core/types/tool';

export const migration001: Migration = {
  id: 'thought-record-001',
  description: 'Create thought_records table',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS thought_records (
        id TEXT PRIMARY KEY REFERENCES tool_entries(id) ON DELETE CASCADE,
        situation TEXT NOT NULL DEFAULT '',
        situation_date TEXT,
        emotions TEXT NOT NULL DEFAULT '[]',
        automatic_thoughts TEXT NOT NULL DEFAULT '',
        evidence_for TEXT NOT NULL DEFAULT '',
        evidence_against TEXT NOT NULL DEFAULT '',
        alternative_thought TEXT NOT NULL DEFAULT '',
        outcome TEXT
      );
    `);
  },
};
