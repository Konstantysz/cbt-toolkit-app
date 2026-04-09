import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme';
import { feelingsWheel } from '../../data/feelingsWheel';
import { ChipView } from './ChipView';
import { WheelView } from './WheelView';
import { usePickerMode } from './usePickerMode';
import type { Emotion } from '../../types';

interface Props {
  selected: Emotion[];
  onChange: (emotions: Emotion[]) => void;
}

function useStyles() {
  const colors = useColors();
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: spacing.sm,
    },
    toggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleText: { fontSize: 12, color: colors.textMuted },
  });
}

export function EmotionWheelPicker({ selected, onChange }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { mode, isLoading, setMode } = usePickerMode();
  if (isLoading) return null;

  function toggleMode() {
    setMode(mode === 'chips' ? 'wheel' : 'chips');
  }

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity style={styles.toggleBtn} onPress={toggleMode} activeOpacity={0.7}>
          <Ionicons
            name={mode === 'chips' ? 'radio-button-on' : 'apps'}
            size={14}
            color={colors.textMuted}
          />
          <Text style={styles.toggleText}>{mode === 'chips' ? 'Koło' : 'Lista'}</Text>
        </TouchableOpacity>
      </View>

      {mode === 'chips' ? (
        <ChipView nodes={feelingsWheel} selected={selected} onChange={onChange} />
      ) : (
        <WheelView nodes={feelingsWheel} selected={selected} onChange={onChange} />
      )}
    </View>
  );
}
