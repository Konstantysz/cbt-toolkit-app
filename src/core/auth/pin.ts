import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const PIN_HASH_KEY = 'cbt-pin-hash';
// Salt is stored as a 32-char hex prefix directly before the hash.
// No separator — fixed-length slice avoids ambiguity.
const SALT_LENGTH = 32; // 16 bytes in hex

function generateSalt(): string {
  const bytes = Crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + pin);
}

export async function savePin(pin: string): Promise<void> {
  const salt = generateSalt();
  const hash = await hashPin(pin, salt);
  await SecureStore.setItemAsync(PIN_HASH_KEY, salt + hash);
}

export async function loadPinHash(): Promise<string | null> {
  return SecureStore.getItemAsync(PIN_HASH_KEY);
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_HASH_KEY);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await loadPinHash();
  if (!stored || stored.length <= SALT_LENGTH) return false;
  const salt = stored.slice(0, SALT_LENGTH);
  const storedHash = stored.slice(SALT_LENGTH);
  const hash = await hashPin(pin, salt);
  return hash === storedHash;
}
