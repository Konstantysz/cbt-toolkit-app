import { useAuthStore, LOCK_TIMEOUT_MS } from '../store';

beforeEach(() => {
  useAuthStore.setState({ authPhase: 'loading', backgroundedAt: null, pendingAction: null });
});

describe('LOCK_TIMEOUT_MS', () => {
  it('is 30 seconds', () => {
    expect(LOCK_TIMEOUT_MS).toBe(30_000);
  });
});

describe('useAuthStore — initial state', () => {
  it('authPhase starts as loading', () => {
    expect(useAuthStore.getState().authPhase).toBe('loading');
  });

  it('backgroundedAt is null by default', () => {
    expect(useAuthStore.getState().backgroundedAt).toBeNull();
  });

  it('pendingAction is null by default', () => {
    expect(useAuthStore.getState().pendingAction).toBeNull();
  });
});

describe('useAuthStore — setPhase', () => {
  it('sets authPhase', () => {
    useAuthStore.getState().setPhase('locked');
    expect(useAuthStore.getState().authPhase).toBe('locked');
  });
});

describe('useAuthStore — lock / unlock', () => {
  it('lock sets authPhase to locked', () => {
    useAuthStore.getState().lock();
    expect(useAuthStore.getState().authPhase).toBe('locked');
  });

  it('unlock sets authPhase to unlocked', () => {
    useAuthStore.getState().lock();
    useAuthStore.getState().unlock();
    expect(useAuthStore.getState().authPhase).toBe('unlocked');
  });
});

describe('useAuthStore — requestVerify', () => {
  it('sets authPhase to verify and stores pendingAction', () => {
    useAuthStore.getState().requestVerify('disable-pin');
    expect(useAuthStore.getState().authPhase).toBe('verify');
    expect(useAuthStore.getState().pendingAction).toBe('disable-pin');
  });

  it('works for change-pin action', () => {
    useAuthStore.getState().requestVerify('change-pin');
    expect(useAuthStore.getState().authPhase).toBe('verify');
    expect(useAuthStore.getState().pendingAction).toBe('change-pin');
  });
});

describe('useAuthStore — setPendingAction', () => {
  it('clears pendingAction when set to null', () => {
    useAuthStore.getState().requestVerify('disable-pin');
    useAuthStore.getState().setPendingAction(null);
    expect(useAuthStore.getState().pendingAction).toBeNull();
  });
});

describe('useAuthStore — setBackgroundedAt', () => {
  it('stores the timestamp', () => {
    useAuthStore.getState().setBackgroundedAt(1000);
    expect(useAuthStore.getState().backgroundedAt).toBe(1000);
  });
});

describe('useAuthStore — checkLockOnForeground', () => {
  beforeEach(() => {
    useAuthStore.setState({ authPhase: 'unlocked', backgroundedAt: null, pendingAction: null });
  });

  it('does nothing when pinEnabled is false', () => {
    useAuthStore.getState().setBackgroundedAt(Date.now() - LOCK_TIMEOUT_MS - 1);
    useAuthStore.getState().checkLockOnForeground(false);
    expect(useAuthStore.getState().authPhase).toBe('unlocked');
  });

  it('does nothing when backgroundedAt is null', () => {
    useAuthStore.getState().checkLockOnForeground(true);
    expect(useAuthStore.getState().authPhase).toBe('unlocked');
  });

  it('locks when timeout exceeded and pinEnabled is true', () => {
    useAuthStore.getState().setBackgroundedAt(Date.now() - LOCK_TIMEOUT_MS - 1);
    useAuthStore.getState().checkLockOnForeground(true);
    expect(useAuthStore.getState().authPhase).toBe('locked');
  });

  it('does not lock when timeout not exceeded', () => {
    useAuthStore.getState().setBackgroundedAt(Date.now() - 100);
    useAuthStore.getState().checkLockOnForeground(true);
    expect(useAuthStore.getState().authPhase).toBe('unlocked');
  });

  it('clears backgroundedAt after check', () => {
    useAuthStore.getState().setBackgroundedAt(Date.now() - 100);
    useAuthStore.getState().checkLockOnForeground(true);
    expect(useAuthStore.getState().backgroundedAt).toBeNull();
  });
});
