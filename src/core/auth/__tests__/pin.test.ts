import * as SecureStore from 'expo-secure-store';
import { savePin, loadPinHash, clearPin, verifyPin } from '../pin';

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => {
  jest.clearAllMocks();
  (SecureStore as { __reset?: () => void }).__reset?.();
});

describe('savePin', () => {
  it('stores a value in SecureStore under cbt-pin-hash', async () => {
    await savePin('1234');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('cbt-pin-hash', expect.any(String));
  });

  it('stored value starts with a 32-char hex salt', async () => {
    await savePin('0000');
    const [[, stored]] = mockSecureStore.setItemAsync.mock.calls;
    expect(stored.slice(0, 32)).toMatch(/^[0-9a-f]{32}$/);
  });

  it('stored value is longer than 32 chars (salt + derived key)', async () => {
    await savePin('1234');
    const [[, stored]] = mockSecureStore.setItemAsync.mock.calls;
    expect(stored.length).toBeGreaterThan(32);
  });

  it('produces different stored values for the same PIN on each call (random salt)', async () => {
    await savePin('1234');
    const [[, first]] = mockSecureStore.setItemAsync.mock.calls;
    (SecureStore as { __reset?: () => void }).__reset?.();
    jest.clearAllMocks();
    await savePin('1234');
    const [[, second]] = mockSecureStore.setItemAsync.mock.calls;
    expect(first).not.toBe(second);
  });
});

describe('loadPinHash', () => {
  it('returns null when no PIN is saved', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
    expect(await loadPinHash()).toBeNull();
  });

  it('returns the stored value', async () => {
    await savePin('1234');
    const [[, stored]] = mockSecureStore.setItemAsync.mock.calls;
    // The mock store is already populated; loadPinHash reads from it
    expect(await loadPinHash()).toBe(stored);
  });
});

describe('clearPin', () => {
  it('deletes cbt-pin-hash from SecureStore', async () => {
    await clearPin();
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('cbt-pin-hash');
  });
});

describe('verifyPin', () => {
  it('returns false when no PIN is stored', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
    expect(await verifyPin('1234')).toBe(false);
  });

  it('returns false when stored value is malformed (too short)', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('tooshort');
    expect(await verifyPin('1234')).toBe(false);
  });

  it('returns true when PIN matches (round-trip via mock store)', async () => {
    await savePin('1234');
    expect(await verifyPin('1234')).toBe(true);
  });

  it('returns false when PIN does not match', async () => {
    await savePin('1234');
    expect(await verifyPin('9999')).toBe(false);
  });
});
