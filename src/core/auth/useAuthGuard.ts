import { useState, useEffect } from 'react';
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

  // Wait for Zustand AsyncStorage hydration before initializing auth phase.
  // Without this, the init effect would read default values (pinEnabled=false)
  // and set the wrong phase before persisted settings are loaded from storage.
  const [hydrated, setHydrated] = useState(() => useSettings.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    const unsub = useSettings.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);

  // Initialize phase once, after settings are hydrated
  useEffect(() => {
    if (!hydrated) return;
    if (pinEnabled) {
      setPhase('locked');
    } else if (!pinOnboardingShown) {
      setPhase('onboarding');
    } else {
      setPhase('unlocked');
    }

    // Intentionally depends only on hydrated: phase is initialized once from
    // persisted settings. Re-running on settings changes would reset the
    // phase mid-session (e.g. switching back to 'locked' after PIN setup).
  }, [hydrated]);

  // AppState: track background time and lock on return.
  // Only 'background' sets the timestamp — 'inactive' fires on return from
  // background on iOS and would overwrite the timestamp, causing false unlocks.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'background') {
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
