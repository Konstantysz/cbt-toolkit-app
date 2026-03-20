import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IntensitySlider } from '../../../src/core/components/IntensitySlider';

describe('IntensitySlider', () => {
  it('displays the current value', () => {
    const { getByText } = render(
      <IntensitySlider value={65} onChange={jest.fn()} label="Lęk" />
    );
    expect(getByText('65%')).toBeTruthy();
    expect(getByText('Lęk')).toBeTruthy();
  });

  it('calls onChange when slider value changes', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <IntensitySlider value={50} onChange={onChange} />
    );
    fireEvent(getByTestId('intensity-slider'), 'valueChange', 80);
    expect(onChange).toHaveBeenCalledWith(80);
  });
});
