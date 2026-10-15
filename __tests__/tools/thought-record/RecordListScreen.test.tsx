import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RecordListScreen } from '../../../src/tools/thought-record/screens/RecordListScreen';

jest.mock('expo-sqlite', () => ({ useSQLiteContext: jest.fn(() => ({})) }));
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: jest.fn((cb: () => void) => cb()),
}));
jest.mock('../../../src/tools/thought-record/hooks/useThoughtRecords', () => ({
  useThoughtRecords: jest.fn(),
}));
jest.mock('../../../src/tools/thought-record/repository', () => ({
  insertSeedRecord: jest.fn(() => Promise.resolve()),
}));
jest.mock('../../../src/core/db/seedOnce', () => ({
  seedOnce: jest.fn(() => Promise.resolve(false)),
}));

import { useThoughtRecords } from '../../../src/tools/thought-record/hooks/useThoughtRecords';
import { seedOnce } from '../../../src/core/db/seedOnce';

const mockUseThoughtRecords = useThoughtRecords as jest.Mock;
const mockSeedOnce = seedOnce as jest.Mock;

const records = [
  {
    id: '1', situation: 'Kłótnia z partnerem', emotions: [{ name: 'Złość', intensityBefore: 70 }],
    situationDate: null, automaticThoughts: '', evidenceFor: '', evidenceAgainst: '',
    alternativeThought: '', outcome: null, isComplete: true, isExample: false,
    currentStep: 7, createdAt: '2026-03-18T21:14:00.000Z', updatedAt: '2026-03-18T21:14:00.000Z',
  },
  {
    id: '2', situation: 'Spotkanie z szefem', emotions: [{ name: 'Lęk', intensityBefore: 80 }],
    situationDate: null, automaticThoughts: '', evidenceFor: '', evidenceAgainst: '',
    alternativeThought: '', outcome: null, isComplete: true, isExample: false,
    currentStep: 7, createdAt: '2026-03-15T14:32:00.000Z', updatedAt: '2026-03-15T14:32:00.000Z',
  },
];

describe('RecordListScreen — search', () => {
  beforeEach(() => {
    mockUseThoughtRecords.mockReturnValue({ records, loading: false, refresh: jest.fn() });
  });

  it('renders all records when query is empty', () => {
    const { getByText } = render(<RecordListScreen />);
    expect(getByText('Kłótnia z partnerem')).toBeTruthy();
    expect(getByText('Spotkanie z szefem')).toBeTruthy();
  });

  it('filters records by situation text', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<RecordListScreen />);
    fireEvent.changeText(getByPlaceholderText('Szukaj wpisów...'), 'Kłótnia');
    expect(getByText('Kłótnia z partnerem')).toBeTruthy();
    expect(queryByText('Spotkanie z szefem')).toBeNull();
  });

  it('filters records by emotion name', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<RecordListScreen />);
    fireEvent.changeText(getByPlaceholderText('Szukaj wpisów...'), 'Lęk');
    expect(getByText('Spotkanie z szefem')).toBeTruthy();
    expect(queryByText('Kłótnia z partnerem')).toBeNull();
  });

  it('uses OR logic — matches either situation or emotion', () => {
    const { getByPlaceholderText, getByText } = render(<RecordListScreen />);
    fireEvent.changeText(getByPlaceholderText('Szukaj wpisów...'), 'szef');
    expect(getByText('Spotkanie z szefem')).toBeTruthy();
  });

  it('shows no-results message when nothing matches', () => {
    const { getByPlaceholderText, getByText } = render(<RecordListScreen />);
    fireEvent.changeText(getByPlaceholderText('Szukaj wpisów...'), 'xyzxyz');
    expect(getByText(/Brak wyników/)).toBeTruthy();
  });
});

describe('RecordListScreen — onboarding seed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('seeds once when the loaded list is empty', async () => {
    mockUseThoughtRecords.mockReturnValue({ records: [], loading: false, refresh: jest.fn() });

    render(<RecordListScreen />);

    await waitFor(() => expect(mockSeedOnce).toHaveBeenCalled());
  });

  it('skips seeding when records already exist', async () => {
    mockUseThoughtRecords.mockReturnValue({ records, loading: false, refresh: jest.fn() });

    render(<RecordListScreen />);

    await new Promise(r => setTimeout(r, 50));
    expect(mockSeedOnce).not.toHaveBeenCalled();
  });
});
