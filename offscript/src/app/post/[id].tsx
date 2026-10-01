// One post in full: details, who's going, join / leave, group chat.
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { ReportModal } from '../../components/ReportModal';
import { Avatar, Body, Button, Card, Chip, ChipRow, H1, Label, Loading, Screen } from '../../components/ui';
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

  const load = useCallback(async () => {
    const { data } = await supabase.from('feed_posts').select('*').eq('id', id).maybeSingle();
    setPost(data as FeedPost | null);
    const { data: att } = await supabase.from('post_attendees').select('user_id').eq('post_id', id);
    const ids = (att ?? []).map((a) => a.user_id);
    if (ids.length) {
      const { data: ppl } = await supabase.from('public_profiles').select('*').in('id', ids);
      setPeople((ppl as PublicProfile[]) ?? []);
    } else setPeople([]);
  }, [id]);

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
    if (!handleError(error)) load();
  };
  const leave = async () => {
    setBusy(true);
    await supabase.from('post_attendees').delete().eq('post_id', id).eq('user_id', userId);
    setBusy(false);
    load();
  };
  const cancel = () =>
    Alert.alert('Cancel this?', 'People who joined will see it’s cancelled.', [
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

  return (
    <Screen>
      <Body style={{ fontWeight: '700', color: colors.maroon, letterSpacing: 1.5, fontSize: 12 }}>
        {info.emoji}  {info.label.toUpperCase()} · {post.city.toUpperCase()}
      </Body>
      <H1 style={{ marginTop: space.sm }}>{post.title}</H1>

      <Card tone="butter" style={{ marginTop: space.lg }}>
        <Body>🕰  {formatWhen(post.starts_at)}</Body>
        {post.location ? <Body style={{ marginTop: 4 }}>📍  {post.location}</Body> : null}
        <Body style={{ marginTop: 4 }}>
          👥  {post.attendee_count} going{post.capacity ? ` · ${post.capacity} max` : ''}
        </Body>
      </Card>

      {post.body ? <Body style={{ marginTop: space.lg }}>{post.body}</Body> : null}
      {post.tags.length ? (
        <View style={{ marginTop: space.md }}>
          <ChipRow>
            {post.tags.map((t) => (
              <Chip key={t} label={t} small />
            ))}
          </ChipRow>
        </View>
      ) : null}

      <Label>{'\n'}Hosted by</Label>
      <Pressable onPress={() => router.push(`/person/${post.author_id}`)} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <Avatar name={post.author_name} url={post.author_avatar} />
        <View>
          <Body style={{ fontWeight: '700' }}>{post.author_name}</Body>
          <Body muted>{[post.author_field, post.author_university].filter(Boolean).join(' · ')}</Body>
        </View>
      </Pressable>

      {people.length ? (
        <>
          <Label>{'\n'}Going</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {people.map((p) => (
              <Pressable key={p.id} onPress={() => router.push(`/person/${p.id}`)} style={{ alignItems: 'center', width: 64 }}>
                <Avatar name={p.display_name} url={p.avatar_url} />
                <Body numberOfLines={1} style={{ fontSize: 12 }}>{p.display_name.split(' ')[0]}</Body>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <View style={{ marginTop: space.xl, gap: space.md }}>
        {post.is_cancelled ? (
          <Body style={{ color: colors.danger, textAlign: 'center' }}>This was cancelled.</Body>
        ) : isHost ? (
          <>
            <Button title="Open group chat" onPress={() => router.push(`/post/chat/${id}`)} />
            <Button title="Cancel this post" variant="danger" onPress={cancel} />
          </>
        ) : post.i_joined ? (
          <>
            <Button title="Open group chat" onPress={() => router.push(`/post/chat/${id}`)} />
            <Button title="I can’t make it anymore" variant="ghost" onPress={leave} loading={busy} />
          </>
        ) : (
          <Button title={full ? 'Full' : 'I’m in!'} onPress={join} loading={busy} disabled={full} />
        )}
        {!isHost ? (
          <Button title="Report post" variant="ghost" onPress={() => setReporting(true)} style={{ borderWidth: 0 }} />
        ) : null}
      </View>
      <ReportModal visible={reporting} onClose={() => setReporting(false)} reporterId={userId} targetPost={id} targetUser={post.author_id} />
    </Screen>
  );
}
