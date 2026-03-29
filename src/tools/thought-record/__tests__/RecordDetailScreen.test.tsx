import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { RecordDetailScreen } from '../screens/RecordDetailScreen';

jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => ({}) }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('../repository');
jest.mock('../hooks/useThoughtRecords');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));
jest.mock('date-fns/locale', () => ({ pl: {} }));
jest.mock('date-fns', () => ({
  format: (_date: unknown, _fmt: string) => '1 stycznia 2026',
  parseISO: (s: string) => new Date(s),
}));

import * as hooks from '../hooks/useThoughtRecords';

beforeEach(() => jest.clearAllMocks());

describe('RecordDetailScreen', () => {
  it('shows loading indicator when loading', () => {
    (hooks.useThoughtRecord as jest.Mock).mockReturnValue({ record: null, loading: true });
    const { UNSAFE_getByType } = render(<RecordDetailScreen id="rec-1" />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('shows error message when record not found', () => {
    (hooks.useThoughtRecord as jest.Mock).mockReturnValue({ record: null, loading: false });
    render(<RecordDetailScreen id="missing" />);
    expect(screen.getByText('Nie znaleziono wpisu.')).toBeTruthy();
  });

  it('renders record with emotions (EmotionRow and IntensityBar)', () => {
    const record = {
      id: 'rec-1',
      situation: 'Spotkanie z szefem',
      situationDate: '2026-01-01',
      automaticThoughts: 'Zawsze coś pójdzie nie tak',
      evidenceFor: 'Brak',
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
    (hooks.useThoughtRecord as jest.Mock).mockReturnValue({ record, loading: false });
    render(<RecordDetailScreen id="rec-1" />);
    expect(screen.getByText('Lęk')).toBeTruthy();
    expect(screen.getByText('Spotkanie z szefem')).toBeTruthy();
  });

  it('renders incomplete record with in-progress badge', () => {
    const record = {
      id: 'rec-2',
      situation: 'Test',
      situationDate: null,
      automaticThoughts: '',
      evidenceFor: '',
      evidenceAgainst: '',
      alternativeThought: '',
      outcome: null,
      emotions: [],
      isComplete: false,
      isExample: false,
      currentStep: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    (hooks.useThoughtRecord as jest.Mock).mockReturnValue({ record, loading: false });
    render(<RecordDetailScreen id="rec-2" />);
    expect(screen.getByText('W toku')).toBeTruthy();
  });
});
