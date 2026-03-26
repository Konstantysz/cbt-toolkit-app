jest.mock('expo-sqlite');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), navigate: jest.fn() },
}));
jest.mock('../repository');

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import * as SQLite from 'expo-sqlite';
import * as repo from '../repository';
import { NewAbcFlow } from '../screens/NewAbcFlow';
import type { AbcEntry } from '../types';

const mockDb = {} as SQLite.SQLiteDatabase;

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => mockDb,
}));

const baseEntry: AbcEntry = {
  id: 'new-id',
  situation: '', thoughts: '', behaviors: '', emotions: '',
  physicalSymptoms: '', isComplete: false, isExample: false,
  currentStep: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

describe('NewAbcFlow — new mode', () => {
  it('creates entry on mount and shows step 1', async () => {
    (repo.createEntry as jest.Mock).mockResolvedValue(baseEntry);

    const { getByText } = render(<NewAbcFlow />);

    await act(async () => {});

    expect(repo.createEntry).toHaveBeenCalledWith(mockDb);
    expect(getByText('Co się wydarzyło?')).toBeTruthy();
  });

  it('auto-saves and advances to step 2 on Next press', async () => {
    (repo.createEntry as jest.Mock).mockResolvedValue(baseEntry);
    (repo.updateEntry as jest.Mock).mockResolvedValue(undefined);

    const { getByText } = render(<NewAbcFlow />);
    await act(async () => {});

    await act(async () => {
      fireEvent.press(getByText('Dalej'));
    });

    expect(repo.updateEntry).toHaveBeenCalledWith(
      mockDb, 'new-id',
      expect.objectContaining({ isComplete: false, currentStep: 1 })
    );
    expect(getByText('Co zrobiłeś?')).toBeTruthy();
  });

  it('marks complete on Save press', async () => {
    (repo.createEntry as jest.Mock).mockResolvedValue(baseEntry);
    (repo.updateEntry as jest.Mock).mockResolvedValue(undefined);

    const { getByText } = render(<NewAbcFlow />);
    await act(async () => {});

    // advance to step 2
    await act(async () => { fireEvent.press(getByText('Dalej')); });

    await act(async () => { fireEvent.press(getByText('Zapisz')); });

    expect(repo.updateEntry).toHaveBeenLastCalledWith(
      mockDb, 'new-id',
      expect.objectContaining({ isComplete: true, currentStep: 2 })
    );
  });
});

describe('NewAbcFlow — edit mode', () => {
  it('loads existing entry data when existingId provided', async () => {
    const existing: AbcEntry = {
      ...baseEntry,
      id: 'edit-id',
      situation: 'Istniejąca sytuacja',
      currentStep: 2,
      isComplete: true,
    };
    (repo.getEntryById as jest.Mock).mockResolvedValue(existing);

    const { getByDisplayValue } = render(<NewAbcFlow existingId="edit-id" />);
    await act(async () => {});

    expect(getByDisplayValue('Istniejąca sytuacja')).toBeTruthy();
  });
});
