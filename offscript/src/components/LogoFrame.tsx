// The Offscript wordmark inside a scalloped shell frame, like an old
// restaurant or wine label ("Villa D'Cipoletti").
import type { ReactNode } from 'react';
import { Animated, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '../lib/theme';

/** Builds a scalloped oval: little outward bumps all the way round. */
function scallopPath(cx: number, cy: number, rx: number, ry: number, bumps: number, depth: number) {
  const pt = (a: number, k = 1) => [cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)];
  let d = '';
  for (let i = 0; i < bumps; i++) {
    const a1 = (i / bumps) * Math.PI * 2;
    const a2 = ((i + 1) / bumps) * Math.PI * 2;
    const [x1, y1] = pt(a1);
    const [x2, y2] = pt(a2);
    const [qx, qy] = pt((a1 + a2) / 2, 1 + depth);
    d += (i === 0 ? `M${x1.toFixed(1)} ${y1.toFixed(1)} ` : '') + `Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} `;
  }
  return d + 'Z';
}

export function LogoFrame({
  width = 260,
  color = colors.maroon,
  children,
  frameOpacity,
}: {
  width?: number;
  color?: string;
  children?: ReactNode; // replaces the word (the landing page types it in)
  frameOpacity?: Animated.Value | Animated.AnimatedInterpolation<number>;
}) {
  const h = width * 0.66;
  const cx = width / 2;
  const cy = h * 0.46;
  const rx = width * 0.44;
  const ry = h * 0.38;
  // little double scroll under the frame (k scales it with the frame size)
  const k = width / 260;
  const b = cy + ry;
  const scroll =
    `M${cx - 30 * k} ${b + 6 * k} C${cx - 18 * k} ${b + 22 * k} ${cx - 6 * k} ${b + 2 * k} ${cx} ${b + 12 * k} ` +
    `C${cx + 6 * k} ${b + 2 * k} ${cx + 18 * k} ${b + 22 * k} ${cx + 30 * k} ${b + 6 * k} ` +
    `M${cx - 30 * k} ${b + 6 * k} c${-6 * k} ${-4 * k} ${-2 * k} ${-10 * k} ${3 * k} ${-7 * k} ` +
    `M${cx + 30 * k} ${b + 6 * k} c${6 * k} ${-4 * k} ${2 * k} ${-10 * k} ${-3 * k} ${-7 * k}`;

  return (
    <View style={{ width, height: h, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', opacity: frameOpacity ?? 1 }}>
      <Svg width={width} height={h}>
        <Path d={scallopPath(cx, cy, rx, ry, 22, 0.06)} fill="none" stroke={color} strokeWidth={Math.max(1, 1.6 * k)} />
        <Path d={scallopPath(cx, cy, rx * 0.93, ry * 0.9, 22, 0.05)} fill="none" stroke={color} strokeWidth={0.8} opacity={0.7} />
        <Path d={scroll} fill="none" stroke={color} strokeWidth={Math.max(1, 1.4 * k)} strokeLinecap="round" />
      </Svg>
      </Animated.View>
      {children ?? (
      <Text
        style={{
          fontFamily: fonts.logo,
          fontSize: width * 0.2,
          color,
          marginTop: -h * 0.08,
          lineHeight: width * 0.36,
        }}
      >
        Offscript
      </Text>
      )}
    </View>
  );
}
