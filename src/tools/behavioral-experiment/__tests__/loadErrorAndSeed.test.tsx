import React from 'react';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react-native';
import { ExperimentListScreen } from '../screens/ExperimentListScreen';
import { ExperimentDetailScreen } from '../screens/ExperimentDetailScreen';
import {
  useBehavioralExperiments,
  useBehavioralExperiment,
} from '../hooks/useBehavioralExperiments';
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
jest.mock('../hooks/useBehavioralExperiments', () => {
  const actual = jest.requireActual('../hooks/useBehavioralExperiments');
  return { ...actual, useBehavioralExperiments: jest.fn(), useBehavioralExperiment: jest.fn() };
});

const mockList = useBehavioralExperiments as jest.Mock;
const mockOne = useBehavioralExperiment as jest.Mock;
const mockSeed = seedOnce as jest.Mock;
const refresh = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockSeed.mockResolvedValue(false);
});

describe('ExperimentListScreen load error + seeding', () => {
  it('shows Polish error with retry, and does not seed', () => {
    mockList.mockReturnValue({ experiments: [], loading: false, error: true, refresh });
    render(<ExperimentListScreen />);
    expect(screen.getByText('Nie udało się wczytać danych.')).toBeTruthy();
    fireEvent.press(screen.getByText('Spróbuj ponownie'));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(mockSeed).not.toHaveBeenCalled();
  });

  it('seeds once for an empty successful load, then refreshes', async () => {
    mockSeed.mockResolvedValue(true);
    mockList.mockReturnValue({ experiments: [], loading: false, error: false, refresh });
    render(<ExperimentListScreen />);
    await act(async () => {});
    expect(mockSeed).toHaveBeenCalledWith(
      expect.anything(),
      'behavioral-experiment',
      repo.insertSeedExperiment
    );
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not re-create the example after the user deleted everything', async () => {
    // seedOnce reports false: the persisted flag is already set
    mockList.mockReturnValue({ experiments: [], loading: false, error: false, refresh });
    render(<ExperimentListScreen />);
    await act(async () => {});
    expect(refresh).not.toHaveBeenCalled();
    expect(screen.getByText('Brak eksperymentów')).toBeTruthy();
  });
});

describe('ExperimentDetailScreen load error', () => {
  it('shows Polish error with retry instead of not-found', () => {
    mockOne.mockReturnValue({ experiment: null, loading: false, error: true, refresh });
    render(<ExperimentDetailScreen id="1" />);
    expect(screen.getByText('Nie udało się wczytać danych.')).toBeTruthy();
    fireEvent.press(screen.getByText('Spróbuj ponownie'));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

describe('experiment hooks error state', () => {
  const actual = jest.requireActual('../hooks/useBehavioralExperiments');
  const stableDb = {};

  it('list hook exposes error when the load fails', async () => {
    (repo.getExperiments as jest.Mock).mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => actual.useBehavioralExperiments(stableDb));
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.error).toBe(true);
  });

  it('detail hook exposes error when the load fails', async () => {
    (repo.getExperimentById as jest.Mock).mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => actual.useBehavioralExperiment(stableDb, '1'));
    await act(async () => {});
    expect(result.current.error).toBe(true);
    expect(result.current.loading).toBe(false);
  });
});
