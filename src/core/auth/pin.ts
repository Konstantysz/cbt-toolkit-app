import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const PIN_HASH_KEY = 'cbt-pin-hash';

export async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export async function savePin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await SecureStore.setItemAsync(PIN_HASH_KEY, hash);
}

export async function loadPinHash(): Promise<string | null> {
  return SecureStore.getItemAsync(PIN_HASH_KEY);
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_HASH_KEY);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await loadPinHash();
  if (!stored) return false;
  const hash = await hashPin(pin);
  return hash === stored;
}
