import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { RecordListScreen } from '../screens/RecordListScreen';

jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => ({}) }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue('1'),
  setItem: jest.fn(),
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: jest.fn((cb: () => void) => cb()),
}));
jest.mock('../repository', () => ({
  insertSeedRecord: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../hooks/useThoughtRecords');
import { useFocusEffect } from 'expo-router';
import * as hooks from '../hooks/useThoughtRecords';

const mockRefresh = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('RecordListScreen', () => {
  it('calls refresh via useFocusEffect when screen gains focus', () => {
    (hooks.useThoughtRecords as jest.Mock).mockReturnValue({
      records: [],
      loading: false,
      refresh: mockRefresh,
    });

    render(<RecordListScreen />);

    expect(useFocusEffect).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('shows empty state when no records', () => {
    (hooks.useThoughtRecords as jest.Mock).mockReturnValue({
      records: [],
      loading: false,
      refresh: mockRefresh,
    });

    render(<RecordListScreen />);

    expect(screen.getByText('Brak wpisów')).toBeTruthy();
  });

  it('navigates to new record on FAB press', () => {
    const { router } = require('expo-router');
    (hooks.useThoughtRecords as jest.Mock).mockReturnValue({
      records: [],
      loading: false,
      refresh: mockRefresh,
    });

    render(<RecordListScreen />);
    fireEvent.press(screen.getByText('+'));
    expect(router.push).toHaveBeenCalledWith('/(tools)/thought-record/new');
  });

  it('runs seed when getItem returns null (first launch)', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const { insertSeedRecord } = require('../repository');
    (hooks.useThoughtRecords as jest.Mock).mockReturnValue({
      records: [],
      loading: false,
      refresh: mockRefresh,
    });

    render(<RecordListScreen />);
    await act(async () => {});

    expect(insertSeedRecord).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('thought-record:onboarding-seeded', '1');
  });

  it('navigates to record detail on card press', () => {
    const { router } = require('expo-router');
    (hooks.useThoughtRecords as jest.Mock).mockReturnValue({
      records: [
        {
          id: 'rec-nav',
          situation: 'Spotkanie z szefem',
          situationDate: '2026-01-01',
          emotions: [],
          automaticThoughts: '',
          evidenceFor: '',
          evidenceAgainst: '',
          alternativeThought: '',
          outcome: null,
          isComplete: true,
          isExample: false,
          currentStep: 7,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      loading: false,
      refresh: mockRefresh,
    });

    render(<RecordListScreen />);
    fireEvent.press(screen.getByText('Spotkanie z szefem'));
    expect(router.push).toHaveBeenCalledWith('/(tools)/thought-record/rec-nav');
  });
});
