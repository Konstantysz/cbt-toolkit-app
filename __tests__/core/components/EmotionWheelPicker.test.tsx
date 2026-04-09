import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmotionWheelPicker } from '../../../src/core/components/EmotionWheelPicker';
import { feelingsWheel } from '../../../src/core/data/feelingsWheel';
import type { Emotion } from '../../../src/tools/thought-record/types';

describe('EmotionWheelPicker', () => {
  const onChange = jest.fn();
  const noEmotions: Emotion[] = [];

  beforeEach(() => onChange.mockClear());

  it('renders top-level emotion labels', () => {
    const { getByText } = render(
      <EmotionWheelPicker selected={noEmotions} onChange={onChange} />
    );
    feelingsWheel.filter(n => n.level === 1).forEach(n => expect(getByText(n.label)).toBeTruthy());
  });

  it('calls onChange with new emotion when "Dodaj" button is pressed', () => {
    const { getByText } = render(
      <EmotionWheelPicker selected={noEmotions} onChange={onChange} />
    );
    fireEvent.press(getByText('Lęk'));
    fireEvent.press(getByText('Dodaj Lęk'));
    expect(onChange).toHaveBeenCalledWith([
      { name: 'Lęk', intensityBefore: 50 },
    ]);
  });

  it('removes emotion when "Dodaj" button is pressed for already selected emotion', () => {
    const selected: Emotion[] = [{ name: 'Lęk', intensityBefore: 70 }];
    const { getByText } = render(
      <EmotionWheelPicker selected={selected} onChange={onChange} />
    );
    fireEvent.press(getByText('Lęk'));
    fireEvent.press(getByText('Dodaj Lęk'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
