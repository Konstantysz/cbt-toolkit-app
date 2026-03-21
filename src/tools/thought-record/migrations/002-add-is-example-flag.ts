import type { Migration } from '../../../core/types/tool';

export const migration002: Migration = {
  id: 'thought-record-002',
  description: 'Add is_example flag to thought_records',
  up: async (db) => {
    await db.execAsync(
      `ALTER TABLE thought_records ADD COLUMN is_example INTEGER NOT NULL DEFAULT 0;`
    );
  },
};
