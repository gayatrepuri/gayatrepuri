// One post in full: details, who's going, join / leave, group chat.
// Joining "stamps" a wax seal onto the card.
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, Animated, View } from 'react-native';
import { tiltFor } from '../../components/PostCard';
import { ReportModal } from '../../components/ReportModal';
import { Sticker } from '../../components/Sticker';
import { Avatar, Body, Button, Card, Chip, ChipRow, H1, Label, Loading, Screen, Tap, haptic } from '../../components/ui';
import { useMe } from '../../lib/auth';
import { kindInfo } from '../../lib/constants';
import { handleError } from '../../lib/errors';
import { formatWhen } from '../../lib/format';
import { supabase } from '../../lib/supabase';
import { colors, space } from '../../lib/theme';
import type { FeedPost, PublicProfile } from '../../lib/types';

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useMe();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [people, setPeople] = useState<PublicProfile[]>([]);
  const [busy, setBusy] = useState(false);
  const [reporting, setReporting] = useState(false);
  const stamp = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    const { data } = await supabase.from('feed_posts').select('*').eq('id', id).maybeSingle();
    setPost(data as FeedPost | null);
    if (data?.i_joined) stamp.setValue(1);
    const { data: att } = await supabase.from('post_attendees').select('user_id').eq('post_id', id);
    const ids = (att ?? []).map((a) => a.user_id);
    if (ids.length) {
      const { data: ppl } = await supabase.from('public_profiles').select('*').in('id', ids);
      setPeople((ppl as PublicProfile[]) ?? []);
    } else setPeople([]);
  }, [id, stamp]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!post) return <Loading />;
  const info = kindInfo(post.kind);
  const isHost = post.author_id === userId;
  const full = post.capacity != null && post.attendee_count >= post.capacity;

  const join = async () => {
    setBusy(true);
    const { error } = await supabase.from('post_attendees').insert({ post_id: id, user_id: userId });
    setBusy(false);
    if (handleError(error)) return;
    haptic('success');
    stamp.setValue(0);
    Animated.spring(stamp, { toValue: 1, useNativeDriver: true, friction: 4, tension: 120 }).start();
    load();
  };
  const leave = async () => {
    setBusy(true);
    await supabase.from('post_attendees').delete().eq('post_id', id).eq('user_id', userId);
    setBusy(false);
    stamp.setValue(0);
    load();
  };
  const cancel = () =>
    Alert.alert('Cancel this?', '', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel it',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('posts').update({ is_cancelled: true }).eq('id', id);
          router.back();
        },
      },
    ]);

  const stampStyle = {
    opacity: stamp,
    transform: [
      { scale: stamp.interpolate({ inputRange: [0, 1], outputRange: [2.4, 1] }) },
      { rotate: '-14deg' },
    ],
  };

  return (
    <Screen>
      <View>
        <Card tone="cream" tilt={tiltFor(post.id)} style={{ paddingTop: space.xl, marginTop: space.lg }}>
          <H1 style={{ fontSize: 22, lineHeight: 30, paddingRight: 40 }}>{post.title}</H1>
          <Body muted style={{ marginTop: space.sm }}>
            {formatWhen(post.starts_at)}
            {post.location ? `\n${post.location}` : ''}
          </Body>
          {post.body ? <Body style={{ marginTop: space.md }}>{post.body}</Body> : null}
          {post.tags.length ? (
            <View style={{ marginTop: space.md }}>
              <ChipRow>
                {post.tags.map((t) => (
                  <Chip key={t} label={t} small />
                ))}
              </ChipRow>
            </View>
          ) : null}
          <Body bold style={{ marginTop: space.md, color: colors.maroon }}>
            {post.attendee_count}
            {post.capacity ? `/${post.capacity}` : ''} going
          </Body>
        </Card>
        <View style={{ position: 'absolute', top: 0, right: 8 }}>
          <Sticker name={info.sticker} size={60} />
        </View>
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', bottom: -10, right: 16 }, stampStyle]}>
          <Sticker name="waxseal" size={78} />
        </Animated.View>
      </View>

      <Label>{'\n'}Host</Label>
      <Tap onPress={() => router.push(`/person/${post.author_id}`)} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <Avatar name={post.author_name} url={post.author_avatar} size={46} />
        <View>
          <Body bold>{post.author_name}</Body>
          <Body muted>{post.author_university}</Body>
        </View>
      </Tap>

      {people.length ? (
        <>
          <Label>{'\n'}Going</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {people.map((p) => (
              <Tap key={p.id} onPress={() => router.push(`/person/${p.id}`)} style={{ alignItems: 'center', width: 60 }}>
                <Avatar name={p.display_name} url={p.avatar_url} />
                <Body numberOfLines={1} style={{ fontSize: 11 }}>{p.display_name.split(' ')[0]}</Body>
              </Tap>
            ))}
          </View>
        </>
      ) : null}

      <View style={{ marginTop: space.xl, gap: space.md }}>
        {post.is_cancelled ? (
          <Body style={{ color: colors.danger, textAlign: 'center' }}>Cancelled</Body>
        ) : isHost ? (
          <>
            <Button title="Group chat" sticker="envelope" onPress={() => router.push(`/post/chat/${id}`)} />
            <Button title="Cancel post" variant="danger" onPress={cancel} />
          </>
        ) : post.i_joined ? (
          <>
            <Button title="Group chat" sticker="envelope" onPress={() => router.push(`/post/chat/${id}`)} />
            <Button title="Can’t make it" variant="ghost" onPress={leave} loading={busy} />
          </>
        ) : (
          <Button title={full ? 'Full' : 'I’m in'} sticker="waxseal" onPress={join} loading={busy} disabled={full} />
        )}
        {!isHost ? (
          <Body muted style={{ textAlign: 'center', fontSize: 12, marginTop: space.md }} onPress={() => setReporting(true)}>
            report
          </Body>
        ) : null}
      </View>
      <ReportModal visible={reporting} onClose={() => setReporting(false)} reporterId={userId} targetPost={id} targetUser={post.author_id} />
    </Screen>
  );
}
