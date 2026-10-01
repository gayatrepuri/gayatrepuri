// Chats: your matches + group chats for meetups you're in.
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Sticker } from '../../components/Sticker';
import { Avatar, Body, Card, Empty, H1, Label, Screen, Tap } from '../../components/ui';
import { useMe } from '../../lib/auth';
import { kindInfo } from '../../lib/constants';
import { formatWhen } from '../../lib/format';
import { supabase } from '../../lib/supabase';
import { space } from '../../lib/theme';
import type { FeedPost, PublicProfile } from '../../lib/types';

export default function Inbox() {
  const { userId } = useMe();
  const [friends, setFriends] = useState<PublicProfile[]>([]);
  const [groups, setGroups] = useState<FeedPost[]>([]);

  const load = useCallback(async () => {
    const { data: conns } = await supabase.from('connections').select('requester_id, addressee_id').eq('status', 'accepted');
    const otherIds = (conns ?? []).map((c) => (c.requester_id === userId ? c.addressee_id : c.requester_id));
    if (otherIds.length) {
      const { data } = await supabase.from('public_profiles').select('*').in('id', otherIds);
      setFriends((data as PublicProfile[]) ?? []);
    } else setFriends([]);

    const { data: joined } = await supabase.from('post_attendees').select('post_id').eq('user_id', userId);
    const joinedIds = (joined ?? []).map((j) => j.post_id);
    const filter = joinedIds.length ? `author_id.eq.${userId},id.in.(${joinedIds.join(',')})` : `author_id.eq.${userId}`;
    const { data: posts } = await supabase.from('feed_posts').select('*').or(filter).order('created_at', { ascending: false }).limit(50);
    setGroups((posts as FeedPost[]) ?? []);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen>
      <H1 style={{ textAlign: 'center', marginBottom: space.lg }}>Post</H1>

      {friends.length ? (
        <>
          <Label>Matches</Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: space.xl }}>
            <View style={{ flexDirection: 'row', gap: space.lg }}>
              {friends.map((f) => (
                <Tap key={f.id} onPress={() => router.push(`/dm/${f.id}`)} style={{ alignItems: 'center', width: 70 }}>
                  <Avatar name={f.display_name} url={f.avatar_url} size={62} />
                  <Body numberOfLines={1} style={{ fontSize: 12, marginTop: 4 }}>
                    {f.display_name.split(' ')[0]}
                  </Body>
                </Tap>
              ))}
            </View>
          </ScrollView>
        </>
      ) : null}

      <Label>Meetups</Label>
      {groups.length === 0 && friends.length === 0 ? (
        <Empty title="no letters yet" sticker="envelope" />
      ) : (
        groups.map((p) => (
          <Card key={p.id} tone="cream" onPress={() => router.push(`/post/chat/${p.id}`)} style={{ marginBottom: space.sm, padding: space.md }}>
            <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
              <Sticker name={kindInfo(p.kind).sticker} size={40} />
              <View style={{ flex: 1 }}>
                <Body bold numberOfLines={1}>{p.title}</Body>
                <Body muted style={{ fontSize: 12 }}>
                  {formatWhen(p.starts_at)} · {p.attendee_count + 1}
                </Body>
              </View>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
