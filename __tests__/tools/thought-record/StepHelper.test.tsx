import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StepHelper } from '../../../src/tools/thought-record/components/StepHelper';

describe('StepHelper', () => {
  const hint = 'np. Przykładowy tekst wskazówki';

  it('does not show hint text by default', () => {
    const { queryByText } = render(<StepHelper hint={hint} />);
    expect(queryByText(hint)).toBeNull();
  });

  it('shows hint text after pressing toggle button', () => {
    const { getByText } = render(<StepHelper hint={hint} />);
    fireEvent.press(getByText('Wskazówka'));
    expect(getByText(hint)).toBeTruthy();
  });

  it('shows "Przykład" label when open', () => {
    const { getByText } = render(<StepHelper hint={hint} />);
    fireEvent.press(getByText('Wskazówka'));
    expect(getByText('Przykład')).toBeTruthy();
  });

  it('hides hint text after pressing toggle button twice', () => {
    const { getByText, queryByText } = render(<StepHelper hint={hint} />);
    fireEvent.press(getByText('Wskazówka'));
    fireEvent.press(getByText('Wskazówka'));
    expect(queryByText(hint)).toBeNull();
  });
});
