import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as LocalAuth from 'expo-local-authentication';
import { useColors } from '../../theme/useColors';
import { useSettings } from '../../settings/store';
import { savePin } from '../pin';
import { PinPad } from '../components/PinPad';
import { pl } from '../../i18n/pl';
import { spacing, radius } from '../../theme';

type SetupStep = 'enter' | 'confirm' | 'biometrics';

export interface PinSetupScreenProps {
  onComplete: () => void;
}

export function PinSetupScreen({ onComplete }: PinSetupScreenProps) {
  const colors = useColors();
  const { setPinEnabled, setBiometricsEnabled, setPinOnboardingShown } = useSettings.getState();

  const [step, setStep] = useState<SetupStep>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | undefined>();

  const s = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
        inner: { padding: spacing.lg, gap: spacing.lg, alignItems: 'center' },
        biometricsBox: { gap: spacing.lg, alignItems: 'center', padding: spacing.lg },
        biometricsTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
          textAlign: 'center',
        },
        row: { flexDirection: 'row', gap: spacing.md },
        button: {
          flex: 1,
          backgroundColor: colors.accent,
          borderRadius: radius.md,
          padding: spacing.md,
          alignItems: 'center',
        },
        buttonSecondary: {
          backgroundColor: colors.surfaceRaised,
          borderWidth: 1,
          borderColor: colors.border,
        },
        buttonText: { fontSize: 15, fontWeight: '600', color: colors.bg },
        buttonSecondaryText: { color: colors.text },
      }),
    [colors]
  );

  async function handleConfirmChange(value: string) {
    setConfirmPin(value);
    if (value.length < 4) return;
    if (value !== firstPin) {
      setError(pl.auth.setup.mismatch);
      setStep('enter');
      setFirstPin('');
      setConfirmPin('');
      return;
    }
    await savePin(value);
    const hasHardware = await LocalAuth.hasHardwareAsync();
    const isEnrolled = await LocalAuth.isEnrolledAsync();
    if (hasHardware && isEnrolled) {
      setStep('biometrics');
    } else {
      await finish(false);
    }
  }

  async function finish(withBiometrics: boolean) {
    setPinEnabled(true);
    setPinOnboardingShown(true);
    setBiometricsEnabled(withBiometrics);
    onComplete();
  }

  function handleFirstChange(value: string) {
    setFirstPin(value);
    if (value.length === 4) {
      setStep('confirm');
      setConfirmPin('');
      setError(undefined);
    }
  }

  if (step === 'biometrics') {
    return (
      <View style={s.container}>
        <View style={s.biometricsBox}>
          <Text style={s.biometricsTitle}>{pl.auth.setup.biometricsTitle}</Text>
          <View style={s.row}>
            <TouchableOpacity style={[s.button, s.buttonSecondary]} onPress={() => finish(false)}>
              <Text style={[s.buttonText, s.buttonSecondaryText]}>
                {pl.auth.setup.biometricsSkip}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.button} onPress={() => finish(true)}>
              <Text style={s.buttonText}>{pl.auth.setup.biometricsEnable}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.inner}>
        {step === 'enter' ? (
          <PinPad
            value={firstPin}
            onChange={handleFirstChange}
            label={pl.auth.setup.stepEnter}
            error={error}
          />
        ) : (
          <PinPad
            value={confirmPin}
            onChange={handleConfirmChange}
            label={pl.auth.setup.stepConfirm}
          />
        )}
      </View>
    </View>
  );
}
