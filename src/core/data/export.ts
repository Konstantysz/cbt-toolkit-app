import { cacheDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type * as SQLite from 'expo-sqlite';
import { useSettings } from '../settings/store';

export async function exportData(db: SQLite.SQLiteDatabase): Promise<void> {
  const thoughtRecords = await db.getAllAsync(`
    SELECT tr.*, te.is_complete, te.current_step, te.created_at, te.updated_at
    FROM thought_records tr
    JOIN tool_entries te ON tr.id = te.id
    ORDER BY te.created_at ASC
  `);

  const behavioralExperiments = await db.getAllAsync(`
    SELECT be.*, te.is_complete, te.current_step, te.created_at, te.updated_at
    FROM behavioral_experiments be
    JOIN tool_entries te ON be.id = te.id
    ORDER BY te.created_at ASC
  `);

  const { reminderEnabled, reminderTime, fontSize, reducedMotion, highContrast } =
    useSettings.getState();

  const exportObj = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: { reminderEnabled, reminderTime, fontSize, reducedMotion, highContrast },
    thoughtRecords,
    behavioralExperiments,
  };

  const filePath = `${cacheDirectory}cbt-export-${Date.now()}.json`;
  await writeAsStringAsync(filePath, JSON.stringify(exportObj, null, 2));
  await Sharing.shareAsync(filePath, { mimeType: 'application/json' });
}
