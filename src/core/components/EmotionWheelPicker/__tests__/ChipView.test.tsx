import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChipView } from '../ChipView';
import { feelingsWheel } from '../../../data/feelingsWheel';
import type { Emotion } from '../../../types';

const mockOnChange = jest.fn();
const emptySelected: Emotion[] = [];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ChipView', () => {
  it('renders all 6 root category chips', () => {
    const { getByText } = render(
      <ChipView nodes={feelingsWheel} selected={emptySelected} onChange={mockOnChange} />
    );
    expect(getByText('Złość')).toBeTruthy();
    expect(getByText('Smutek')).toBeTruthy();
    expect(getByText('Lęk')).toBeTruthy();
    expect(getByText('Radość')).toBeTruthy();
    expect(getByText('Siła')).toBeTruthy();
    expect(getByText('Spokój')).toBeTruthy();
  });

  it('tapping a root chip expands its level-2 children', () => {
    const { getByText, queryByText } = render(
      <ChipView nodes={feelingsWheel} selected={emptySelected} onChange={mockOnChange} />
    );
    expect(queryByText('Wrogi')).toBeNull();
    fireEvent.press(getByText('Złość'));
    expect(getByText('Wrogi')).toBeTruthy();
    expect(getByText('Drażliwy')).toBeTruthy();
  });

  it('tapping an expanded root chip collapses it', () => {
    const { getByText, queryByText } = render(
      <ChipView nodes={feelingsWheel} selected={emptySelected} onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Złość'));
    expect(getByText('Wrogi')).toBeTruthy();
    fireEvent.press(getByText('Złość'));
    expect(queryByText('Wrogi')).toBeNull();
  });

  it('"Dodaj Złość" button at level-1 calls onChange with that emotion', () => {
    const { getByText } = render(
      <ChipView nodes={feelingsWheel} selected={emptySelected} onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Złość'));
    fireEvent.press(getByText('Dodaj Złość'));
    expect(mockOnChange).toHaveBeenCalledWith([{ name: 'Złość', intensityBefore: 50 }]);
  });

  it('tapping level-2 chip expands its level-3 children', () => {
    const { getByText, queryByText } = render(
      <ChipView nodes={feelingsWheel} selected={emptySelected} onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Złość'));
    expect(queryByText('Wściekły')).toBeNull();
    fireEvent.press(getByText('Wrogi'));
    expect(getByText('Wściekły')).toBeTruthy();
  });

  it('"Dodaj Wrogi" button at level-2 calls onChange with that emotion', () => {
    const { getByText } = render(
      <ChipView nodes={feelingsWheel} selected={emptySelected} onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Złość'));
    fireEvent.press(getByText('Wrogi'));
    fireEvent.press(getByText('Dodaj Wrogi'));
    expect(mockOnChange).toHaveBeenCalledWith([{ name: 'Wrogi', intensityBefore: 50 }]);
  });

  it('tapping a leaf (level-3) chip calls onChange immediately', () => {
    const { getByText } = render(
      <ChipView nodes={feelingsWheel} selected={emptySelected} onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Złość'));
    fireEvent.press(getByText('Wrogi'));
    fireEvent.press(getByText('Wściekły'));
    expect(mockOnChange).toHaveBeenCalledWith([{ name: 'Wściekły', intensityBefore: 50 }]);
  });

  it('tapping already-selected leaf removes it from selection', () => {
    const selected: Emotion[] = [{ name: 'Wściekły', intensityBefore: 70 }];
    const { getByText } = render(
      <ChipView nodes={feelingsWheel} selected={selected} onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Złość'));
    fireEvent.press(getByText('Wrogi'));
    fireEvent.press(getByText('Wściekły'));
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
