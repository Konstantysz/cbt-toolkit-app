import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import * as LocalAuth from 'expo-local-authentication';
import { useColors } from '../../theme/useColors';
import { useSettings } from '../../settings/store';
import { verifyPin, clearPin } from '../pin';
import { resetDatabase } from '../../db/database';
import { PinPad } from '../components/PinPad';
import { pl } from '../../i18n/pl';
import { spacing } from '../../theme';

export interface PinLockScreenProps {
  onUnlock: () => void;
}

export function PinLockScreen({ onUnlock }: PinLockScreenProps) {
  const db = useSQLiteContext();
  const colors = useColors();
  const biometricsEnabled = useSettings((s) => s.biometricsEnabled);
  const { reset: resetSettings } = useSettings.getState();

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | undefined>();

  const s = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
        inner: { padding: spacing.lg, gap: spacing.lg, alignItems: 'center' },
        biometricsButton: { padding: spacing.md },
        biometricsText: { fontSize: 15, color: colors.accent, fontWeight: '600' },
        forgotButton: { padding: spacing.md },
        forgotText: { fontSize: 13, color: colors.textDim },
      }),
    [colors]
  );

  async function handlePinChange(value: string) {
    setPin(value);
    setError(undefined);
    if (value.length === 4) {
      const ok = await verifyPin(value);
      if (ok) {
        onUnlock();
      } else {
        setError(pl.auth.lock.wrongPin);
        setPin('');
      }
    }
  }

  async function handleBiometrics() {
    const result = await LocalAuth.authenticateAsync({
      promptMessage: pl.auth.lock.title,
      fallbackLabel: '',
    });
    if (result.success) onUnlock();
  }

  function handleForgotPin() {
    Alert.alert(pl.auth.reset.alertTitle, pl.auth.reset.alertMessage, [
      { text: pl.common.cancel, style: 'cancel' },
      {
        text: pl.auth.reset.confirm,
        style: 'destructive',
        onPress: async () => {
          await resetDatabase(db);
          await clearPin();
          resetSettings();
        },
      },
    ]);
  }

  return (
    <View style={s.container}>
      <View style={s.inner}>
        <PinPad value={pin} onChange={handlePinChange} label={pl.auth.lock.title} error={error} />
        {biometricsEnabled && (
          <TouchableOpacity style={s.biometricsButton} onPress={handleBiometrics}>
            <Text style={s.biometricsText}>{pl.auth.lock.useBiometrics}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={s.forgotButton} onPress={handleForgotPin}>
          <Text style={s.forgotText}>{pl.auth.lock.forgotPin}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
