// Baby-blue & butter gingham tablecloth with little gold stars (fills its parent).
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const CHECK = 26; // size of one gingham square
const BASE = '#FFF6D6'; // butter-cream
const STRIPE = '#A9CAD6'; // baby blue (drawn see-through, so crossings come out darker)
const STAR = '#E7C65A';

const star = (x: number, y: number, r: number) =>
  `M${x} ${y - r} C${x + r * 0.15} ${y - r * 0.15} ${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y} ` +
  `C${x + r * 0.15} ${y + r * 0.15} ${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r} ` +
  `C${x - r * 0.15} ${y + r * 0.15} ${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y} ` +
  `C${x - r * 0.15} ${y - r * 0.15} ${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r} Z`;

export function Gingham() {
  const { width, height } = useWindowDimensions();

  const { cols, rows, stars } = useMemo(() => {
    const cols = Math.ceil(width / (CHECK * 2)) + 1;
    const rows = Math.ceil(height / (CHECK * 2)) + 1;
    // scatter stars on a loose grid with a fixed wobble, so they never move between renders
    const stars: { x: number; y: number; r: number }[] = [];
    let seed = 7;
    const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let y = 40; y < height; y += 120) {
      for (let x = 30; x < width; x += 110) {
        stars.push({ x: x + rand() * 60, y: y + rand() * 60, r: 7 + rand() * 7 });
      }
    }
    return { cols, rows, stars };
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill={BASE} />
        {Array.from({ length: cols }, (_, i) => (
          <Rect key={`v${i}`} x={i * CHECK * 2} y={0} width={CHECK} height={height} fill={STRIPE} opacity={0.5} />
        ))}
        {Array.from({ length: rows }, (_, i) => (
          <Rect key={`h${i}`} x={0} y={i * CHECK * 2} width={width} height={CHECK} fill={STRIPE} opacity={0.5} />
        ))}
        {stars.map((s, i) => (
          <Path key={i} d={star(s.x, s.y, s.r)} fill={STAR} />
        ))}
      </Svg>
    </View>
  );
}
