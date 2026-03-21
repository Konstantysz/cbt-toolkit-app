import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NewRecordFlow } from '../../../src/tools/thought-record/screens/NewRecordFlow';

jest.mock('expo-sqlite', () => ({ useSQLiteContext: jest.fn(() => ({})) }));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() } }));
jest.mock('../../../src/tools/thought-record/repository', () => ({
  createRecord: jest.fn(),
  getRecordById: jest.fn(),
  updateRecord: jest.fn(),
  deleteRecord: jest.fn(),
}));

import * as repo from '../../../src/tools/thought-record/repository';

const mockGetRecordById = repo.getRecordById as jest.Mock;
const mockCreateRecord = repo.createRecord as jest.Mock;

describe('NewRecordFlow — edit mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRecordById.mockResolvedValue({
      id: 'existing-id',
      situation: 'Loaded situation',
      situationDate: null,
      emotions: [{ name: 'Lęk', intensityBefore: 70 }],
      automaticThoughts: 'Loaded thoughts',
      evidenceFor: '',
      evidenceAgainst: '',
      alternativeThought: '',
      outcome: null,
      isComplete: false,
      isExample: false,
      currentStep: 3,
      createdAt: '2026-03-21T09:00:00.000Z',
      updatedAt: '2026-03-21T09:00:00.000Z',
    });
  });

  it('does NOT call createRecord when existingId is provided', async () => {
    render(<NewRecordFlow existingId="existing-id" />);
    await waitFor(() => expect(mockGetRecordById).toHaveBeenCalledWith(expect.anything(), 'existing-id'));
    expect(mockCreateRecord).not.toHaveBeenCalled();
  });

  it('shows loading state while fetching existing record', () => {
    // getRecordById never resolves in this test
    mockGetRecordById.mockReturnValue(new Promise(() => {}));
    const { getByTestId } = render(<NewRecordFlow existingId="existing-id" />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('pre-populates situation from existing record', async () => {
    const { findByDisplayValue } = render(<NewRecordFlow existingId="existing-id" />);
    // First step shows situation textarea with loaded text
    const input = await findByDisplayValue('Loaded situation');
    expect(input).toBeTruthy();
  });
});
