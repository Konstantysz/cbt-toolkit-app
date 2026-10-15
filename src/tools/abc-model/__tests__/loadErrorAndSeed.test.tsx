import React from 'react';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react-native';
import { AbcListScreen } from '../screens/AbcListScreen';
import { AbcDetailScreen } from '../screens/AbcDetailScreen';
import { useAbcEntries, useAbcEntry } from '../hooks/useAbcEntries';
import * as repo from '../repository';
import { seedOnce } from '../../../core/db/seedOnce';

jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => ({}) }));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useFocusEffect: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('../repository');
jest.mock('../../../core/db/seedOnce');
jest.mock('../hooks/useAbcEntries', () => {
  const actual = jest.requireActual('../hooks/useAbcEntries');
  return { ...actual, useAbcEntries: jest.fn(), useAbcEntry: jest.fn() };
});

const mockList = useAbcEntries as jest.Mock;
const mockOne = useAbcEntry as jest.Mock;
const mockSeed = seedOnce as jest.Mock;
const refresh = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockSeed.mockResolvedValue(false);
});

describe('AbcListScreen load error + seeding', () => {
  it('shows Polish error with retry, and does not seed', () => {
    mockList.mockReturnValue({ entries: [], loading: false, error: true, refresh });
    render(<AbcListScreen />);
    expect(screen.getByText('Nie udało się wczytać danych.')).toBeTruthy();
    expect(screen.queryByText('Brak wpisów')).toBeNull();
    fireEvent.press(screen.getByText('Spróbuj ponownie'));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(mockSeed).not.toHaveBeenCalled();
  });

  it('seeds when the successfully loaded list is empty, then refreshes', async () => {
    mockSeed.mockResolvedValue(true);
    mockList.mockReturnValue({ entries: [], loading: false, error: false, refresh });
    render(<AbcListScreen />);
    await act(async () => {});
    expect(mockSeed).toHaveBeenCalledWith(expect.anything(), 'abc-model', repo.insertSeedEntry);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not refresh when the example was already seeded earlier', async () => {
    mockList.mockReturnValue({ entries: [], loading: false, error: false, refresh });
    render(<AbcListScreen />);
    await act(async () => {});
    expect(refresh).not.toHaveBeenCalled();
  });

  it('does not seed while loading or when entries exist', () => {
    mockList.mockReturnValue({ entries: [], loading: true, error: false, refresh });
    render(<AbcListScreen />);
    expect(mockSeed).not.toHaveBeenCalled();
  });
});

describe('AbcDetailScreen load error', () => {
  it('shows Polish error with retry instead of not-found', () => {
    mockOne.mockReturnValue({ entry: null, loading: false, error: true, refresh });
    render(<AbcDetailScreen id="1" />);
    expect(screen.getByText('Nie udało się wczytać danych.')).toBeTruthy();
    fireEvent.press(screen.getByText('Spróbuj ponownie'));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

describe('abc hooks error state', () => {
  const actual = jest.requireActual('../hooks/useAbcEntries');
  const stableDb = {};

  it('list hook exposes error when the load fails', async () => {
    (repo.getEntries as jest.Mock).mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => actual.useAbcEntries(stableDb));
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.error).toBe(true);
    expect(result.current.entries).toEqual([]);
  });

  it('detail hook exposes error when the load fails', async () => {
    (repo.getEntryById as jest.Mock).mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => actual.useAbcEntry(stableDb, '1'));
    await act(async () => {});
    expect(result.current.error).toBe(true);
    expect(result.current.loading).toBe(false);
  });
});
