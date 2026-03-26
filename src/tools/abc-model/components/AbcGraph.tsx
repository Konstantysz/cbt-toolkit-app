import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Svg, Defs, Marker, Path, Line, Rect, Text as SvgText } from 'react-native-svg';
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
const W = 300;  // viewBox width
const H = 310;  // viewBox height

// Node centers
const A = { x: 150, y: 30, w: 150, h: 36 };
const B = { x: 150, y: 126, w: 124, h: 36 };
const C1 = { x: 58,  y: 206, w: 114, h: 36 };
const C2 = { x: 242, y: 206, w: 114, h: 36 };
const C3 = { x: 150, y: 284, w: 170, h: 36 };

function nodeRect(n: typeof A) {
  return { x: n.x - n.w / 2, y: n.y - n.h / 2, width: n.w, height: n.h };
}

export function AbcGraph({
  situation, thoughts, behaviors, emotions, physicalSymptoms,
}: AbcGraphProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <Marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <Path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#3a3a3a" />
          </Marker>
          <Marker id="arrow-start" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto-start-reverse">
            <Path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#3a3a3a" />
          </Marker>
        </Defs>

        {/* A → B (one-way, straight) */}
        <Line
          x1={A.x} y1={A.y + A.h / 2 + 2}
          x2={B.x} y2={B.y - B.h / 2 - 2}
          stroke="#3a3a3a" strokeWidth="1.5"
          markerEnd="url(#arrow)"
        />

        {/* B ↔ C1 */}
        <Line
          x1={B.x - B.w / 2 + 4} y1={B.y + 10}
          x2={C1.x + C1.w / 2 - 4} y2={C1.y - 10}
          stroke="#3a3a3a" strokeWidth="1.5"
          markerEnd="url(#arrow)" markerStart="url(#arrow-start)"
        />

        {/* B ↔ C2 */}
        <Line
          x1={B.x + B.w / 2 - 4} y1={B.y + 10}
          x2={C2.x - C2.w / 2 + 4} y2={C2.y - 10}
          stroke="#3a3a3a" strokeWidth="1.5"
          markerEnd="url(#arrow)" markerStart="url(#arrow-start)"
        />

        {/* B ↔ C3 */}
        <Line
          x1={B.x} y1={B.y + B.h / 2 + 2}
          x2={C3.x} y2={C3.y - C3.h / 2 - 2}
          stroke="#3a3a3a" strokeWidth="1.5"
          markerEnd="url(#arrow)" markerStart="url(#arrow-start)"
        />

        {/* C1 ↔ C2 curved (top arc) */}
        <Path
          d={`M ${C1.x + C1.w / 2} ${C1.y - 8} Q 150 ${B.y + B.h / 2 + 14} ${C2.x - C2.w / 2} ${C2.y - 8}`}
          fill="none" stroke="#303030" strokeWidth="1.5"
          markerEnd="url(#arrow)" markerStart="url(#arrow-start)"
        />

        {/* C1 ↔ C3 curved (left arc) */}
        <Path
          d={`M ${C1.x - 8} ${C1.y + C1.h / 2} Q 18 ${C3.y} ${C3.x - C3.w / 2 + 8} ${C3.y + 10}`}
          fill="none" stroke="#303030" strokeWidth="1.5"
          markerEnd="url(#arrow)" markerStart="url(#arrow-start)"
        />

        {/* C2 ↔ C3 curved (right arc) */}
        <Path
          d={`M ${C2.x + 8} ${C2.y + C2.h / 2} Q 282 ${C3.y} ${C3.x + C3.w / 2 - 8} ${C3.y + 10}`}
          fill="none" stroke="#303030" strokeWidth="1.5"
          markerEnd="url(#arrow)" markerStart="url(#arrow-start)"
        />

        {/* NODE A */}
        <Rect {...nodeRect(A)} rx="9" fill="#1e1e16" stroke={colors.accent} strokeWidth="1.5" />
        <SvgText x={A.x} y={A.y - 6} textAnchor="middle" fontSize="8.5" fill={colors.accent} fontWeight="700" letterSpacing="0.8">SYTUACJA</SvgText>
        <SvgText x={A.x} y={A.y + 8} textAnchor="middle" fontSize="8.5" fill="#8a7a6a">{truncateNodeText(situation)}</SvgText>

        {/* NODE B */}
        <Rect {...nodeRect(B)} rx="9" fill="#161e16" stroke="#7a9e7e" strokeWidth="1.5" />
        <SvgText x={B.x} y={B.y - 6} textAnchor="middle" fontSize="8.5" fill="#7a9e7e" fontWeight="700" letterSpacing="0.8">MYŚLI</SvgText>
        <SvgText x={B.x} y={B.y + 8} textAnchor="middle" fontSize="8.5" fill="#6a8a6a">{truncateNodeText(thoughts)}</SvgText>

        {/* NODE C1 */}
        <Rect {...nodeRect(C1)} rx="9" fill="#1a1520" stroke="#9e7ab5" strokeWidth="1.5" />
        <SvgText x={C1.x} y={C1.y - 6} textAnchor="middle" fontSize="8" fill="#9e7ab5" fontWeight="700" letterSpacing="0.8">ZACHOWANIE</SvgText>
        <SvgText x={C1.x} y={C1.y + 8} textAnchor="middle" fontSize="8" fill="#7a6a8a">{truncateNodeText(behaviors)}</SvgText>

        {/* NODE C2 */}
        <Rect {...nodeRect(C2)} rx="9" fill="#1a1520" stroke="#c46a8a" strokeWidth="1.5" />
        <SvgText x={C2.x} y={C2.y - 6} textAnchor="middle" fontSize="8.5" fill="#c46a8a" fontWeight="700" letterSpacing="0.8">EMOCJE</SvgText>
        <SvgText x={C2.x} y={C2.y + 8} textAnchor="middle" fontSize="8.5" fill="#8a6a7a">{truncateNodeText(emotions)}</SvgText>

        {/* NODE C3 */}
        <Rect {...nodeRect(C3)} rx="9" fill="#1a1520" stroke="#c46a8a" strokeWidth="1.5" />
        <SvgText x={C3.x} y={C3.y - 6} textAnchor="middle" fontSize="8" fill="#c46a8a" fontWeight="700" letterSpacing="0.8">OBJAWY FIZJOLOGICZNE</SvgText>
        <SvgText x={C3.x} y={C3.y + 8} textAnchor="middle" fontSize="8" fill="#8a6a7a">{truncateNodeText(physicalSymptoms)}</SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
});
