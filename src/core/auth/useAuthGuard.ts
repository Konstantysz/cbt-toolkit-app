import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSettings } from '../settings/store';
import { loadPinHash } from './pin';
import { useAuthStore, type AuthPhase } from './store';

export function useAuthGuard(): {
  authPhase: AuthPhase;
  goToSetup: () => void;
  goToUnlocked: () => void;
} {
  const pinEnabled = useSettings((s) => s.pinEnabled);
  const lockTimeoutMs = useSettings((s) => s.lockTimeoutMs);
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

  // Initialize phase once, after settings are hydrated.
  // PIN-enabled is derived from the presence of the stored hash; a missing
  // hash (e.g. restored backup, cleared keystore) means no PIN.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      let hash: string | null = null;
      try {
        hash = await loadPinHash();
      } catch {
        hash = null;
      }
      if (cancelled) return;
      const settings = useSettings.getState();
      settings.setPinEnabled(!!hash);
      if (!hash) settings.setBiometricsEnabled(false);
      if (hash) {
        setPhase('locked');
      } else if (!settings.pinOnboardingShown) {
        setPhase('onboarding');
      } else {
        setPhase('unlocked');
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally depends only on hydrated: phase is initialized once.
  }, [hydrated]);

  // AppState: track background time and lock on return.
  // Only 'background' sets the timestamp — 'inactive' fires on return from
  // background on iOS and would overwrite the timestamp, causing false unlocks.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'background') {
        setBackgroundedAt(Date.now());
      } else if (next === 'active') {
        checkLockOnForeground(pinEnabled, lockTimeoutMs);
      }
    });
    return () => subscription.remove();
  }, [pinEnabled, lockTimeoutMs, setBackgroundedAt, checkLockOnForeground]);

  return {
    authPhase,
    goToSetup: () => setPhase('setup'),
    goToUnlocked: () => setPhase('unlocked'),
  };
}
