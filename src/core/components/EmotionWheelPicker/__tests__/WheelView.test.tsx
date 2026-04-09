import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WheelView } from '../WheelView';
import { feelingsWheel } from '../../../data/feelingsWheel';
import type { Emotion } from '../../../types';

jest.mock('../../../../core/theme/useColors', () => ({
  useColors: () => ({
    bg: '#000',
    text: '#fff',
    border: '#333',
    surface: '#111',
    accent: '#0a84ff',
    accentDim: '#0a84ff33',
    textMuted: '#aaa',
  }),
}));

// react-native-svg is automatically mocked by the project's __mocks__/react-native-svg.js

describe('WheelView', () => {
  const mockOnChange = jest.fn();
  const emptySelected: Emotion[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all 6 root categories', () => {
    const { getByLabelText } = render(
      <WheelView nodes={feelingsWheel} selected={emptySelected} onChange={mockOnChange} />
    );
    // root labels
    expect(getByLabelText('Złość')).toBeTruthy();
    expect(getByLabelText('Smutek')).toBeTruthy();
    expect(getByLabelText('Lęk')).toBeTruthy();
    expect(getByLabelText('Radość')).toBeTruthy();
    expect(getByLabelText('Siła')).toBeTruthy();
    expect(getByLabelText('Spokój')).toBeTruthy();
  });

  it('calls onChange with new emotion when an SVG Path is pressed', () => {
    const { getByLabelText } = render(
      <WheelView nodes={feelingsWheel} selected={emptySelected} onChange={mockOnChange} />
    );

    // Tap the Radość root Path (which has accessibilityLabel='Radość')
    fireEvent.press(getByLabelText('Radość'));
    expect(mockOnChange).toHaveBeenCalledWith([{ name: 'Radość', intensityBefore: 50 }]);

    // Tap L3 emotion: Podekscytowany -> Zachwycony (has accessibilityLabel)
    fireEvent.press(getByLabelText('Zachwycony'));
    expect(mockOnChange).toHaveBeenCalledWith([{ name: 'Zachwycony', intensityBefore: 50 }]);
  });

  it('removes emotion when an already selected emotion SVG Path is pressed', () => {
    const selected: Emotion[] = [{ name: 'Radość', intensityBefore: 70 }];
    const { getByLabelText } = render(
      <WheelView nodes={feelingsWheel} selected={selected} onChange={mockOnChange} />
    );

    fireEvent.press(getByLabelText('Radość'));
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('shows tooltip of the newly selected emotion', () => {
    const { getByLabelText, queryByText } = render(
      <WheelView nodes={feelingsWheel} selected={emptySelected} onChange={mockOnChange} />
    );

    // Let's just check if we can press and see the tooltip text container.
    // The tooltip renders an additional <Text> with the label and its color.
    fireEvent.press(getByLabelText('Smutek'));

    // Now there should be 'Smutek' in tooltip
    const elements = queryByText('Smutek');
    expect(elements).toBeTruthy();
  });
});
