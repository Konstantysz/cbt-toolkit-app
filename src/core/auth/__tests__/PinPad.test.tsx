jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PinPad } from '../components/PinPad';

describe('PinPad', () => {
  it('renders label', () => {
    const { getByText } = render(<PinPad value="" onChange={jest.fn()} label="Wprowadź kod PIN" />);
    expect(getByText('Wprowadź kod PIN')).toBeTruthy();
  });

  it('renders error when provided', () => {
    const { getByText } = render(<PinPad value="" onChange={jest.fn()} label="PIN" error="Błąd" />);
    expect(getByText('Błąd')).toBeTruthy();
  });

  it('calls onChange with digit appended when key pressed', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<PinPad value="12" onChange={onChange} label="PIN" />);
    fireEvent.press(getByLabelText('3'));
    expect(onChange).toHaveBeenCalledWith('123');
  });

  it('does not add digit beyond PIN_LENGTH (4)', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<PinPad value="1234" onChange={onChange} label="PIN" />);
    fireEvent.press(getByLabelText('5'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange with last char removed on backspace', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<PinPad value="123" onChange={onChange} label="PIN" />);
    fireEvent.press(getByLabelText('usuń'));
    expect(onChange).toHaveBeenCalledWith('12');
  });
});
