// An ornate gilded picture frame around someone's photo (like the mood board frame).
import { Image, Text, View } from 'react-native';
import { colors, fonts } from '../lib/theme';

const W = 300;
const H = 380;
const B = 34; // frame thickness

const FRAME = require('../../assets/frame.png');

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
          <Text style={{ fontFamily: fonts.heading, fontSize: 52 * scale, color: colors.maroon }}>{initials}</Text>
        )}
      </View>
      {/* realistic gilded frame (assets/frame.png, made by scripts/stickers/render.mjs) */}
      <Image source={FRAME} style={{ position: 'absolute', width, height }} resizeMode="stretch" />
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
