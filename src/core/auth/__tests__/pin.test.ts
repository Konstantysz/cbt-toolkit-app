import * as SecureStore from 'expo-secure-store';
import { savePin, loadPinHash, clearPin, verifyPin } from '../pin';

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

// Mock getRandomValues fills [0, 1, 2, ..., 15] → salt = '000102030405060708090a0b0c0d0e0f'
// Mock digestStringAsync returns 'hashed:<input>'
// So stored value = salt + 'hashed:' + salt + pin
const TEST_SALT = '000102030405060708090a0b0c0d0e0f';
const storedFor = (pin: string) => TEST_SALT + `hashed:${TEST_SALT}${pin}`;

beforeEach(() => {
  jest.clearAllMocks();
  (SecureStore as { __reset?: () => void }).__reset?.();
});

describe('savePin', () => {
  it('stores salt+hash in SecureStore under cbt-pin-hash', async () => {
    await savePin('1234');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('cbt-pin-hash', storedFor('1234'));
  });

  it('stored value begins with 32-char hex salt', async () => {
    await savePin('0000');
    const [[, stored]] = mockSecureStore.setItemAsync.mock.calls;
    expect(stored.slice(0, 32)).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe('loadPinHash', () => {
  it('returns null when no PIN is saved', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
    expect(await loadPinHash()).toBeNull();
  });

  it('returns the stored value', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(storedFor('1234'));
    expect(await loadPinHash()).toBe(storedFor('1234'));
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

  it('returns false when stored value is too short (malformed)', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('tooshort');
    expect(await verifyPin('1234')).toBe(false);
  });

  it('returns true when PIN matches stored salt+hash', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(storedFor('1234'));
    expect(await verifyPin('1234')).toBe(true);
  });

  it('returns false when PIN does not match', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(storedFor('1234'));
    expect(await verifyPin('9999')).toBe(false);
  });
});
