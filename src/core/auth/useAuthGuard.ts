import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSettings } from '../settings/store';
import { useAuthStore, type AuthPhase } from './store';

export function useAuthGuard(): {
  authPhase: AuthPhase;
  goToSetup: () => void;
  goToUnlocked: () => void;
} {
  const pinEnabled = useSettings((s) => s.pinEnabled);
  const pinOnboardingShown = useSettings((s) => s.pinOnboardingShown);
  const authPhase = useAuthStore((s) => s.authPhase);
  const { setPhase, setBackgroundedAt, checkLockOnForeground } = useAuthStore.getState();

  // Initialize phase once on mount (after settings are available)
  useEffect(() => {
    if (pinEnabled) {
      setPhase('locked');
    } else if (!pinOnboardingShown) {
      setPhase('onboarding');
    } else {
      setPhase('unlocked');
    }
     
    // Intentionally empty deps: phase is initialised once on mount from
    // persisted settings. Re-running on settings changes would reset the
    // phase mid-session (e.g. switching back to 'locked' after PIN setup).
  }, []);

  // AppState: track background time and lock on return
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        setBackgroundedAt(Date.now());
      } else if (next === 'active') {
        checkLockOnForeground(pinEnabled);
      }
    });
    return () => subscription.remove();
  }, [pinEnabled, setBackgroundedAt, checkLockOnForeground]);

  return {
    authPhase,
    goToSetup: () => setPhase('setup'),
    goToUnlocked: () => setPhase('unlocked'),
  };
}
