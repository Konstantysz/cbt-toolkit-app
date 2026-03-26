import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StepHelper } from '../../../src/core/components/StepHelper';

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

  it('shows chevron-down icon when collapsed and chevron-up when expanded', () => {
    const { getByTestId, getByText } = render(<StepHelper hint={hint} />);
    expect(getByTestId('step-helper-chevron').props.name).toBe('chevron-down');
    fireEvent.press(getByText('Wskazówka'));
    expect(getByTestId('step-helper-chevron').props.name).toBe('chevron-up');
  });

  it('hides hint text after pressing toggle button twice', () => {
    const { getByText, queryByText } = render(<StepHelper hint={hint} />);
    fireEvent.press(getByText('Wskazówka'));
    fireEvent.press(getByText('Wskazówka'));
    expect(queryByText(hint)).toBeNull();
  });
});
