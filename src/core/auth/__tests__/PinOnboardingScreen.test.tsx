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
import { PinOnboardingScreen } from '../screens/PinOnboardingScreen';
import { useSettings } from '../../settings/store';
import { pl } from '../../i18n/pl';

beforeEach(() => {
  useSettings.setState({ pinOnboardingShown: false });
});

describe('PinOnboardingScreen', () => {
  it('renders title and description', () => {
    const { getByText } = render(<PinOnboardingScreen onSetup={jest.fn()} onSkip={jest.fn()} />);
    expect(getByText(pl.auth.onboarding.title)).toBeTruthy();
    expect(getByText(pl.auth.onboarding.description)).toBeTruthy();
  });

  it('calls onSetup when setup button pressed', () => {
    const onSetup = jest.fn();
    const { getByText } = render(<PinOnboardingScreen onSetup={onSetup} onSkip={jest.fn()} />);
    fireEvent.press(getByText(pl.auth.onboarding.setupButton));
    expect(onSetup).toHaveBeenCalled();
  });

  it('sets pinOnboardingShown=true and calls onSkip when skip pressed', () => {
    const onSkip = jest.fn();
    const { getByText } = render(<PinOnboardingScreen onSetup={jest.fn()} onSkip={onSkip} />);
    fireEvent.press(getByText(pl.auth.onboarding.skipButton));
    expect(useSettings.getState().pinOnboardingShown).toBe(true);
    expect(onSkip).toHaveBeenCalled();
  });
});
