import { Alert } from 'react-native';
import {
  cacheDirectory,
  deleteAsync,
  makeDirectoryAsync,
  moveAsync,
} from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { pl } from '../i18n/pl';

// All exports live in one dedicated directory so they can be swept in one call.
const EXPORT_DIR = `${cacheDirectory}exports/`;

export class ShareUnavailableError extends Error {}

export async function ensureExportDir(): Promise<string> {
  await makeDirectoryAsync(EXPORT_DIR, { intermediates: true });
  return EXPORT_DIR;
}

/** Moves a file generated elsewhere (expo-print, view-shot) into the export dir. */
export async function moveToExportDir(uri: string, fileName: string): Promise<string> {
  await ensureExportDir();
  const target = `${EXPORT_DIR}${fileName}`;
  await moveAsync({ from: uri, to: target });
  return target;
}

/** Shares a file and always deletes it afterwards, whether sharing succeeded or failed. */
export async function shareExportFile(uri: string, options: Sharing.SharingOptions): Promise<void> {
  try {
    if (!(await Sharing.isAvailableAsync())) throw new ShareUnavailableError();
    await Sharing.shareAsync(uri, options);
  } finally {
    await deleteAsync(uri, { idempotent: true }).catch(() => undefined);
  }
}

/** Removes every export file. Used at startup and when data is wiped. */
export async function clearExportFiles(): Promise<void> {
  await deleteAsync(EXPORT_DIR, { idempotent: true }).catch(() => undefined);
}

/** Dev-only: logs the error message without any journal content. */
export function reportExportError(err: unknown, title: string, message: string): void {
  if (__DEV__) console.error('[export] failed:', err instanceof Error ? err.message : 'unknown');
  Alert.alert(
    title,
    err instanceof ShareUnavailableError ? pl.settings.data.shareUnavailable : message
  );
}
