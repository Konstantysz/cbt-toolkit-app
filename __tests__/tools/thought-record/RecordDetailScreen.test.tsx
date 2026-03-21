import React from 'react';
import { render } from '@testing-library/react-native';
import { RecordDetailScreen } from '../../../src/tools/thought-record/screens/RecordDetailScreen';
import type { ThoughtRecord } from '../../../src/tools/thought-record/types';

// Mock the hook so we don't need a real SQLite database
jest.mock('../../../src/tools/thought-record/hooks/useThoughtRecords', () => ({
  useThoughtRecord: jest.fn(),
}));

// Mock expo-sqlite context
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: jest.fn(() => ({})),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

import { useThoughtRecord } from '../../../src/tools/thought-record/hooks/useThoughtRecords';
const mockUseThoughtRecord = useThoughtRecord as jest.Mock;

const baseRecord: ThoughtRecord = {
  id: 'test-id',
  situation: 'Test situation',
  situationDate: null,
  emotions: [],
  automaticThoughts: 'Test thoughts',
  evidenceFor: 'For',
  evidenceAgainst: 'Against',
  alternativeThought: 'Alternative',
  outcome: 'Outcome',
  isComplete: true,
  isExample: false,
  currentStep: 7,
  createdAt: '2026-03-21T09:00:00.000Z',
  updatedAt: '2026-03-21T09:00:00.000Z',
};

describe('RecordDetailScreen — emotion bars', () => {
  it('renders ↓ indicator when intensityAfter < intensityBefore', () => {
    mockUseThoughtRecord.mockReturnValue({
      record: {
        ...baseRecord,
        emotions: [{ name: 'Złość', intensityBefore: 75, intensityAfter: 40 }],
      },
      loading: false,
    });

    const { getByText } = render(<RecordDetailScreen id="test-id" />);
    expect(getByText('↓')).toBeTruthy();
  });

  it('does not render ↓ when intensityAfter is undefined', () => {
    mockUseThoughtRecord.mockReturnValue({
      record: {
        ...baseRecord,
        emotions: [{ name: 'Złość', intensityBefore: 75 }],
      },
      loading: false,
    });

    const { queryByText } = render(<RecordDetailScreen id="test-id" />);
    expect(queryByText('↓')).toBeNull();
  });

  it('does not render "po" bar row when intensityAfter is undefined', () => {
    mockUseThoughtRecord.mockReturnValue({
      record: {
        ...baseRecord,
        emotions: [{ name: 'Złość', intensityBefore: 75 }],
      },
      loading: false,
    });

    const { queryByText } = render(<RecordDetailScreen id="test-id" />);
    expect(queryByText('po')).toBeNull();
  });

  it('renders "po" bar row when intensityAfter is defined', () => {
    mockUseThoughtRecord.mockReturnValue({
      record: {
        ...baseRecord,
        emotions: [{ name: 'Złość', intensityBefore: 75, intensityAfter: 40 }],
      },
      loading: false,
    });

    const { getByText } = render(<RecordDetailScreen id="test-id" />);
    expect(getByText('po')).toBeTruthy();
  });
});
