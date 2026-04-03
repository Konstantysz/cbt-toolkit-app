import { create } from 'zustand';

export type AuthPhase = 'loading' | 'onboarding' | 'setup' | 'verify' | 'locked' | 'unlocked';
export type PendingAction = 'disable-pin' | 'change-pin' | null;

export const LOCK_TIMEOUT_MS = 30_000;

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
  checkLockOnForeground: (pinEnabled: boolean) => void;
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
