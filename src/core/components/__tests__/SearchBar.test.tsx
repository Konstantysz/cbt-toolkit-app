import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('renders with default placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={jest.fn()} placeholder="Szukaj..." />
    );
    expect(getByPlaceholderText('Szukaj...')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={onChangeText} placeholder="Szukaj..." />
    );
    fireEvent.changeText(getByPlaceholderText('Szukaj...'), 'test query');
    expect(onChangeText).toHaveBeenCalledWith('test query');
  });

  it('displays the current value', () => {
    const { getByDisplayValue } = render(
      <SearchBar value="abc" onChangeText={jest.fn()} placeholder="Szukaj..." />
    );
    expect(getByDisplayValue('abc')).toBeTruthy();
  });
});
