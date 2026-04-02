import { create } from 'zustand';

export type AuthPhase = 'loading' | 'onboarding' | 'setup' | 'locked' | 'unlocked';

export const LOCK_TIMEOUT_MS = 30_000;

interface AuthState {
  authPhase: AuthPhase;
  backgroundedAt: number | null;
}

interface AuthActions {
  setPhase: (phase: AuthPhase) => void;
  lock: () => void;
  unlock: () => void;
  setBackgroundedAt: (ts: number | null) => void;
  checkLockOnForeground: (pinEnabled: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  authPhase: 'unlocked',
  backgroundedAt: null,
  setPhase: (phase) => set({ authPhase: phase }),
  lock: () => set({ authPhase: 'locked' }),
  unlock: () => set({ authPhase: 'unlocked' }),
  setBackgroundedAt: (ts) => set({ backgroundedAt: ts }),
  checkLockOnForeground: (pinEnabled: boolean) => {
    const { backgroundedAt, authPhase } = get();
    if (!pinEnabled || backgroundedAt === null || authPhase === 'locked') {
      set({ backgroundedAt: null });
      return;
    }
    if (Date.now() - backgroundedAt > LOCK_TIMEOUT_MS) {
      set({ authPhase: 'locked', backgroundedAt: null });
    } else {
      set({ backgroundedAt: null });
    }
  },
}));
