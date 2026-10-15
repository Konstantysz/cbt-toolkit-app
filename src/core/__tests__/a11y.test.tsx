import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { IntensitySlider } from '../components/IntensitySlider';
import { StepHelper } from '../components/StepHelper';
import { StepProgress } from '../components/StepProgress';
import { PinPad } from '../auth/components/PinPad';
import { ChipView } from '../components/EmotionWheelPicker/ChipView';
import { feelingsWheel } from '../data/feelingsWheel';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

describe('screen-reader semantics', () => {
  let announce: jest.SpyInstance;
  beforeEach(() => {
    announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation();
  });

  it('IntensitySlider exposes name and value', () => {
    render(<IntensitySlider label="Lęk" value={40} onChange={jest.fn()} />);
    const slider = screen.getByLabelText('Lęk');
    expect(slider.props.accessibilityValue).toMatchObject({ now: 40, text: '40 procent' });
  });

  it('StepHelper toggle exposes expanded state', () => {
    render(<StepHelper hint="x" toggleLabel="Wskazówka" />);
    const btn = screen.getByRole('button', { name: 'Wskazówka' });
    expect(btn.props.accessibilityState.expanded).toBe(false);
    fireEvent.press(btn);
    expect(screen.getByRole('button', { name: 'Wskazówka', expanded: true })).toBeTruthy();
  });

  it('StepProgress announces step changes (not the first render)', () => {
    const { rerender } = render(<StepProgress totalSteps={7} currentStep={1} />);
    expect(announce).not.toHaveBeenCalled();
    expect(screen.getByRole('progressbar', { name: 'Krok 1 z 7' })).toBeTruthy();
    rerender(<StepProgress totalSteps={7} currentStep={2} />);
    expect(announce).toHaveBeenCalledWith('Krok 2 z 7');
  });

  it('PinPad announces errors and reports progress', () => {
    render(<PinPad value="12" onChange={jest.fn()} label="PIN" error="Nieprawidłowy kod PIN" />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(announce).toHaveBeenCalledWith('Nieprawidłowy kod PIN');
    expect(screen.getByLabelText('Wprowadzono 2 z 4 cyfr')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'PIN' })).toBeTruthy();
  });

  it('ChipView categories expose expanded state', () => {
    render(<ChipView nodes={feelingsWheel} selected={[]} onChange={jest.fn()} />);
    const label = feelingsWheel[0].label;
    fireEvent.press(screen.getByRole('button', { name: label }));
    expect(screen.getByRole('button', { name: label, expanded: true })).toBeTruthy();
  });
});
