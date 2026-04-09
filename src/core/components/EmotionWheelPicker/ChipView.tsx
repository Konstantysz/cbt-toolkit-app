import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme';
import type { EmotionNode } from '../../data/feelingsWheel';
import type { Emotion } from '../../types';

interface Props {
  nodes: EmotionNode[];
  selected: Emotion[];
  onChange: (emotions: Emotion[]) => void;
}

function useStyles() {
  const colors = useColors();
  return StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: spacing.sm,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipActive: { borderWidth: 2 },
    chipSelected: { backgroundColor: colors.accentDim },
    chipText: { fontSize: 13, color: colors.textMuted },
    chipTextActive: { fontWeight: '600', color: colors.text },
    addButton: {
      paddingHorizontal: 12,
      paddingVertical: spacing.sm,
      borderRadius: 10,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.accent,
    },
    addText: { fontSize: 13, color: colors.accent },
    section: { marginTop: spacing.sm },
  });
}

export function ChipView({ nodes, selected, onChange }: Props) {
  const styles = useStyles();
  const [expandedL1, setExpandedL1] = useState<string | null>(null);
  const [expandedL2, setExpandedL2] = useState<string | null>(null);

  const selectedNames = new Set(selected.map((e) => e.name));

  function addEmotion(label: string) {
    if (selectedNames.has(label)) {
      onChange(selected.filter((e) => e.name !== label));
    } else {
      onChange([...selected, { name: label, intensityBefore: 50 }]);
    }
  }

  function toggleL1(key: string) {
    if (expandedL1 === key) {
      setExpandedL1(null);
      setExpandedL2(null);
    } else {
      setExpandedL1(key);
      setExpandedL2(null);
    }
  }

  function toggleL2(key: string) {
    setExpandedL2(expandedL2 === key ? null : key);
  }

  const expandedRoot = expandedL1 ? (nodes.find((n) => n.key === expandedL1) ?? null) : null;
  const expandedL2Node =
    expandedRoot && expandedL2
      ? (expandedRoot.children?.find((n) => n.key === expandedL2) ?? null)
      : null;

  return (
    <View>
      {/* Level 1 — root categories */}
      <View style={styles.row}>
        {nodes.map((root) => {
          const isActive = expandedL1 === root.key;
          return (
            <TouchableOpacity
              key={root.key}
              style={[styles.chip, isActive && [styles.chipActive, { borderColor: root.color }]]}
              onPress={() => toggleL1(root.key)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={root.label}
              accessibilityHint="Rozwiń kategorię emocji"
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{root.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Expanded level-1 section */}
      {expandedRoot !== null && (
        <View style={styles.section}>
          {/* "Dodaj [root]" button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addEmotion(expandedRoot.label)}
            accessibilityRole="button"
            accessibilityLabel={`Dodaj ${expandedRoot.label}`}
          >
            <Text style={styles.addText}>Dodaj {expandedRoot.label}</Text>
          </TouchableOpacity>

          {/* Level 2 chips */}
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            {expandedRoot.children?.map((l2) => {
              const isActive = expandedL2 === l2.key;
              return (
                <TouchableOpacity
                  key={l2.key}
                  style={[styles.chip, isActive && [styles.chipActive, { borderColor: l2.color }]]}
                  onPress={() => toggleL2(l2.key)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={l2.label}
                  accessibilityHint="Rozwiń podkategorię emocji"
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {l2.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Expanded level-2 section */}
          {expandedL2Node !== null && (
            <View style={styles.section}>
              {/* "Dodaj [l2]" button */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addEmotion(expandedL2Node.label)}
                accessibilityRole="button"
                accessibilityLabel={`Dodaj ${expandedL2Node.label}`}
              >
                <Text style={styles.addText}>Dodaj {expandedL2Node.label}</Text>
              </TouchableOpacity>

              {/* Level 3 chips */}
              <View style={[styles.row, { marginTop: spacing.sm }]}>
                {expandedL2Node.children?.map((l3) => {
                  const isSelected = selectedNames.has(l3.label);
                  return (
                    <TouchableOpacity
                      key={l3.key}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => addEmotion(l3.label)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={l3.label}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text style={[styles.chipText, isSelected && { color: l3.color }]}>
                        {l3.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
