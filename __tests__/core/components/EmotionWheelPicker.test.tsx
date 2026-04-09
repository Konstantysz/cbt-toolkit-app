import React from 'react';
import { act, render, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmotionWheelPicker } from '../../../src/core/components/EmotionWheelPicker';
import { feelingsWheel } from '../../../src/core/data/feelingsWheel';
import type { Emotion } from '../../../src/tools/thought-record/types';

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
});

describe('EmotionWheelPicker', () => {
  const onChange = jest.fn();
  const noEmotions: Emotion[] = [];

  beforeEach(() => onChange.mockClear());

  it('renders top-level emotion labels', async () => {
    const { getByText } = render(<EmotionWheelPicker selected={noEmotions} onChange={onChange} />);
    await act(async () => {});
    feelingsWheel
      .filter((n) => n.level === 1)
      .forEach((n) => expect(getByText(n.label)).toBeTruthy());
  });

  it('calls onChange with new emotion when "Dodaj" button is pressed', async () => {
    const { getByText } = render(<EmotionWheelPicker selected={noEmotions} onChange={onChange} />);
    await act(async () => {});
    fireEvent.press(getByText('Lęk'));
    fireEvent.press(getByText('Dodaj Lęk'));
    expect(onChange).toHaveBeenCalledWith([{ name: 'Lęk', intensityBefore: 50 }]);
  });

  it('removes emotion when "Dodaj" button is pressed for already selected emotion', async () => {
    const selected: Emotion[] = [{ name: 'Lęk', intensityBefore: 70 }];
    const { getByText } = render(<EmotionWheelPicker selected={selected} onChange={onChange} />);
    await act(async () => {});
    fireEvent.press(getByText('Lęk'));
    fireEvent.press(getByText('Dodaj Lęk'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
