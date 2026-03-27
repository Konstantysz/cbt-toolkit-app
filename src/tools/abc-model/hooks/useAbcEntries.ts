import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import type { AbcEntry } from '../types';
import * as repo from '../repository';

export function useAbcEntries(db: SQLite.SQLiteDatabase | null) {
  const [entries, setEntries] = useState<AbcEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!db) return;
    if (entries.length === 0) setLoading(true);
    try {
      const data = await repo.getEntries(db);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [db, entries.length]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, refresh };
}

export function useAbcEntry(db: SQLite.SQLiteDatabase | null, id: string) {
  const [entry, setEntry] = useState<AbcEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    setLoading(true);
    repo
      .getEntryById(db, id)
      .then(setEntry)
      .finally(() => setLoading(false));
  }, [db, id]);

  return { entry, loading };
}
