import { create } from 'zustand';

export type AuthPhase = 'loading' | 'onboarding' | 'setup' | 'verify' | 'locked' | 'unlocked';
export type PendingAction = 'disable-pin' | 'change-pin' | null;

export const LOCK_TIMEOUT_MS = 30_000;
export const LOCK_TIMEOUT_OPTIONS_MS = [0, 30_000, 60_000, 300_000] as const;

interface AuthState {
  authPhase: AuthPhase;
  backgroundedAt: number | null;
  pendingAction: PendingAction;
}

interface AuthActions {
  setPhase: (phase: AuthPhase) => void;
  lock: () => void;
  unlock: () => void;
  setBackgroundedAt: (ts: number | null) => void;
  checkLockOnForeground: (pinEnabled: boolean, timeoutMs?: number) => void;
  setPendingAction: (action: PendingAction) => void;
  requestVerify: (action: Exclude<PendingAction, null>) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  authPhase: 'loading',
  backgroundedAt: null,
  pendingAction: null,
  setPhase: (phase) => set({ authPhase: phase }),
  lock: () => set({ authPhase: 'locked' }),
  unlock: () => set({ authPhase: 'unlocked' }),
  setBackgroundedAt: (ts) => set({ backgroundedAt: ts }),
  setPendingAction: (action) => set({ pendingAction: action }),
  requestVerify: (action) => set({ authPhase: 'verify', pendingAction: action }),
  checkLockOnForeground: (pinEnabled: boolean, timeoutMs = LOCK_TIMEOUT_MS) => {
    const { backgroundedAt, authPhase } = get();
    if (!pinEnabled || backgroundedAt === null || authPhase === 'locked') {
      set({ backgroundedAt: null });
      return;
    }
    // Negative elapsed = clock moved backwards: treat grace period as expired.
    const elapsed = Date.now() - backgroundedAt;
    if (elapsed < 0 || elapsed >= timeoutMs) {
      set({ authPhase: 'locked', backgroundedAt: null });
    } else {
      set({ backgroundedAt: null });
    }
  },
}));
