import React from 'react';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react-native';
import { RecordListScreen } from '../screens/RecordListScreen';
import { RecordDetailScreen } from '../screens/RecordDetailScreen';
import { useThoughtRecords, useThoughtRecord } from '../hooks/useThoughtRecords';
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
jest.mock('../hooks/useThoughtRecords', () => {
  const actual = jest.requireActual('../hooks/useThoughtRecords');
  return { ...actual, useThoughtRecords: jest.fn(), useThoughtRecord: jest.fn() };
});

const mockList = useThoughtRecords as jest.Mock;
const mockOne = useThoughtRecord as jest.Mock;
const mockSeed = seedOnce as jest.Mock;
const refresh = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockSeed.mockResolvedValue(false);
});

describe('RecordListScreen load error + seeding', () => {
  it('shows Polish error with retry, and does not seed', () => {
    mockList.mockReturnValue({ records: [], loading: false, error: true, refresh });
    render(<RecordListScreen />);
    expect(screen.getByText('Nie udało się wczytać danych.')).toBeTruthy();
    fireEvent.press(screen.getByText('Spróbuj ponownie'));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(mockSeed).not.toHaveBeenCalled();
  });

  it('seeds once for an empty successful load, then refreshes', async () => {
    mockSeed.mockResolvedValue(true);
    mockList.mockReturnValue({ records: [], loading: false, error: false, refresh });
    render(<RecordListScreen />);
    await act(async () => {});
    expect(mockSeed).toHaveBeenCalledWith(
      expect.anything(),
      'thought-record',
      repo.insertSeedRecord
    );
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not re-create the example once the flag is set', async () => {
    mockList.mockReturnValue({ records: [], loading: false, error: false, refresh });
    render(<RecordListScreen />);
    await act(async () => {});
    expect(refresh).not.toHaveBeenCalled();
  });
});

describe('RecordDetailScreen load error', () => {
  it('shows Polish error with retry instead of not-found', () => {
    mockOne.mockReturnValue({ record: null, loading: false, error: true, refresh });
    render(<RecordDetailScreen id="1" />);
    expect(screen.getByText('Nie udało się wczytać danych.')).toBeTruthy();
    fireEvent.press(screen.getByText('Spróbuj ponownie'));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

describe('thought-record hooks error state', () => {
  const actual = jest.requireActual('../hooks/useThoughtRecords');
  const stableDb = {};

  it('list hook exposes error when the load fails', async () => {
    (repo.getRecords as jest.Mock).mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => actual.useThoughtRecords(stableDb));
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.error).toBe(true);
  });

  it('detail hook exposes error when the load fails', async () => {
    (repo.getRecordById as jest.Mock).mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => actual.useThoughtRecord(stableDb, '1'));
    await act(async () => {});
    expect(result.current.error).toBe(true);
    expect(result.current.loading).toBe(false);
  });
});
