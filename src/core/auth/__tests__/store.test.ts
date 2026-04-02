import { useAuthStore, LOCK_TIMEOUT_MS } from '../store';

beforeEach(() => {
  useAuthStore.setState({ authPhase: 'unlocked', backgroundedAt: null });
});

describe('LOCK_TIMEOUT_MS', () => {
  it('is 30 seconds', () => {
    expect(LOCK_TIMEOUT_MS).toBe(30_000);
  });
});

describe('useAuthStore — initial state', () => {
  it('authPhase is unlocked by default', () => {
    expect(useAuthStore.getState().authPhase).toBe('unlocked');
  });

  it('backgroundedAt is null by default', () => {
    expect(useAuthStore.getState().backgroundedAt).toBeNull();
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

describe('useAuthStore — setBackgroundedAt', () => {
  it('stores the timestamp', () => {
    useAuthStore.getState().setBackgroundedAt(1000);
    expect(useAuthStore.getState().backgroundedAt).toBe(1000);
  });
});

describe('useAuthStore — checkLockOnForeground', () => {
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
