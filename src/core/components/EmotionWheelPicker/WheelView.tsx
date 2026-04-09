// src/core/components/EmotionWheelPicker/WheelView.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme';
import type { EmotionNode } from '../../data/feelingsWheel';
import type { Emotion } from '../../types';

interface Props {
  nodes: EmotionNode[];
  selected: Emotion[];
  onChange: (emotions: Emotion[]) => void;
}

interface TooltipState {
  label: string;
  color: string;
}

function degToRad(deg: number) {
  return ((deg - 90) * Math.PI) / 180;
}

function polarToXY(cx: number, cy: number, r: number, deg: number) {
  const rad = degToRad(deg);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  startDeg: number,
  endDeg: number
): string {
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const s1 = polarToXY(cx, cy, r1, startDeg);
  const e1 = polarToXY(cx, cy, r1, endDeg);
  const s2 = polarToXY(cx, cy, r2, startDeg);
  const e2 = polarToXY(cx, cy, r2, endDeg);
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${r1} ${r1} 0 ${largeArc} 1 ${e1.x} ${e1.y}`,
    `L ${e2.x} ${e2.y}`,
    `A ${r2} ${r2} 0 ${largeArc} 0 ${s2.x} ${s2.y}`,
    'Z',
  ].join(' ');
}

function midpointXY(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  return polarToXY(cx, cy, r, (startDeg + endDeg) / 2);
}

/** Returns '#fff' or '#222' depending on background luminance. */
function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#222' : '#fff';
}

function useStyles() {
  const colors = useColors();
  return StyleSheet.create({
    container: { alignItems: 'center' },
    tooltip: {
      marginTop: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    tooltipText: { fontSize: 14, color: colors.text },
  });
}

export function WheelView({ nodes, selected, onChange }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const SIZE = Math.min(width - 40, 340);
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R_INNER = SIZE * 0.17;
  const R_MID = SIZE * 0.34;
  const R_OUTER = SIZE * 0.5;

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  function addEmotion(label: string, color: string) {
    setTooltip({ label, color });
    if (selected.some((e) => e.name === label)) {
      onChange(selected.filter((e) => e.name !== label));
    } else {
      onChange([...selected, { name: label, intensityBefore: 50 }]);
    }
  }

  const sectors = useMemo(() => {
    const selectedNames = new Set(selected.map((e) => e.name));
    const result: React.ReactNode[] = [];
    const N_ROOTS = nodes.length;
    const ROOT_DEG = 360 / N_ROOTS;
    const N_L2 = 6;
    const L2_DEG = ROOT_DEG / N_L2;
    const N_L3 = 3;
    const L3_DEG = L2_DEG / N_L3;

    nodes.forEach((root, ri) => {
      const rootStart = ri * ROOT_DEG;
      const rootEnd = rootStart + ROOT_DEG;
      const isRootSelected = selectedNames.has(root.label);

      result.push(
        <Path
          key={`root-${root.key}`}
          d={arcPath(CX, CY, 0, R_INNER, rootStart, rootEnd)}
          fill={root.color}
          opacity={isRootSelected ? 1 : 0.75}
          onPress={() => addEmotion(root.label, root.color)}
          accessible
          accessibilityRole="button"
          accessibilityLabel={root.label}
          accessibilityHint="Dodaj emocję"
        />
      );

      const innerMid = midpointXY(CX, CY, R_INNER * 0.55, rootStart, rootEnd);
      result.push(
        <SvgText
          key={`root-label-${root.key}`}
          x={innerMid.x}
          y={innerMid.y}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={9}
          fill={contrastColor(root.color)}
          fontWeight="600"
          pointerEvents="none"
        >
          {root.label}
        </SvgText>
      );

      root.children?.forEach((l2, l2i) => {
        const l2Start = rootStart + l2i * L2_DEG;
        const l2End = l2Start + L2_DEG;
        const isL2Selected = selectedNames.has(l2.label);

        result.push(
          <Path
            key={`l2-${l2.key}`}
            d={arcPath(CX, CY, R_INNER, R_MID, l2Start, l2End)}
            fill={l2.color}
            opacity={isL2Selected ? 1 : 0.6}
            onPress={() => addEmotion(l2.label, l2.color)}
            accessible
            accessibilityRole="button"
            accessibilityLabel={l2.label}
            accessibilityHint="Dodaj emocję"
          />
        );

        const midAngle = (l2Start + l2End) / 2;
        const midMid = midpointXY(CX, CY, (R_INNER + R_MID) / 2, l2Start, l2End);
        const needsFlip = midAngle > 90 && midAngle < 270;
        result.push(
          <G
            key={`l2-label-${l2.key}`}
            rotation={needsFlip ? midAngle + 180 : midAngle}
            origin={`${midMid.x},${midMid.y}`}
          >
            <SvgText
              x={midMid.x}
              y={midMid.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={7}
              fill={contrastColor(l2.color)}
              pointerEvents="none"
            >
              {l2.label.length > 8 ? l2.label.slice(0, 7) + '…' : l2.label}
            </SvgText>
          </G>
        );

        l2.children?.forEach((l3, l3i) => {
          const l3Start = l2Start + l3i * L3_DEG;
          const l3End = l3Start + L3_DEG;
          const isL3Selected = selectedNames.has(l3.label);

          result.push(
            <Path
              key={`l3-${l3.key}`}
              d={arcPath(CX, CY, R_MID, R_OUTER, l3Start, l3End)}
              fill={l3.color}
              opacity={isL3Selected ? 1 : 0.45}
              stroke={colors.bg}
              strokeWidth={0.5}
              onPress={() => addEmotion(l3.label, l3.color)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={l3.label}
              accessibilityHint="Dodaj emocję"
            />
          );
        });
      });
    });

    return result;
  }, [nodes, selected, SIZE]);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {sectors}
      </Svg>
      {tooltip && (
        <View style={styles.tooltip}>
          <Text style={[styles.tooltipText, { color: tooltip.color }]}>{tooltip.label}</Text>
        </View>
      )}
    </View>
  );
}
