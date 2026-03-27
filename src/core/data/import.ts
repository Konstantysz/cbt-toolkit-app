import { readAsStringAsync } from 'expo-file-system/legacy';
import type * as SQLite from 'expo-sqlite';
import { useSettings } from '../settings/store';
import type { SettingsData } from '../settings/store';

interface RawRecord {
  id?: unknown;
  situation?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
  [key: string]: unknown;
}

interface RawExperiment {
  id?: unknown;
  belief?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
  [key: string]: unknown;
}

interface ExportFile {
  version?: unknown;
  thoughtRecords?: unknown;
  behavioralExperiments?: unknown;
  settings?: unknown;
  [key: string]: unknown;
}

/** Returns null if valid, or an error string describing the problem. */
export function validateExportFile(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return 'Plik nie jest obiektem JSON';
  const f = data as ExportFile;
  if (f.version !== 1) return 'Nieznana wersja pliku (oczekiwano 1)';
  if (!Array.isArray(f.thoughtRecords)) return 'Brak tablicy thoughtRecords';
  if (!Array.isArray(f.behavioralExperiments)) return 'Brak tablicy behavioralExperiments';
  const total =
    (f.thoughtRecords as unknown[]).length + (f.behavioralExperiments as unknown[]).length;
  if (total > 5000) return `Zbyt wiele rekordów (${total} > 5000)`;
  for (const r of f.thoughtRecords as RawRecord[]) {
    if (typeof r.id !== 'string' || !r.id) return 'Rekord myśli bez poprawnego id';
    if (typeof r.situation !== 'string' || !r.situation) return 'Rekord myśli bez pola situation';
    const ca = r.createdAt ?? r.created_at;
    if (typeof ca !== 'string' || !ca) return 'Rekord myśli bez createdAt';
  }
  for (const e of f.behavioralExperiments as RawExperiment[]) {
    if (typeof e.id !== 'string' || !e.id) return 'Eksperyment bez poprawnego id';
    if (typeof e.belief !== 'string' || !e.belief) return 'Eksperyment bez pola belief';
    const ca = e.createdAt ?? e.created_at;
    if (typeof ca !== 'string' || !ca) return 'Eksperyment bez createdAt';
  }
  return null;
}

export async function importData(
  db: SQLite.SQLiteDatabase,
  fileUri: string
): Promise<{ imported: number; skipped: number }> {
  const raw = await readAsStringAsync(fileUri);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Nieprawidłowy JSON');
  }

  const error = validateExportFile(parsed);
  if (error) throw new Error(error);

  const file = parsed as {
    thoughtRecords: RawRecord[];
    behavioralExperiments: RawExperiment[];
    settings?: unknown;
  };
  const now = new Date().toISOString();
  let imported = 0;
  let skipped = 0;

  // Pre-check existing IDs outside transaction (reads don't need to be serialised)
  const existingIds = new Set<string>();
  for (const r of file.thoughtRecords) {
    const row = await db.getFirstAsync<{ id: string }>('SELECT id FROM tool_entries WHERE id = ?', [
      r.id as string,
    ]);
    if (row) existingIds.add(r.id as string);
  }
  for (const e of file.behavioralExperiments) {
    const row = await db.getFirstAsync<{ id: string }>('SELECT id FROM tool_entries WHERE id = ?', [
      e.id as string,
    ]);
    if (row) existingIds.add(e.id as string);
  }

  await db.withTransactionAsync(async () => {
    for (const r of file.thoughtRecords) {
      const id = r.id as string;
      if (existingIds.has(id)) {
        skipped++;
        continue;
      }
      const createdAt = (r.createdAt ?? r.created_at) as string;
      await db.runAsync(
        `INSERT INTO tool_entries (id, tool_id, created_at, updated_at, is_complete, current_step) VALUES (?, 'thought-record', ?, ?, ?, ?)`,
        [
          id,
          createdAt,
          now,
          r.is_complete ? 1 : 0,
          typeof r.current_step === 'number' ? r.current_step : 1,
        ]
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO thought_records (id, situation, emotions, automatic_thoughts, evidence_for, evidence_against, alternative_thought, outcome, is_example, situation_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          r.situation as string,
          Array.isArray(r.emotions)
            ? JSON.stringify(r.emotions)
            : typeof r.emotions === 'string'
              ? r.emotions
              : '[]',
          typeof r.automatic_thoughts === 'string' ? r.automatic_thoughts : '',
          typeof r.evidence_for === 'string' ? r.evidence_for : '',
          typeof r.evidence_against === 'string' ? r.evidence_against : '',
          typeof r.alternative_thought === 'string' ? r.alternative_thought : '',
          typeof r.outcome === 'string' ? r.outcome : null,
          r.is_example ? 1 : 0,
          typeof r.situation_date === 'string' ? r.situation_date : null,
        ]
      );
      imported++;
    }

    for (const e of file.behavioralExperiments) {
      const id = e.id as string;
      if (existingIds.has(id)) {
        skipped++;
        continue;
      }
      const createdAt = (e.createdAt ?? e.created_at) as string;
      await db.runAsync(
        `INSERT INTO tool_entries (id, tool_id, created_at, updated_at, is_complete, current_step) VALUES (?, 'behavioral-experiment', ?, ?, ?, ?)`,
        [
          id,
          createdAt,
          now,
          e.is_complete ? 1 : 0,
          typeof e.current_step === 'number' ? e.current_step : 1,
        ]
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO behavioral_experiments (id, status, belief, belief_strength_before, alternative_belief, plan, predicted_outcome, execution_date, execution_notes, actual_outcome, conclusion, belief_strength_after, is_example) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          typeof e.status === 'string' ? e.status : 'planned',
          e.belief as string,
          typeof e.belief_strength_before === 'number' ? e.belief_strength_before : 50,
          typeof e.alternative_belief === 'string' ? e.alternative_belief : '',
          typeof e.plan === 'string' ? e.plan : '',
          typeof e.predicted_outcome === 'string' ? e.predicted_outcome : '',
          typeof e.execution_date === 'string' ? e.execution_date : null,
          typeof e.execution_notes === 'string' ? e.execution_notes : null,
          typeof e.actual_outcome === 'string' ? e.actual_outcome : null,
          typeof e.conclusion === 'string' ? e.conclusion : null,
          typeof e.belief_strength_after === 'number' ? e.belief_strength_after : null,
          e.is_example ? 1 : 0,
        ]
      );
      imported++;
    }
  });

  // Restore settings if present in the export file
  if (file.settings && typeof file.settings === 'object') {
    const s = file.settings as Partial<SettingsData>;
    const patch: Partial<SettingsData> = {};
    if (typeof s.reminderEnabled === 'boolean') patch.reminderEnabled = s.reminderEnabled;
    if (typeof s.reminderTime === 'string') patch.reminderTime = s.reminderTime;
    if (s.fontSize === 'sm' || s.fontSize === 'md' || s.fontSize === 'lg')
      patch.fontSize = s.fontSize;
    if (typeof s.reducedMotion === 'boolean') patch.reducedMotion = s.reducedMotion;
    if (typeof s.highContrast === 'boolean') patch.highContrast = s.highContrast;
    if (Object.keys(patch).length > 0) useSettings.setState(patch);
  }

  return { imported, skipped };
}
