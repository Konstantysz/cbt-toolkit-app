jest.mock('expo-sqlite');
jest.mock('../repository');

import { renderHook, act } from '@testing-library/react-native';
import * as SQLite from 'expo-sqlite';
import * as repo from '../repository';
import { useAbcEntries, useAbcEntry } from '../hooks/useAbcEntries';
import type { AbcEntry } from '../types';

const mockDb = {} as SQLite.SQLiteDatabase;

const fakeEntry: AbcEntry = {
  id: 'abc-1',
  situation: 'Test situation',
  thoughts: 'Test thoughts',
  behaviors: 'Test behaviors',
  emotions: 'Test emotions',
  physicalSymptoms: 'Test symptoms',
  isComplete: true,
  isExample: false,
  currentStep: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

describe('useAbcEntries', () => {
  it('loads entries on mount', async () => {
    (repo.getEntries as jest.Mock).mockResolvedValue([fakeEntry]);

    const { result } = renderHook(() => useAbcEntries(mockDb));

    await act(async () => {});

    expect(result.current.entries).toEqual([fakeEntry]);
    expect(result.current.loading).toBe(false);
  });

  it('starts with loading true', () => {
    (repo.getEntries as jest.Mock).mockResolvedValue([]);
    const { result } = renderHook(() => useAbcEntries(mockDb));
    expect(result.current.loading).toBe(true);
  });

  it('does not fetch when db is null', async () => {
    const { result } = renderHook(() => useAbcEntries(null));
    await act(async () => {});
    expect(repo.getEntries).not.toHaveBeenCalled();
    expect(result.current.entries).toEqual([]);
  });
});

describe('useAbcEntry', () => {
  it('loads a single entry by id', async () => {
    (repo.getEntryById as jest.Mock).mockResolvedValue(fakeEntry);

    const { result } = renderHook(() => useAbcEntry(mockDb, 'abc-1'));

    await act(async () => {});

    expect(result.current.entry).toEqual(fakeEntry);
    expect(result.current.loading).toBe(false);
  });

  it('does not fetch when db is null', () => {
    const { result } = renderHook(() => useAbcEntry(null, 'abc-1'));
    expect(repo.getEntryById).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });
});
