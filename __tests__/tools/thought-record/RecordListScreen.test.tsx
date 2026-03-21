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
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('../../../src/tools/thought-record/repository', () => ({
  insertSeedRecord: jest.fn(() => Promise.resolve()),
}));

import { useThoughtRecords } from '../../../src/tools/thought-record/hooks/useThoughtRecords';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as repo from '../../../src/tools/thought-record/repository';

const mockUseThoughtRecords = useThoughtRecords as jest.Mock;
const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockInsertSeed = repo.insertSeedRecord as jest.Mock;

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
    mockGetItem.mockResolvedValue('1'); // already seeded — skip onboarding
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

  it('inserts seed record when list is empty and flag is not set', async () => {
    mockUseThoughtRecords.mockReturnValue({ records: [], loading: false, refresh: jest.fn() });
    mockGetItem.mockResolvedValue(null); // not yet seeded

    render(<RecordListScreen />);

    await waitFor(() => expect(mockInsertSeed).toHaveBeenCalled());
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('thought-record:onboarding-seeded', '1');
  });

  it('skips seed insertion when flag is already set', async () => {
    mockUseThoughtRecords.mockReturnValue({ records: [], loading: false, refresh: jest.fn() });
    mockGetItem.mockResolvedValue('1'); // already seeded

    render(<RecordListScreen />);

    await waitFor(() => expect(mockGetItem).toHaveBeenCalled());
    expect(mockInsertSeed).not.toHaveBeenCalled();
  });

  it('skips seed insertion when records already exist', async () => {
    mockUseThoughtRecords.mockReturnValue({ records, loading: false, refresh: jest.fn() });
    mockGetItem.mockResolvedValue(null);

    render(<RecordListScreen />);

    await new Promise(r => setTimeout(r, 50));
    expect(mockInsertSeed).not.toHaveBeenCalled();
  });
});
