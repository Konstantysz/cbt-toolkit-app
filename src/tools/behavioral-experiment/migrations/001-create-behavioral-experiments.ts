import type { Migration } from '../../../core/types/tool';

export const migration001: Migration = {
  id: 'behavioral-experiment-001',
  description: 'Create behavioral_experiments table',
  up: async (db) => {
    await db.execAsync(`
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
    `);
  },
};
