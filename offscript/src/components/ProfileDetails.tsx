// Someone's answers, scrapbook-style: a sticker + the answer.
// Tap a sticker and it wiggles. Only answers they chose to show appear.
import { useRef } from 'react';
import { Animated, View } from 'react-native';
import { PROFILE_FIELDS } from '../lib/constants';
import { colors, space } from '../lib/theme';
import type { PublicProfile } from '../lib/types';
import { Sticker, type StickerName } from './Sticker';
import { Body, Chip, ChipRow, Label, Tap } from './ui';

function WiggleSticker({ name }: { name: StickerName }) {
  const spin = useRef(new Animated.Value(0)).current;
  const wiggle = () => {
    spin.setValue(0);
    Animated.sequence([
      Animated.timing(spin, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(spin, { toValue: -1, duration: 120, useNativeDriver: true }),
      Animated.timing(spin, { toValue: 0.6, duration: 100, useNativeDriver: true }),
      Animated.spring(spin, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };
  const rotate = spin.interpolate({ inputRange: [-1, 1], outputRange: ['-16deg', '16deg'] });
  return (
    <Tap onPress={wiggle}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Sticker name={name} size={40} />
      </Animated.View>
    </Tap>
  );
}

/** `visible` is only passed for your own profile (to preview what others see). */
export function ProfileDetails({ person, visible }: { person: PublicProfile; visible?: string[] }) {
  const shown = (key: string) => !visible || visible.includes(key);
  const rows = PROFILE_FIELDS.filter((f) => {
    if (!shown(f.key)) return false;
    const v = person[f.key as keyof PublicProfile];
    return Array.isArray(v) ? v.length > 0 : v != null && v !== '';
  });

  return (
    <View style={{ gap: space.md }}>
      {rows.map((f) => {
        const v = person[f.key as keyof PublicProfile];
        return (
          <View key={f.key} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <WiggleSticker name={f.sticker} />
            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: space.sm }}>
              <Label>{f.label}</Label>
              {Array.isArray(v) ? (
                <ChipRow>
                  {v.map((t) => (
                    <Chip key={t} label={t} small />
                  ))}
                </ChipRow>
              ) : (
                <Body>{String(v)}</Body>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
