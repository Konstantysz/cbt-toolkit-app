import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { hashPin, savePin, loadPinHash, clearPin, verifyPin } from '../pin';

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockCrypto = Crypto as jest.Mocked<typeof Crypto>;

beforeEach(() => {
  jest.clearAllMocks();
  (SecureStore as { __reset?: () => void }).__reset?.();
});

describe('hashPin', () => {
  it('calls digestStringAsync with SHA256 and the pin', async () => {
    await hashPin('1234');
    expect(mockCrypto.digestStringAsync).toHaveBeenCalledWith(
      Crypto.CryptoDigestAlgorithm.SHA256,
      '1234'
    );
  });

  it('returns the hashed string', async () => {
    const result = await hashPin('1234');
    expect(result).toBe('hashed:1234');
  });
});

describe('savePin', () => {
  it('stores the hash in SecureStore under cbt-pin-hash', async () => {
    await savePin('1234');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('cbt-pin-hash', 'hashed:1234');
  });
});

describe('loadPinHash', () => {
  it('returns null when no PIN is saved', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
    const result = await loadPinHash();
    expect(result).toBeNull();
  });

  it('returns the stored hash', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('hashed:1234');
    const result = await loadPinHash();
    expect(result).toBe('hashed:1234');
  });
});

describe('clearPin', () => {
  it('calls deleteItemAsync with cbt-pin-hash', async () => {
    await clearPin();
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('cbt-pin-hash');
  });
});

describe('verifyPin', () => {
  it('returns false when no PIN is stored', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
    const result = await verifyPin('1234');
    expect(result).toBe(false);
  });

  it('returns true when PIN matches stored hash', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('hashed:1234');
    const result = await verifyPin('1234');
    expect(result).toBe(true);
  });

  it('returns false when PIN does not match', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('hashed:1234');
    const result = await verifyPin('9999');
    expect(result).toBe(false);
  });
});
