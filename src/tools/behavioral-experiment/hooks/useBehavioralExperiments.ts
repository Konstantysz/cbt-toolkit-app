import * as SQLite from 'expo-sqlite';
import type { BehavioralExperiment } from '../types';
import * as repo from '../repository';
import { useLoad } from '../../../core/db/useLoad';

const NONE: BehavioralExperiment[] = [];

export function useBehavioralExperiments(db: SQLite.SQLiteDatabase | null) {
  const { data, loading, error, refresh } = useLoad(db, (d) => repo.getExperiments(d), NONE);
  return { experiments: data, loading, error, refresh };
}

export function useBehavioralExperiment(db: SQLite.SQLiteDatabase | null, id: string) {
  const { data, loading, error, refresh } = useLoad<BehavioralExperiment | null>(
    db,
    (d) => repo.getExperimentById(d, id),
    null,
    id
  );
  return { experiment: data, loading, error, refresh };
}
