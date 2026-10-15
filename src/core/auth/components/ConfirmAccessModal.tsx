import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as LocalAuth from 'expo-local-authentication';
import { useColors } from '../../theme/useColors';
import { useSettings } from '../../settings/store';
import { verifyPin } from '../pin';
import { PinPad } from './PinPad';
import { pl } from '../../i18n/pl';
import { spacing, radius } from '../../theme';

export interface ConfirmAccessModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Re-checks the PIN (or biometrics) before a sensitive action such as export. */
export function ConfirmAccessModal({ visible, onConfirm, onCancel }: ConfirmAccessModalProps) {
  const colors = useColors();
  const biometricsEnabled = useSettings((s) => s.biometricsEnabled);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!visible) {
      setPin('');
      setError(undefined);
    }
  }, [visible]);

  async function handlePinChange(value: string) {
    setPin(value);
    setError(undefined);
    if (value.length !== 4) return;
    let ok = false;
    try {
      ok = await verifyPin(value);
    } catch {
      ok = false;
    }
    if (ok) {
      onConfirm();
    } else {
      setError(pl.auth.lock.wrongPin);
      setPin('');
    }
  }

  async function handleBiometrics() {
    try {
      const result = await LocalAuth.authenticateAsync({
        promptMessage: pl.auth.confirm.title,
        fallbackLabel: '',
      });
      if (result.success) onConfirm();
    } catch {
      // biometrics unavailable — stay on PIN entry
    }
  }

  const s = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      alignItems: 'center',
      gap: spacing.md,
    },
    buttonText: { fontSize: 15, color: colors.accent, fontWeight: '600' },
    cancelText: { fontSize: 14, color: colors.textDim },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <PinPad
            value={pin}
            onChange={handlePinChange}
            label={pl.auth.confirm.title}
            error={error}
          />
          {biometricsEnabled && (
            <TouchableOpacity onPress={handleBiometrics} style={{ padding: spacing.sm }}>
              <Text style={s.buttonText}>{pl.auth.lock.useBiometrics}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onCancel} style={{ padding: spacing.sm }}>
            <Text style={s.cancelText}>{pl.common.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
