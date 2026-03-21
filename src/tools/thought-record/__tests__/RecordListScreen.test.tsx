import React from 'react';
import { render, screen } from '@testing-library/react-native';
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
});
