import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Svg, Path, Line, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../../../core/theme';

export interface AbcGraphProps {
  situation: string;
  thoughts: string;
  behaviors: string;
  emotions: string;
  physicalSymptoms: string;
}

export function truncateNodeText(text: string, maxLen = 40): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

// Node geometry constants
const W = 300; // viewBox width
const H = 310; // viewBox height

// Node centers
const A = { x: 150, y: 30, w: 150, h: 36 };
const B = { x: 150, y: 126, w: 124, h: 36 };
const C1 = { x: 58, y: 206, w: 114, h: 36 };
const C2 = { x: 242, y: 206, w: 114, h: 36 };
const C3 = { x: 150, y: 284, w: 170, h: 36 };

function nodeRect(n: typeof A) {
  return { x: n.x - n.w / 2, y: n.y - n.h / 2, width: n.w, height: n.h };
}

/**
 * Returns SVG path `d` for a filled arrowhead at (toX,toY) pointing in the
 * direction from (fromX,fromY). Replaces Defs/Marker which fail in release APKs.
 */
export function arrowPath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  size = 7
): string {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const p1x = toX - size * Math.cos(angle - Math.PI / 6);
  const p1y = toY - size * Math.sin(angle - Math.PI / 6);
  const p2x = toX - size * Math.cos(angle + Math.PI / 6);
  const p2y = toY - size * Math.sin(angle + Math.PI / 6);
  return `M ${toX} ${toY} L ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)} Z`;
}

export function AbcGraph({
  situation,
  thoughts,
  behaviors,
  emotions,
  physicalSymptoms,
}: AbcGraphProps): React.JSX.Element {
  // Straight line endpoints
  const ab = { x1: A.x, y1: A.y + A.h / 2 + 2, x2: B.x, y2: B.y - B.h / 2 - 2 };
  const bc1 = { x1: B.x - B.w / 2 + 4, y1: B.y + 10, x2: C1.x + C1.w / 2 - 4, y2: C1.y - 10 };
  const bc2 = { x1: B.x + B.w / 2 - 4, y1: B.y + 10, x2: C2.x - C2.w / 2 + 4, y2: C2.y - 10 };
  const bc3 = { x1: B.x, y1: B.y + B.h / 2 + 2, x2: C3.x, y2: C3.y - C3.h / 2 - 2 };

  // Quadratic bezier curves — control points used for tangent-based arrowheads
  const c12 = {
    sx: C1.x + C1.w / 2,
    sy: C1.y - 8,
    cx: 150,
    cy: B.y + B.h / 2 + 14,
    ex: C2.x - C2.w / 2,
    ey: C2.y - 8,
  };
  const c13 = {
    sx: C1.x - 8,
    sy: C1.y + C1.h / 2,
    cx: 18,
    cy: C3.y,
    ex: C3.x - C3.w / 2 + 8,
    ey: C3.y + 10,
  };
  const c23 = {
    sx: C2.x + 8,
    sy: C2.y + C2.h / 2,
    cx: 282,
    cy: C3.y,
    ex: C3.x + C3.w / 2 - 8,
    ey: C3.y + 10,
  };

  return (
    <View style={styles.container}>
      <Svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* A → B (one-way) */}
        <Line x1={ab.x1} y1={ab.y1} x2={ab.x2} y2={ab.y2} stroke="#3a3a3a" strokeWidth="1.5" />
        <Path d={arrowPath(ab.x1, ab.y1, ab.x2, ab.y2)} fill="#3a3a3a" />

        {/* B ↔ C1 */}
        <Line x1={bc1.x1} y1={bc1.y1} x2={bc1.x2} y2={bc1.y2} stroke="#3a3a3a" strokeWidth="1.5" />
        <Path d={arrowPath(bc1.x1, bc1.y1, bc1.x2, bc1.y2)} fill="#3a3a3a" />
        <Path d={arrowPath(bc1.x2, bc1.y2, bc1.x1, bc1.y1)} fill="#3a3a3a" />

        {/* B ↔ C2 */}
        <Line x1={bc2.x1} y1={bc2.y1} x2={bc2.x2} y2={bc2.y2} stroke="#3a3a3a" strokeWidth="1.5" />
        <Path d={arrowPath(bc2.x1, bc2.y1, bc2.x2, bc2.y2)} fill="#3a3a3a" />
        <Path d={arrowPath(bc2.x2, bc2.y2, bc2.x1, bc2.y1)} fill="#3a3a3a" />

        {/* B ↔ C3 */}
        <Line x1={bc3.x1} y1={bc3.y1} x2={bc3.x2} y2={bc3.y2} stroke="#3a3a3a" strokeWidth="1.5" />
        <Path d={arrowPath(bc3.x1, bc3.y1, bc3.x2, bc3.y2)} fill="#3a3a3a" />
        <Path d={arrowPath(bc3.x2, bc3.y2, bc3.x1, bc3.y1)} fill="#3a3a3a" />

        {/* C1 ↔ C2 curved (top arc) */}
        <Path
          d={`M ${c12.sx} ${c12.sy} Q ${c12.cx} ${c12.cy} ${c12.ex} ${c12.ey}`}
          fill="none"
          stroke="#303030"
          strokeWidth="1.5"
        />
        <Path d={arrowPath(c12.cx, c12.cy, c12.ex, c12.ey)} fill="#303030" />
        <Path d={arrowPath(c12.cx, c12.cy, c12.sx, c12.sy)} fill="#303030" />

        {/* C1 ↔ C3 curved (left arc) */}
        <Path
          d={`M ${c13.sx} ${c13.sy} Q ${c13.cx} ${c13.cy} ${c13.ex} ${c13.ey}`}
          fill="none"
          stroke="#303030"
          strokeWidth="1.5"
        />
        <Path d={arrowPath(c13.cx, c13.cy, c13.ex, c13.ey)} fill="#303030" />
        <Path d={arrowPath(c13.cx, c13.cy, c13.sx, c13.sy)} fill="#303030" />

        {/* C2 ↔ C3 curved (right arc) */}
        <Path
          d={`M ${c23.sx} ${c23.sy} Q ${c23.cx} ${c23.cy} ${c23.ex} ${c23.ey}`}
          fill="none"
          stroke="#303030"
          strokeWidth="1.5"
        />
        <Path d={arrowPath(c23.cx, c23.cy, c23.ex, c23.ey)} fill="#303030" />
        <Path d={arrowPath(c23.cx, c23.cy, c23.sx, c23.sy)} fill="#303030" />

        {/* NODE A */}
        <Rect {...nodeRect(A)} rx="9" fill="#1e1e16" stroke={colors.accent} strokeWidth="1.5" />
        <SvgText
          x={A.x}
          y={A.y - 6}
          textAnchor="middle"
          fontSize="8.5"
          fill={colors.accent}
          fontWeight="700"
          letterSpacing="0.8"
        >
          SYTUACJA
        </SvgText>
        <SvgText x={A.x} y={A.y + 8} textAnchor="middle" fontSize="8.5" fill="#8a7a6a">
          {truncateNodeText(situation)}
        </SvgText>

        {/* NODE B */}
        <Rect {...nodeRect(B)} rx="9" fill="#161e16" stroke="#7a9e7e" strokeWidth="1.5" />
        <SvgText
          x={B.x}
          y={B.y - 6}
          textAnchor="middle"
          fontSize="8.5"
          fill="#7a9e7e"
          fontWeight="700"
          letterSpacing="0.8"
        >
          MYŚLI
        </SvgText>
        <SvgText x={B.x} y={B.y + 8} textAnchor="middle" fontSize="8.5" fill="#6a8a6a">
          {truncateNodeText(thoughts)}
        </SvgText>

        {/* NODE C1 */}
        <Rect {...nodeRect(C1)} rx="9" fill="#1a1520" stroke="#9e7ab5" strokeWidth="1.5" />
        <SvgText
          x={C1.x}
          y={C1.y - 6}
          textAnchor="middle"
          fontSize="8"
          fill="#9e7ab5"
          fontWeight="700"
          letterSpacing="0.8"
        >
          ZACHOWANIE
        </SvgText>
        <SvgText x={C1.x} y={C1.y + 8} textAnchor="middle" fontSize="8" fill="#7a6a8a">
          {truncateNodeText(behaviors)}
        </SvgText>

        {/* NODE C2 */}
        <Rect {...nodeRect(C2)} rx="9" fill="#1a1520" stroke="#c46a8a" strokeWidth="1.5" />
        <SvgText
          x={C2.x}
          y={C2.y - 6}
          textAnchor="middle"
          fontSize="8.5"
          fill="#c46a8a"
          fontWeight="700"
          letterSpacing="0.8"
        >
          EMOCJE
        </SvgText>
        <SvgText x={C2.x} y={C2.y + 8} textAnchor="middle" fontSize="8.5" fill="#8a6a7a">
          {truncateNodeText(emotions)}
        </SvgText>

        {/* NODE C3 */}
        <Rect {...nodeRect(C3)} rx="9" fill="#1a1520" stroke="#c46a8a" strokeWidth="1.5" />
        <SvgText
          x={C3.x}
          y={C3.y - 6}
          textAnchor="middle"
          fontSize="8"
          fill="#c46a8a"
          fontWeight="700"
          letterSpacing="0.8"
        >
          OBJAWY FIZJOLOGICZNE
        </SvgText>
        <SvgText x={C3.x} y={C3.y + 8} textAnchor="middle" fontSize="8" fill="#8a6a7a">
          {truncateNodeText(physicalSymptoms)}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
});
