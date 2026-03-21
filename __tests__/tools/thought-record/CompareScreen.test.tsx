import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CompareScreen } from '../../../src/tools/thought-record/screens/CompareScreen';
import type { ThoughtRecord } from '../../../src/tools/thought-record/types';

jest.mock('../../../src/tools/thought-record/hooks/useThoughtRecords', () => ({
  useThoughtRecord: jest.fn(),
}));
jest.mock('expo-sqlite', () => ({ useSQLiteContext: jest.fn(() => ({})) }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

import { useThoughtRecord } from '../../../src/tools/thought-record/hooks/useThoughtRecords';
const mockHook = useThoughtRecord as jest.Mock;

const record: ThoughtRecord = {
  id: 'abc',
  situation: 'Test situation text',
  situationDate: null,
  emotions: [{ name: 'Złość', intensityBefore: 75, intensityAfter: 40 }],
  automaticThoughts: 'Test thought',
  evidenceFor: 'Evidence for',
  evidenceAgainst: 'Evidence against',
  alternativeThought: 'Alternative thought',
  outcome: 'Outcome text',
  isComplete: true,
  isExample: false,
  currentStep: 7,
  createdAt: '2026-03-21T09:00:00.000Z',
  updatedAt: '2026-03-21T09:00:00.000Z',
};

describe('CompareScreen', () => {
  beforeEach(() => {
    mockHook.mockReturnValue({ record, loading: false });
  });

  it('shows page 1 label on mount', () => {
    const { getByText } = render(<CompareScreen id="abc" />);
    expect(getByText('Sytuacja + Emocje')).toBeTruthy();
  });

  it('shows situation text on page 1', () => {
    const { getByText } = render(<CompareScreen id="abc" />);
    expect(getByText('Test situation text')).toBeTruthy();
  });

  it('advances to page 2 when › is pressed', () => {
    const { getByText } = render(<CompareScreen id="abc" />);
    fireEvent.press(getByText('›'));
    expect(getByText('Emocje + Myśli automatyczne')).toBeTruthy();
  });

  it('goes back to page 1 when ‹ is pressed from page 2', () => {
    const { getByText } = render(<CompareScreen id="abc" />);
    fireEvent.press(getByText('›'));
    fireEvent.press(getByText('‹'));
    expect(getByText('Sytuacja + Emocje')).toBeTruthy();
  });

  it('shows page 3 label correctly', () => {
    const { getByText } = render(<CompareScreen id="abc" />);
    fireEvent.press(getByText('›'));
    fireEvent.press(getByText('›'));
    expect(getByText('Myśli + Argumenty za i przeciw')).toBeTruthy();
  });
});
