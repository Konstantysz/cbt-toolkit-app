jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

import { renderHook, act } from '@testing-library/react-native';
import { useAuthGuard } from '../useAuthGuard';
import { useSettings } from '../../settings/store';
import { useAuthStore } from '../store';

beforeEach(() => {
  useSettings.setState({
    pinEnabled: false,
    pinOnboardingShown: false,
    biometricsEnabled: false,
  });
  useAuthStore.setState({ authPhase: 'unlocked', backgroundedAt: null });
});

describe('useAuthGuard — initial phase', () => {
  it('sets onboarding when pinEnabled=false and pinOnboardingShown=false', () => {
    renderHook(() => useAuthGuard());
    expect(useAuthStore.getState().authPhase).toBe('onboarding');
  });

  it('sets locked when pinEnabled=true', () => {
    useSettings.setState({ pinEnabled: true, pinOnboardingShown: true });
    renderHook(() => useAuthGuard());
    expect(useAuthStore.getState().authPhase).toBe('locked');
  });

  it('sets unlocked when pinEnabled=false and pinOnboardingShown=true', () => {
    useSettings.setState({ pinEnabled: false, pinOnboardingShown: true });
    renderHook(() => useAuthGuard());
    expect(useAuthStore.getState().authPhase).toBe('unlocked');
  });
});

describe('useAuthGuard — goToSetup / goToUnlocked', () => {
  it('goToSetup sets authPhase to setup', () => {
    const { result } = renderHook(() => useAuthGuard());
    act(() => result.current.goToSetup());
    expect(useAuthStore.getState().authPhase).toBe('setup');
  });

  it('goToUnlocked sets authPhase to unlocked', () => {
    const { result } = renderHook(() => useAuthGuard());
    act(() => result.current.goToUnlocked());
    expect(useAuthStore.getState().authPhase).toBe('unlocked');
  });
});
