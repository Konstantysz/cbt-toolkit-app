import * as SQLite from 'expo-sqlite';
import type { AbcEntry } from '../types';
import * as repo from '../repository';
import { useLoad } from '../../../core/db/useLoad';

const NONE: AbcEntry[] = [];

export function useAbcEntries(db: SQLite.SQLiteDatabase | null) {
  const { data, loading, error, refresh } = useLoad(db, (d) => repo.getEntries(d), NONE);
  return { entries: data, loading, error, refresh };
}

export function useAbcEntry(db: SQLite.SQLiteDatabase | null, id: string) {
  const { data, loading, error, refresh } = useLoad<AbcEntry | null>(
    db,
    (d) => repo.getEntryById(d, id),
    null,
    id
  );
  return { entry: data, loading, error, refresh };
}
