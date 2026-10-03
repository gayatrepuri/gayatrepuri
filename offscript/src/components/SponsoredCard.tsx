// A sponsor card on the Board: an ad, a sponsored event or a member perk.
// Always clearly marked "Sponsored" (UK ad rules require it).
// Views and taps are counted so you can show sponsors how it went.
import { useEffect } from 'react';
import { Image, Linking, Text, View } from 'react-native';
import { formatWhen } from '../lib/format';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius, space } from '../lib/theme';
import type { Sponsored } from '../lib/types';
import { Sticker, type StickerName } from './Sticker';
import { Body, Button, Card } from './ui';

const STICKER: Record<Sponsored['kind'], StickerName> = { ad: 'sparkle', event: 'ticket', perk: 'star' };
const TAG: Record<Sponsored['kind'], string> = { ad: 'Sponsored', event: 'Sponsored event', perk: 'Member perk · sponsored' };

// count each card once per app session (the database also ignores repeats)
const seen = new Set<string>();

export function SponsoredCard({ ad }: { ad: Sponsored }) {
  useEffect(() => {
    if (seen.has(ad.id)) return;
    seen.add(ad.id);
    supabase.rpc('log_sponsored', { sid: ad.id, what: 'view' }).then(() => {});
  }, [ad.id]);

  const open = () => {
    if (!ad.link_url) return;
    supabase.rpc('log_sponsored', { sid: ad.id, what: 'tap' }).then(() => {});
    Linking.openURL(ad.link_url);
  };

  return (
    <View style={{ marginBottom: space.xl, marginTop: space.sm }}>
      <Card tone="white" onPress={ad.link_url ? open : undefined} style={{ borderWidth: 1.5, borderColor: colors.blueStripe, paddingTop: space.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.sm }}>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 10,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: colors.blueInk,
              backgroundColor: colors.blueWash,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: radius.pill,
              overflow: 'hidden',
            }}
          >
            {TAG[ad.kind]}
          </Text>
          <Body muted numberOfLines={1} style={{ fontSize: 12, flex: 1 }}>
            {ad.sponsor_name}
          </Body>
        </View>

        {ad.image_url ? (
          <Image
            source={{ uri: ad.image_url }}
            accessibilityIgnoresInvertColors
            style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: radius.md, marginBottom: space.md, backgroundColor: colors.blueWash }}
          />
        ) : null}

        <Text style={{ fontFamily: fonts.heading, fontSize: 18, lineHeight: 25, color: colors.tamarind, marginBottom: 6, paddingRight: 30 }}>
          {ad.title}
        </Text>
        {ad.kind === 'event' && (ad.event_starts_at || ad.event_location) ? (
          <Body muted style={{ fontSize: 12, marginBottom: 6 }}>
            {[ad.event_starts_at ? formatWhen(ad.event_starts_at) : null, ad.event_location].filter(Boolean).join(' · ')}
          </Body>
        ) : null}
        {ad.body ? <Body style={{ fontSize: 14 }}>{ad.body}</Body> : null}

        {ad.link_url ? (
          <Button
            title={ad.button_label || (ad.kind === 'event' ? 'Get tickets' : 'Find out more')}
            variant="blue"
            onPress={open}
            style={{ marginTop: space.md }}
          />
        ) : null}
      </Card>
      <View pointerEvents="none" style={{ position: 'absolute', top: -14, right: 14, transform: [{ rotate: '10deg' }] }}>
        <Sticker name={STICKER[ad.kind]} size={46} />
      </View>
    </View>
  );
}
