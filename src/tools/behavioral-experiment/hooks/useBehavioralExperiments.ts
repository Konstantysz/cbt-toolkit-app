import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import type { BehavioralExperiment } from '../types';
import * as repo from '../repository';

export function useBehavioralExperiments(db: SQLite.SQLiteDatabase | null) {
  const [experiments, setExperiments] = useState<BehavioralExperiment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const data = await repo.getExperiments(db);
      setExperiments(data);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { experiments, loading, refresh };
}

export function useBehavioralExperiment(
  db: SQLite.SQLiteDatabase | null,
  id: string
) {
  const [experiment, setExperiment] = useState<BehavioralExperiment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    setLoading(true);
    repo.getExperimentById(db, id)
      .then(setExperiment)
      .finally(() => setLoading(false));
  }, [db, id]);

  return { experiment, loading };
}
