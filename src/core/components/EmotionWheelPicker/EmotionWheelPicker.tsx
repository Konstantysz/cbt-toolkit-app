import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenReaderEnabled } from '../../a11y';
import { pl } from '../../i18n/pl';
import { useColors } from '../../theme/useColors';
import { spacing, HIT_SLOP } from '../../theme';
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
  const { mode: storedMode, isLoading, setMode } = usePickerMode();
  const screenReader = useScreenReaderEnabled();
  if (isLoading) return null;
  // The wheel is purely visual: screen-reader users always get the chip list.
  const mode = screenReader ? 'chips' : storedMode;

  function toggleMode() {
    setMode(mode === 'chips' ? 'wheel' : 'chips');
  }

  return (
    <View>
      {!screenReader && (
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.toggleBtn}
            onPress={toggleMode}
            activeOpacity={0.7}
            hitSlop={HIT_SLOP}
            accessibilityLabel={
              mode === 'chips' ? pl.emotionPicker.modeWheel : pl.emotionPicker.modeList
            }
            accessibilityHint={mode === 'chips' ? pl.a11y.pickerToWheel : pl.a11y.pickerToList}
          >
            <Ionicons
              name={mode === 'chips' ? 'radio-button-on' : 'apps'}
              size={14}
              color={colors.textMuted}
            />
            <Text style={styles.toggleText}>
              {mode === 'chips' ? pl.emotionPicker.modeWheel : pl.emotionPicker.modeList}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'chips' ? (
        <ChipView nodes={feelingsWheel} selected={selected} onChange={onChange} />
      ) : (
        <WheelView nodes={feelingsWheel} selected={selected} onChange={onChange} />
      )}
    </View>
  );
}
