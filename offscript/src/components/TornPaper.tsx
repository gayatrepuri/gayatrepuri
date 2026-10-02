// Hand-torn ("deckled") paper, like handmade cotton paper.
// Wrap anything in <TornPaper width={..} height={..}> to put it on a torn sheet.
import { useMemo, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export type Edges = { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
const ALL: Edges = { top: true, right: true, bottom: true, left: true };

/** A rectangle whose chosen edges are wobbly and torn. Same seed → same tear every time. */
export function tornPath(w: number, h: number, edges: Edges = ALL, seed = 1) {
  let s = seed * 9973;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const D = 5; // how deep the tear goes
  const pts: [number, number][] = [];

  // walk one edge from (x1,y1) to (x2,y2); (nx,ny) points into the paper
  const edge = (x1: number, y1: number, x2: number, y2: number, nx: number, ny: number, torn?: boolean) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const steps = torn ? Math.max(2, Math.round(len / 5)) : 1;
    let drift = rand() * D;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      let off = 0;
      if (torn) {
        // slow wander + fine fibres + the odd bigger bite
        drift += (rand() - 0.5) * 2.2;
        drift = Math.max(0, Math.min(D, drift));
        off = drift + rand() * 1.6 + (rand() < 0.04 ? 2.5 : 0);
      }
      pts.push([x1 + (x2 - x1) * t + nx * off, y1 + (y2 - y1) * t + ny * off]);
    }
  };
  edge(0, 0, w, 0, 0, 1, edges.top);
  edge(w, 0, w, h, -1, 0, edges.right);
  edge(w, h, 0, h, 0, -1, edges.bottom);
  edge(0, h, 0, 0, 1, 0, edges.left);
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') + ' Z';
}

export function TornPaper({
  width,
  height,
  edges = ALL,
  seed = 1,
  color = '#F4EEE2',
  children,
  style,
}: {
  width: number;
  height: number;
  edges?: Edges;
  seed?: number;
  color?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { d, specks } = useMemo(() => {
    let s = seed * 31;
    const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    // tiny flecks that give the paper its cotton texture
    const specks = Array.from({ length: Math.round((width * height) / 900) }, () => ({
      x: 6 + rand() * (width - 12),
      y: 6 + rand() * (height - 12),
      r: 0.4 + rand() * 1.1,
      o: 0.05 + rand() * 0.08,
    }));
    return { d: tornPath(width, height, edges, seed), specks };
  }, [width, height, edges, seed]);

  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width + 4} height={height + 4} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Defs>
          <LinearGradient id={`paper${seed}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FBF7EE" />
            <Stop offset="1" stopColor={color} />
          </LinearGradient>
        </Defs>
        {/* soft shadow under the sheet */}
        <Path d={d} fill="#2D120D" opacity={0.14} transform="translate(1.5 2.5)" />
        <Path d={d} fill={`url(#paper${seed})`} stroke="#E2D6BF" strokeWidth={0.6} />
        {specks.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#8A7A5C" opacity={p.o} />
        ))}
      </Svg>
      {children}
    </View>
  );
}
