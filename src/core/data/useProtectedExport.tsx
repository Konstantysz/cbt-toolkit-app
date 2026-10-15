import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useSettings } from '../settings/store';
import { ConfirmAccessModal } from '../auth/components/ConfirmAccessModal';
import { pl } from '../i18n/pl';

type ExportAction = () => Promise<void>;

/**
 * Wraps export actions: warns that the file is unencrypted, then asks for the
 * PIN/biometrics when the PIN lock is enabled. Render `modal` in the screen.
 */
export function useProtectedExport() {
  const [pending, setPending] = useState<ExportAction | null>(null);

  const guard = useCallback((run: ExportAction) => {
    Alert.alert(pl.settings.data.unencryptedTitle, pl.settings.data.unencryptedMessage, [
      { text: pl.common.cancel, style: 'cancel' },
      {
        text: pl.settings.data.unencryptedConfirm,
        onPress: () => {
          if (useSettings.getState().pinEnabled) setPending(() => run);
          else void run();
        },
      },
    ]);
  }, []);

  const modal = (
    <ConfirmAccessModal
      visible={pending !== null}
      onCancel={() => setPending(null)}
      onConfirm={() => {
        const run = pending;
        setPending(null);
        if (run) void run();
      }}
    />
  );

  return { guard, modal };
}
