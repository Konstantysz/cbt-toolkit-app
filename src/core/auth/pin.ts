import * as SecureStore from 'expo-secure-store';

const PIN_HASH_KEY = 'cbt-pin-hash';
const SALT_LENGTH = 32; // 16 bytes as hex string
// 100k iterations intentionally slows brute-force: ~50–200ms on device,
// but 10 000 × 200ms = ~33 min to exhaustively try all 4-digit PINs offline.
const PBKDF2_ITERATIONS = 100_000;

function generateSalt(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function deriveKey(pin: string, salt: string): Promise<string> {
  const saltBytes = new Uint8Array((salt.match(/.{2}/g) ?? []).map((h) => parseInt(h, 16)));
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function savePin(pin: string): Promise<void> {
  const salt = generateSalt();
  const hash = await deriveKey(pin, salt);
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
  const hash = await deriveKey(pin, salt);
  return hash === storedHash;
}
