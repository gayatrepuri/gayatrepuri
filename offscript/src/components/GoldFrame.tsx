// An ornate gold picture frame around someone's photo (like the mood board frame).
import { Image, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors, fonts } from '../lib/theme';
import { Text } from 'react-native';

const W = 300;
const H = 380;
const B = 34; // frame thickness

// one corner flourish, drawn for the top-left and mirrored for the others
const CORNER =
  'M6 46 C2 26 10 10 26 6 C40 2 50 8 48 18 C46 26 36 26 36 20 C36 15 42 15 42 19 ' +
  'M10 30 C14 20 22 14 32 14 M46 6 C56 10 60 4 70 8 M6 46 C10 56 4 60 8 70';

export function GoldFrame({
  uri,
  name,
  width = 220,
}: {
  uri?: string | null;
  name?: string | null;
  width?: number;
}) {
  const scale = width / W;
  const height = H * scale;
  const inset = (B - 2) * scale;
  const initials = (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={{ width, height }}>
      {/* the picture sits behind the frame */}
      <View
        style={{
          position: 'absolute',
          left: inset,
          top: inset,
          right: inset,
          bottom: inset,
          backgroundColor: colors.kraft,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Text style={{ fontFamily: fonts.heading, fontSize: 64 * scale, color: colors.maroon }}>{initials}</Text>
        )}
      </View>

      <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F8E7AE" />
            <Stop offset="0.35" stopColor="#D6B262" />
            <Stop offset="0.6" stopColor="#B88E3C" />
            <Stop offset="1" stopColor="#7E5A1E" />
          </LinearGradient>
          <LinearGradient id="fg2" x1="1" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#F8E7AE" />
            <Stop offset="1" stopColor="#8A6424" />
          </LinearGradient>
        </Defs>

        {/* frame body: outer rectangle with the middle cut out */}
        <Path
          fillRule="evenodd"
          d={`M0 0 H${W} V${H} H0 Z M${B} ${B} V${H - B} H${W - B} V${B} Z`}
          fill="url(#fg)"
        />
        {/* bevels */}
        <Rect x={8} y={8} width={W - 16} height={H - 16} fill="none" stroke="#8A6424" strokeWidth={1.5} opacity={0.7} />
        <Rect x={16} y={16} width={W - 32} height={H - 32} fill="none" stroke="#FBEFC4" strokeWidth={2} opacity={0.8} />
        <Rect x={24} y={24} width={W - 48} height={H - 48} fill="none" stroke="#8A6424" strokeWidth={1.2} opacity={0.6} />
        <Rect x={B - 4} y={B - 4} width={W - 2 * B + 8} height={H - 2 * B + 8} fill="none" stroke="url(#fg2)" strokeWidth={6} />

        {/* beading along the inner edge */}
        {Array.from({ length: 14 }, (_, i) => (
          <G key={i}>
            <Circle cx={B + 6 + i * ((W - 2 * B - 12) / 13)} cy={20} r={2} fill="#FBEFC4" opacity={0.7} />
            <Circle cx={B + 6 + i * ((W - 2 * B - 12) / 13)} cy={H - 20} r={2} fill="#FBEFC4" opacity={0.7} />
          </G>
        ))}

        {/* corner flourishes */}
        {[
          `translate(0 0)`,
          `translate(${W} 0) scale(-1 1)`,
          `translate(0 ${H}) scale(1 -1)`,
          `translate(${W} ${H}) scale(-1 -1)`,
        ].map((t) => (
          <G key={t} transform={t}>
            <Path d={CORNER} stroke="#7E5A1E" strokeWidth={6} fill="none" strokeLinecap="round" />
            <Path d={CORNER} stroke="#F3DC97" strokeWidth={3} fill="none" strokeLinecap="round" />
            <Circle cx={22} cy={22} r={7} fill="url(#fg)" stroke="#7E5A1E" strokeWidth={1.5} />
          </G>
        ))}

        {/* bow / shell ornament top and bottom centre */}
        {[`translate(${W / 2} 6)`, `translate(${W / 2} ${H - 6}) scale(1 -1)`].map((t) => (
          <G key={t} transform={t}>
            <Path d="M0 18 C-14 4 -30 2 -30 12 C-30 22 -14 22 0 18 Z" fill="url(#fg)" stroke="#7E5A1E" strokeWidth={1.5} />
            <Path d="M0 18 C14 4 30 2 30 12 C30 22 14 22 0 18 Z" fill="url(#fg)" stroke="#7E5A1E" strokeWidth={1.5} />
            <Circle cx={0} cy={17} r={6} fill="url(#fg)" stroke="#7E5A1E" strokeWidth={1.5} />
            <Path d="M-4 22 C-8 30 -12 34 -16 38 M4 22 C8 30 12 34 16 38" stroke="#7E5A1E" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          </G>
        ))}
      </Svg>
    </View>
  );
}

/** Small round photo with a thin gold ring (for lists and chats). */
export function GoldAvatar({ uri, name, size = 44 }: { uri?: string | null; name?: string | null; size?: number }) {
  const initials = (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: Math.max(2, size / 16),
        borderColor: colors.gold,
        backgroundColor: colors.kraft,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <Text style={{ fontFamily: fonts.heading, color: colors.maroon, fontSize: size * 0.38 }}>{initials}</Text>
      )}
    </View>
  );
}
