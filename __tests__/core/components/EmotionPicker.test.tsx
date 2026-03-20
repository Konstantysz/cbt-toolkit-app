import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmotionPicker, PREDEFINED_EMOTIONS } from '../../../src/core/components/EmotionPicker';
import type { Emotion } from '../../../src/tools/thought-record/types';

describe('EmotionPicker', () => {
  const onChange = jest.fn();
  const noEmotions: Emotion[] = [];

  beforeEach(() => onChange.mockClear());

  it('renders all predefined emotions', () => {
    const { getByText } = render(
      <EmotionPicker selected={noEmotions} onChange={onChange} />
    );
    PREDEFINED_EMOTIONS.forEach(e => expect(getByText(e.label)).toBeTruthy());
  });

  it('calls onChange with new emotion when unselected chip is pressed', () => {
    const { getByText } = render(
      <EmotionPicker selected={noEmotions} onChange={onChange} />
    );
    fireEvent.press(getByText('Lęk'));
    expect(onChange).toHaveBeenCalledWith([
      { name: 'Lęk', intensityBefore: 50 },
    ]);
  });

  it('removes emotion when selected chip is pressed again', () => {
    const selected: Emotion[] = [{ name: 'Lęk', intensityBefore: 70 }];
    const { getByText } = render(
      <EmotionPicker selected={selected} onChange={onChange} />
    );
    fireEvent.press(getByText('Lęk'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
