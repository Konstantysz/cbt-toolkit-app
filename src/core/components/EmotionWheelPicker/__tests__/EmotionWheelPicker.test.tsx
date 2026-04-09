import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmotionWheelPicker } from '../EmotionWheelPicker';

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
});

describe('EmotionWheelPicker', () => {
  it('renders in chip mode by default (shows root category chips)', async () => {
    const { getByText } = render(<EmotionWheelPicker selected={[]} onChange={jest.fn()} />);
    await act(async () => {});
    expect(getByText('Złość')).toBeTruthy();
    expect(getByText('Radość')).toBeTruthy();
  });

  it('calls onChange when an emotion is selected via chip accordion', async () => {
    const onChange = jest.fn();
    const { getByText } = render(<EmotionWheelPicker selected={[]} onChange={onChange} />);
    await act(async () => {});
    fireEvent.press(getByText('Złość'));
    fireEvent.press(getByText('Dodaj Złość'));
    expect(onChange).toHaveBeenCalledWith([{ name: 'Złość', intensityBefore: 50 }]);
  });

  it('calls onChange when an emotion is removed', async () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <EmotionWheelPicker selected={[{ name: 'Złość', intensityBefore: 50 }]} onChange={onChange} />
    );
    await act(async () => {});
    fireEvent.press(getByText('Złość'));
    fireEvent.press(getByText('Dodaj Złość'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('renders in wheel mode when AsyncStorage returns wheel', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('wheel');
    const { queryByText } = render(<EmotionWheelPicker selected={[]} onChange={jest.fn()} />);
    await act(async () => {});
    // In wheel mode, chip "Dodaj Złość" buttons are absent
    expect(queryByText('Dodaj Złość')).toBeNull();
  });

  it('smoke test: renders without crash in both modes', async () => {
    const { rerender } = render(<EmotionWheelPicker selected={[]} onChange={jest.fn()} />);
    await act(async () => {});
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('wheel');
    rerender(<EmotionWheelPicker selected={[]} onChange={jest.fn()} />);
    await act(async () => {});
  });
});
