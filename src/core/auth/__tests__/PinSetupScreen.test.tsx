jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PinSetupScreen } from '../screens/PinSetupScreen';
import { useSettings } from '../../settings/store';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuth from 'expo-local-authentication';
import { pl } from '../../i18n/pl';

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore> & { __reset?: () => void };
const mockLocalAuth = LocalAuth as jest.Mocked<typeof LocalAuth>;

beforeEach(() => {
  jest.clearAllMocks();
  mockSecureStore.__reset?.();
  useSettings.setState({ pinEnabled: false, biometricsEnabled: false, pinOnboardingShown: false });
  mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
  mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
});

function enterPin(getAllByLabelText: ReturnType<typeof render>['getAllByLabelText'], pin: string) {
  for (const digit of pin) {
    const buttons = getAllByLabelText(digit);
    fireEvent.press(buttons[0]);
  }
}

describe('PinSetupScreen — step 1 to step 2', () => {
  it('shows step 1 label initially', () => {
    const { getByText } = render(<PinSetupScreen onComplete={jest.fn()} />);
    expect(getByText(pl.auth.setup.stepEnter)).toBeTruthy();
  });

  it('advances to step 2 after 4 digits entered', async () => {
    const { getByText, getAllByLabelText } = render(<PinSetupScreen onComplete={jest.fn()} />);
    enterPin(getAllByLabelText, '1234');
    await waitFor(() => expect(getByText(pl.auth.setup.stepConfirm)).toBeTruthy());
  });
});

describe('PinSetupScreen — mismatch', () => {
  it('shows mismatch error and resets to step 1 when PINs differ', async () => {
    const { getByText, getAllByLabelText } = render(<PinSetupScreen onComplete={jest.fn()} />);
    enterPin(getAllByLabelText, '1234');
    await waitFor(() => getByText(pl.auth.setup.stepConfirm));
    enterPin(getAllByLabelText, '9999');
    await waitFor(() => {
      expect(getByText(pl.auth.setup.mismatch)).toBeTruthy();
    });
  });
});

describe('PinSetupScreen — success without biometrics', () => {
  it('saves PIN, sets pinEnabled=true and pinOnboardingShown=true when biometrics skipped', async () => {
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
    const onComplete = jest.fn();
    const { getAllByLabelText } = render(<PinSetupScreen onComplete={onComplete} />);
    enterPin(getAllByLabelText, '1234');
    await waitFor(() => {});
    enterPin(getAllByLabelText, '1234');
    await waitFor(() => {
      expect(useSettings.getState().pinEnabled).toBe(true);
      expect(useSettings.getState().pinOnboardingShown).toBe(true);
      expect(onComplete).toHaveBeenCalled();
    });
  });
});

describe('PinSetupScreen — biometrics step', () => {
  it('shows biometrics prompt when hardware available and PINs match', async () => {
    const { getByText, getAllByLabelText } = render(<PinSetupScreen onComplete={jest.fn()} />);
    enterPin(getAllByLabelText, '1234');
    await waitFor(() => {});
    enterPin(getAllByLabelText, '1234');
    await waitFor(() => expect(getByText(pl.auth.setup.biometricsTitle)).toBeTruthy());
  });

  it('enables biometrics and calls onComplete when biometrics accepted', async () => {
    const onComplete = jest.fn();
    const { getByText, getAllByLabelText } = render(<PinSetupScreen onComplete={onComplete} />);
    enterPin(getAllByLabelText, '1234');
    await waitFor(() => {});
    enterPin(getAllByLabelText, '1234');
    await waitFor(() => getByText(pl.auth.setup.biometricsEnable));
    fireEvent.press(getByText(pl.auth.setup.biometricsEnable));
    await waitFor(() => {
      expect(useSettings.getState().biometricsEnabled).toBe(true);
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('skips biometrics and calls onComplete when biometrics declined', async () => {
    const onComplete = jest.fn();
    const { getByText, getAllByLabelText } = render(<PinSetupScreen onComplete={onComplete} />);
    enterPin(getAllByLabelText, '1234');
    await waitFor(() => {});
    enterPin(getAllByLabelText, '1234');
    await waitFor(() => getByText(pl.auth.setup.biometricsSkip));
    fireEvent.press(getByText(pl.auth.setup.biometricsSkip));
    await waitFor(() => {
      expect(useSettings.getState().biometricsEnabled).toBe(false);
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
