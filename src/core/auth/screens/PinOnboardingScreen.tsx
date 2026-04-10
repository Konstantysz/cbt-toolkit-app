import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useColors } from '../../theme/useColors';
import { useSettings } from '../../settings/store';
import { pl } from '../../i18n/pl';
import { spacing, radius } from '../../theme';

export interface PinOnboardingScreenProps {
  onSetup: () => void;
  onSkip: () => void;
}

export function PinOnboardingScreen({ onSetup, onSkip }: PinOnboardingScreenProps) {
  const colors = useColors();
  const setPinOnboardingShown = useSettings((s) => s.setPinOnboardingShown);

  const s = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        content: {
          flex: 1,
          padding: spacing.lg,
          justifyContent: 'center',
          gap: spacing.md,
        },
        title: { fontSize: 24, fontWeight: '700', color: colors.text },
        description: { fontSize: 16, color: colors.textMuted, lineHeight: 24 },
        warning: {
          fontSize: 13,
          color: colors.textDim,
          lineHeight: 20,
          padding: spacing.sm,
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.sm,
        },
        setupButton: {
          backgroundColor: colors.accent,
          borderRadius: radius.md,
          padding: spacing.md,
          alignItems: 'center',
          marginTop: spacing.lg,
        },
        setupButtonText: { fontSize: 16, fontWeight: '700', color: colors.bg },
        skipButton: { alignItems: 'center', padding: spacing.md },
        skipButtonText: { fontSize: 15, color: colors.textMuted },
      }),
    [colors]
  );

  function handleSkip() {
    setPinOnboardingShown(true);
    onSkip();
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>{pl.auth.onboarding.title}</Text>
      <Text style={s.description}>{pl.auth.onboarding.description}</Text>
      <Text style={s.warning}>{pl.auth.onboarding.warning}</Text>
      <TouchableOpacity style={s.setupButton} onPress={onSetup}>
        <Text style={s.setupButtonText}>{pl.auth.onboarding.setupButton}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.skipButton} onPress={handleSkip}>
        <Text style={s.skipButtonText}>{pl.auth.onboarding.skipButton}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
