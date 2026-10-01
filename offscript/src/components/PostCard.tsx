// One post on the noticeboard, like a scrap pinned to a board.
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { kindInfo } from '../lib/constants';
import { formatWhen } from '../lib/format';
import { colors, fonts, space } from '../lib/theme';
import type { FeedPost } from '../lib/types';
import { Sticker } from './Sticker';
import { Avatar, Body, Card } from './ui';

const TONES = {
  coffee: 'cream',
  study: 'blue',
  event: 'butter',
  rant: 'kraft',
  collab: 'cream',
  ticket: 'kraft',
  study_participants: 'blue',
  conference: 'butter',
  other: 'cream',
} as const;

// the same post always gets the same little tilt
export function tiltFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 5) - 2) * 0.8;
}

export function PostCard({ post }: { post: FeedPost }) {
  const info = kindInfo(post.kind);
  const going = post.capacity ? `${post.attendee_count}/${post.capacity}` : `${post.attendee_count}`;

  return (
    <View style={{ marginBottom: space.xl, marginTop: space.sm }}>
      <Card tone={TONES[post.kind]} tilt={tiltFor(post.id)} onPress={() => router.push(`/post/${post.id}`)} style={{ paddingTop: space.xl }}>
        <Text style={{ fontFamily: fonts.heading, fontSize: 21, color: colors.tamarind, marginBottom: 6, paddingRight: 30 }}>
          {post.title}
        </Text>
        <Body muted style={{ fontSize: 12 }}>
          {formatWhen(post.starts_at)}
          {post.location ? ` · ${post.location}` : ''}
        </Body>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.md, gap: space.sm }}>
          <Avatar name={post.author_name} url={post.author_avatar} size={26} />
          <Body style={{ fontSize: 12, flex: 1 }} numberOfLines={1}>
            {post.author_name}
          </Body>
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: colors.maroon }}>
            {post.i_joined ? '✓ ' : ''}
            {going} going
          </Text>
        </View>
      </Card>
      {/* the sticker "pins" the card to the board */}
      <View style={{ position: 'absolute', top: -14, right: 10, transform: [{ rotate: `${tiltFor(post.id) * 4}deg` }] }}>
        <Sticker name={info.sticker} size={48} />
      </View>
    </View>
  );
}
