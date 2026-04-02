jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: jest.fn().mockReturnValue({
    getAllAsync: jest.fn().mockResolvedValue([]),
    execAsync: jest.fn().mockResolvedValue(undefined),
  }),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PinLockScreen } from '../screens/PinLockScreen';
import { useSettings } from '../../settings/store';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuth from 'expo-local-authentication';
import { pl } from '../../i18n/pl';

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore> & { __reset?: () => void };
const mockLocalAuth = LocalAuth as jest.Mocked<typeof LocalAuth>;

beforeEach(() => {
  jest.clearAllMocks();
  mockSecureStore.__reset?.();
  useSettings.setState({ pinEnabled: true, biometricsEnabled: false });
  // Store hash for PIN '1234' (mock returns 'hashed:1234')
  mockSecureStore.getItemAsync.mockResolvedValue('hashed:1234');
});

describe('PinLockScreen — correct PIN', () => {
  it('calls onUnlock when correct PIN entered', async () => {
    const onUnlock = jest.fn();
    const { getAllByLabelText } = render(<PinLockScreen onUnlock={onUnlock} />);
    for (const d of '1234') fireEvent.press(getAllByLabelText(d)[0]);
    await waitFor(() => expect(onUnlock).toHaveBeenCalled());
  });
});

describe('PinLockScreen — wrong PIN', () => {
  it('shows error and does not call onUnlock when wrong PIN', async () => {
    const onUnlock = jest.fn();
    const { getAllByLabelText, getByText } = render(<PinLockScreen onUnlock={onUnlock} />);
    for (const d of '9999') fireEvent.press(getAllByLabelText(d)[0]);
    await waitFor(() => expect(getByText(pl.auth.lock.wrongPin)).toBeTruthy());
    expect(onUnlock).not.toHaveBeenCalled();
  });
});

describe('PinLockScreen — biometrics button', () => {
  it('shows biometrics button when biometricsEnabled is true', () => {
    useSettings.setState({ biometricsEnabled: true });
    const { getByText } = render(<PinLockScreen onUnlock={jest.fn()} />);
    expect(getByText(pl.auth.lock.useBiometrics)).toBeTruthy();
  });

  it('hides biometrics button when biometricsEnabled is false', () => {
    useSettings.setState({ biometricsEnabled: false });
    const { queryByText } = render(<PinLockScreen onUnlock={jest.fn()} />);
    expect(queryByText(pl.auth.lock.useBiometrics)).toBeNull();
  });

  it('calls onUnlock when biometrics succeed', async () => {
    useSettings.setState({ biometricsEnabled: true });
    mockLocalAuth.authenticateAsync.mockResolvedValueOnce({ success: true });
    const onUnlock = jest.fn();
    const { getByText } = render(<PinLockScreen onUnlock={onUnlock} />);
    fireEvent.press(getByText(pl.auth.lock.useBiometrics));
    await waitFor(() => expect(onUnlock).toHaveBeenCalled());
  });

  it('stays locked when biometrics fail', async () => {
    useSettings.setState({ biometricsEnabled: true });
    mockLocalAuth.authenticateAsync.mockResolvedValueOnce({ success: false });
    const onUnlock = jest.fn();
    const { getByText } = render(<PinLockScreen onUnlock={onUnlock} />);
    fireEvent.press(getByText(pl.auth.lock.useBiometrics));
    await waitFor(() => expect(onUnlock).not.toHaveBeenCalled());
  });
});

describe('PinLockScreen — reset', () => {
  it('shows forgot PIN button', () => {
    const { getByText } = render(<PinLockScreen onUnlock={jest.fn()} />);
    expect(getByText(pl.auth.lock.forgotPin)).toBeTruthy();
  });
});
