jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthGuard } from '../useAuthGuard';
import { useSettings } from '../../settings/store';
import { useAuthStore } from '../store';

beforeEach(() => {
  useSettings.setState({
    pinEnabled: false,
    pinOnboardingShown: false,
    biometricsEnabled: false,
  });
  useAuthStore.setState({ authPhase: 'loading', backgroundedAt: null, pendingAction: null });
  // Force hasHydrated to return true so unit tests don't wait for async AsyncStorage hydration
  jest.spyOn(useSettings.persist, 'hasHydrated').mockReturnValue(true);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useAuthGuard — initial phase', () => {
  it('sets onboarding when pinEnabled=false and pinOnboardingShown=false', async () => {
    renderHook(() => useAuthGuard());
    await waitFor(() => expect(useAuthStore.getState().authPhase).toBe('onboarding'));
  });

  it('sets locked when pinEnabled=true', async () => {
    useSettings.setState({ pinEnabled: true, pinOnboardingShown: true });
    renderHook(() => useAuthGuard());
    await waitFor(() => expect(useAuthStore.getState().authPhase).toBe('locked'));
  });

  it('sets unlocked when pinEnabled=false and pinOnboardingShown=true', async () => {
    useSettings.setState({ pinEnabled: false, pinOnboardingShown: true });
    renderHook(() => useAuthGuard());
    await waitFor(() => expect(useAuthStore.getState().authPhase).toBe('unlocked'));
  });

  it('stays loading until hydration completes', () => {
    // Simulate un-hydrated state
    jest.spyOn(useSettings.persist, 'hasHydrated').mockReturnValue(false);
    jest.spyOn(useSettings.persist, 'onFinishHydration').mockReturnValue(() => {});
    renderHook(() => useAuthGuard());
    expect(useAuthStore.getState().authPhase).toBe('loading');
  });
});

describe('useAuthGuard — goToSetup / goToUnlocked', () => {
  it('goToSetup sets authPhase to setup', async () => {
    const { result } = renderHook(() => useAuthGuard());
    await waitFor(() => expect(useAuthStore.getState().authPhase).not.toBe('loading'));
    act(() => result.current.goToSetup());
    expect(useAuthStore.getState().authPhase).toBe('setup');
  });

  it('goToUnlocked sets authPhase to unlocked', async () => {
    const { result } = renderHook(() => useAuthGuard());
    await waitFor(() => expect(useAuthStore.getState().authPhase).not.toBe('loading'));
    act(() => result.current.goToUnlocked());
    expect(useAuthStore.getState().authPhase).toBe('unlocked');
  });
});
