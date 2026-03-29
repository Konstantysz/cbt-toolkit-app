import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ExperimentListScreen } from '../screens/ExperimentListScreen';

jest.mock('../repository', () => ({
  insertSeedExperiment: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => ({}),
}));

// Mock the hook
jest.mock('../hooks/useBehavioralExperiments');
import * as hooks from '../hooks/useBehavioralExperiments';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useFocusEffect: jest.fn((cb: () => void) => cb()),
}));
import { useFocusEffect } from 'expo-router';

const mockRefresh = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('ExperimentListScreen', () => {
  it('calls refresh via useFocusEffect when screen gains focus', () => {
    (hooks.useBehavioralExperiments as jest.Mock).mockReturnValue({
      experiments: [],
      loading: false,
      refresh: mockRefresh,
    });

    render(<ExperimentListScreen />);

    expect(useFocusEffect).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('shows empty state when no experiments', () => {
    (hooks.useBehavioralExperiments as jest.Mock).mockReturnValue({
      experiments: [],
      loading: false,
      refresh: mockRefresh,
    });

    render(<ExperimentListScreen />);

    expect(screen.getByText('Brak eksperymentów')).toBeTruthy();
  });

  it('shows seed example record with "Przykład" badge', () => {
    (hooks.useBehavioralExperiments as jest.Mock).mockReturnValue({
      experiments: [
        {
          id: 'seed-1',
          status: 'completed',
          belief: "Jeśli powiem 'nie', wszyscy się na mnie obrażą.",
          beliefStrengthBefore: 85,
          beliefStrengthAfter: 30,
          alternativeBelief: '',
          plan: '',
          predictedOutcome: '',
          executionDate: '2026-03-21',
          executionNotes: null,
          actualOutcome: null,
          conclusion: null,
          isExample: true,
          createdAt: '2026-03-21T10:00:00.000Z',
          updatedAt: '2026-03-21T10:00:00.000Z',
        },
      ],
      loading: false,
      refresh: mockRefresh,
    });

    render(<ExperimentListScreen />);

    expect(screen.getByText('Przykład')).toBeTruthy();
    expect(screen.getByText(/nie.*obrażą/i)).toBeTruthy();
  });

  it('shows correct status badges for planned and completed experiments', () => {
    (hooks.useBehavioralExperiments as jest.Mock).mockReturnValue({
      experiments: [
        {
          id: 'p1',
          status: 'planned',
          belief: 'Przekonanie A',
          beliefStrengthBefore: 70,
          beliefStrengthAfter: null,
          alternativeBelief: '',
          plan: '',
          predictedOutcome: '',
          executionDate: null,
          executionNotes: null,
          actualOutcome: null,
          conclusion: null,
          isExample: false,
          createdAt: '2026-03-21T09:00:00.000Z',
          updatedAt: '2026-03-21T09:00:00.000Z',
        },
        {
          id: 'c1',
          status: 'completed',
          belief: 'Przekonanie B',
          beliefStrengthBefore: 60,
          beliefStrengthAfter: 15,
          alternativeBelief: '',
          plan: '',
          predictedOutcome: '',
          executionDate: '2026-03-20',
          executionNotes: null,
          actualOutcome: null,
          conclusion: null,
          isExample: false,
          createdAt: '2026-03-20T09:00:00.000Z',
          updatedAt: '2026-03-20T09:00:00.000Z',
        },
      ],
      loading: false,
      refresh: mockRefresh,
    });

    render(<ExperimentListScreen />);

    expect(screen.getByText('Zaplanowany')).toBeTruthy();
    expect(screen.getByText('Ukończony')).toBeTruthy();
  });

  it('filters experiments by search query', () => {
    (hooks.useBehavioralExperiments as jest.Mock).mockReturnValue({
      experiments: [
        {
          id: 'e1',
          status: 'planned',
          belief: 'Nikt mnie nie lubi',
          beliefStrengthBefore: 70,
          beliefStrengthAfter: null,
          alternativeBelief: '',
          plan: '',
          predictedOutcome: '',
          executionDate: null,
          executionNotes: null,
          actualOutcome: null,
          conclusion: null,
          isExample: false,
          createdAt: '2026-03-21T10:00:00.000Z',
          updatedAt: '2026-03-21T10:00:00.000Z',
        },
        {
          id: 'e2',
          status: 'planned',
          belief: 'Zawsze ponoszę porażkę',
          beliefStrengthBefore: 80,
          beliefStrengthAfter: null,
          alternativeBelief: '',
          plan: '',
          predictedOutcome: '',
          executionDate: null,
          executionNotes: null,
          actualOutcome: null,
          conclusion: null,
          isExample: false,
          createdAt: '2026-03-20T10:00:00.000Z',
          updatedAt: '2026-03-20T10:00:00.000Z',
        },
      ],
      loading: false,
      refresh: mockRefresh,
    });

    render(<ExperimentListScreen />);
    const searchInput = screen.getByPlaceholderText(/szukaj/i);
    fireEvent.changeText(searchInput, 'nikt');
    expect(screen.getByText('Nikt mnie nie lubi')).toBeTruthy();
    expect(screen.queryByText('Zawsze ponoszę porażkę')).toBeNull();
  });

  it('navigates to new experiment on FAB press', () => {
    const { router } = require('expo-router');
    (hooks.useBehavioralExperiments as jest.Mock).mockReturnValue({
      experiments: [],
      loading: false,
      refresh: mockRefresh,
    });

    render(<ExperimentListScreen />);
    fireEvent.press(screen.getByText('+'));
    expect(router.push).toHaveBeenCalledWith('/(tools)/behavioral-experiment/new');
  });

  it('shows no-results message when search query matches nothing', () => {
    (hooks.useBehavioralExperiments as jest.Mock).mockReturnValue({
      experiments: [
        {
          id: 'e1',
          status: 'planned',
          belief: 'Nikt mnie nie lubi',
          beliefStrengthBefore: 70,
          beliefStrengthAfter: null,
          alternativeBelief: '',
          plan: '',
          predictedOutcome: '',
          executionDate: null,
          executionNotes: null,
          actualOutcome: null,
          conclusion: null,
          isExample: false,
          createdAt: '2026-03-21T10:00:00.000Z',
          updatedAt: '2026-03-21T10:00:00.000Z',
        },
      ],
      loading: false,
      refresh: mockRefresh,
    });

    render(<ExperimentListScreen />);
    const searchInput = screen.getByPlaceholderText(/szukaj/i);
    fireEvent.changeText(searchInput, 'xyzabc');
    expect(screen.getByText(/Brak wyników dla/)).toBeTruthy();
  });

  it('navigates to experiment detail on card press', () => {
    const { router } = require('expo-router');
    (hooks.useBehavioralExperiments as jest.Mock).mockReturnValue({
      experiments: [
        {
          id: 'exp-nav',
          status: 'planned',
          belief: 'Test belief',
          beliefStrengthBefore: 50,
          beliefStrengthAfter: null,
          alternativeBelief: '',
          plan: '',
          predictedOutcome: '',
          executionDate: null,
          executionNotes: null,
          actualOutcome: null,
          conclusion: null,
          isExample: false,
          createdAt: '2026-03-21T10:00:00.000Z',
          updatedAt: '2026-03-21T10:00:00.000Z',
        },
      ],
      loading: false,
      refresh: mockRefresh,
    });

    render(<ExperimentListScreen />);
    fireEvent.press(screen.getByText('Test belief'));
    expect(router.push).toHaveBeenCalledWith('/(tools)/behavioral-experiment/exp-nav');
  });
});
