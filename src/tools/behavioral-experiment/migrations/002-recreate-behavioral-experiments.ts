import type { Migration } from '../../../core/types/tool';

export const migration002: Migration = {
  id: 'behavioral-experiment-002',
  description: 'Recreate behavioral_experiments table with classic CBT form schema',
  up: async (db) => {
    await db.execAsync(`
      DROP TABLE IF EXISTS behavioral_experiments;
      CREATE TABLE behavioral_experiments (
        id                     TEXT PRIMARY KEY REFERENCES tool_entries(id) ON DELETE CASCADE,
        status                 TEXT NOT NULL DEFAULT 'planned',
        belief                 TEXT NOT NULL DEFAULT '',
        belief_strength_before INTEGER NOT NULL DEFAULT 50,
        plan                   TEXT NOT NULL DEFAULT '',
        predicted_outcome      TEXT NOT NULL DEFAULT '',
        potential_problems     TEXT NOT NULL DEFAULT '',
        problem_strategies     TEXT NOT NULL DEFAULT '',
        execution_date         TEXT,
        actual_outcome         TEXT,
        confirmation_percent   INTEGER,
        belief_strength_after  INTEGER,
        conclusion             TEXT,
        is_example             INTEGER NOT NULL DEFAULT 0
      );
    `);
  },
};
