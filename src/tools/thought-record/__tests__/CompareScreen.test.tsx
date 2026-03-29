import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { CompareScreen } from '../screens/CompareScreen';

jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => ({}) }));
jest.mock('../hooks/useThoughtRecords');

import * as hooks from '../hooks/useThoughtRecords';

const mockRecord = {
  id: 'rec-1',
  situation: 'Spotkanie z szefem',
  situationDate: '2026-01-01',
  automaticThoughts: 'Zawsze coś pójdzie nie tak',
  evidenceFor: 'Miałem złe oceny',
  evidenceAgainst: 'Wiele sukcesów',
  alternativeThought: 'Daję radę',
  outcome: 'Lepiej',
  emotions: [{ name: 'Lęk', intensityBefore: 70, intensityAfter: 30 }],
  isComplete: true,
  isExample: false,
  currentStep: 7,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

describe('CompareScreen', () => {
  it('shows loading indicator when loading', () => {
    (hooks.useThoughtRecord as jest.Mock).mockReturnValue({ record: null, loading: true });
    const { UNSAFE_getByType } = render(<CompareScreen id="rec-1" />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('shows error message when record not found', () => {
    (hooks.useThoughtRecord as jest.Mock).mockReturnValue({ record: null, loading: false });
    render(<CompareScreen id="missing" />);
    expect(screen.getByText('Nie znaleziono wpisu.')).toBeTruthy();
  });

  it('renders page 1 with situation', () => {
    (hooks.useThoughtRecord as jest.Mock).mockReturnValue({ record: mockRecord, loading: false });
    render(<CompareScreen id="rec-1" />);
    expect(screen.getByText('Spotkanie z szefem')).toBeTruthy();
  });

  it('navigates to page 4 showing alternativeThought in RightColumn', () => {
    (hooks.useThoughtRecord as jest.Mock).mockReturnValue({ record: mockRecord, loading: false });
    render(<CompareScreen id="rec-1" />);

    // Press next 3 times to get to page 4 (index 3)
    const nextBtn = screen.getByText('›');
    fireEvent.press(nextBtn);
    fireEvent.press(nextBtn);
    fireEvent.press(nextBtn);

    expect(screen.getByText('Daję radę')).toBeTruthy();
    expect(screen.getByText('Argumenty za')).toBeTruthy();
  });
});
