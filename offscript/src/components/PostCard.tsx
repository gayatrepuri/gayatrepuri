// One post on the noticeboard (a coffee run, event, spare ticket...).
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { kindInfo } from '../lib/constants';
import { formatWhen } from '../lib/format';
import { colors, fonts, space } from '../lib/theme';
import type { FeedPost } from '../lib/types';
import { Avatar, Body, Card, Chip, ChipRow } from './ui';

const TONES = { coffee: 'butter', event: 'blue', ticket: 'butter', conference: 'blue' } as const;

export function PostCard({ post }: { post: FeedPost }) {
  const info = kindInfo(post.kind);
  const tone = (TONES as Record<string, 'butter' | 'blue'>)[post.kind] ?? 'white';
  const spots = post.capacity ? `${post.attendee_count}/${post.capacity} going` : `${post.attendee_count} going`;

  return (
    <Card tone={tone} onPress={() => router.push(`/post/${post.id}`)} style={{ marginBottom: space.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.sm }}>
        <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.5, color: colors.maroon }}>
          {info.emoji}  {info.label.toUpperCase()}
        </Text>
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.boho }}>{post.city}</Text>
      </View>

      <Text style={{ fontFamily: fonts.heading, fontSize: 21, color: colors.tamarind, marginBottom: 6 }}>
        {post.title}
      </Text>
      {post.body ? (
        <Body numberOfLines={2} style={{ marginBottom: space.sm }}>
          {post.body}
        </Body>
      ) : null}

      <Body muted style={{ fontSize: 13 }}>
        🕰 {formatWhen(post.starts_at)}
        {post.location ? `   📍 ${post.location}` : ''}
      </Body>

      {post.tags.length ? (
        <View style={{ marginTop: space.sm }}>
          <ChipRow>
            {post.tags.slice(0, 3).map((t) => (
              <Chip key={t} label={t} small />
            ))}
          </ChipRow>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.md, gap: space.sm }}>
        <Avatar name={post.author_name} url={post.author_avatar} size={28} />
        <Body style={{ fontSize: 13, flex: 1 }} numberOfLines={1}>
          {post.author_name} · {post.author_university}
        </Body>
        <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: post.i_joined ? colors.maroon : colors.boho }}>
          {post.i_joined ? '✓ ' : ''}
          {spots}
        </Text>
      </View>
      {post.is_cancelled ? (
        <Text style={{ fontFamily: fonts.bodyBold, color: colors.danger, marginTop: space.sm }}>Cancelled</Text>
      ) : null}
    </Card>
  );
}
