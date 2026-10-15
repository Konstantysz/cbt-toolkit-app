import React, { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme/useColors';

/** Opaque cover shown whenever the app is not active (app switcher, control centre). */
export function PrivacyCover(): React.JSX.Element | null {
  const colors = useColors();
  const [active, setActive] = useState(true);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => setActive(next === 'active'));
    return () => sub.remove();
  }, []);

  if (active) return null;
  return (
    <View
      testID="privacy-cover"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="lock-closed-outline" size={48} color={colors.textDim} />
    </View>
  );
}
