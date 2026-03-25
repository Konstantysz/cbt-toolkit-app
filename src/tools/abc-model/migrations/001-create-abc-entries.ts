import type { Migration } from '../../../core/types/tool';

export const migration001: Migration = {
  id: 'abc-model-001',
  description: 'Create abc_entries table',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS abc_entries (
        id TEXT PRIMARY KEY REFERENCES tool_entries(id) ON DELETE CASCADE,
        situation TEXT NOT NULL DEFAULT '',
        thoughts TEXT NOT NULL DEFAULT '',
        behaviors TEXT NOT NULL DEFAULT '',
        emotions TEXT NOT NULL DEFAULT '',
        physical_symptoms TEXT NOT NULL DEFAULT '',
        is_example INTEGER NOT NULL DEFAULT 0
      );
    `);
  },
};
