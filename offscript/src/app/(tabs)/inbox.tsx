// Chats: private chats with your matches + group chats for meetups you're in.
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Avatar, Body, Card, Empty, H1, H2, Screen } from '../../components/ui';
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
    const { data: conns } = await supabase
      .from('connections')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted');
    const otherIds = (conns ?? []).map((c) => (c.requester_id === userId ? c.addressee_id : c.requester_id));
    if (otherIds.length) {
      const { data } = await supabase.from('public_profiles').select('*').in('id', otherIds);
      setFriends((data as PublicProfile[]) ?? []);
    } else setFriends([]);

    const { data: joined } = await supabase.from('post_attendees').select('post_id').eq('user_id', userId);
    const joinedIds = (joined ?? []).map((j) => j.post_id);
    const filter = joinedIds.length ? `author_id.eq.${userId},id.in.(${joinedIds.join(',')})` : `author_id.eq.${userId}`;
    const { data: posts } = await supabase
      .from('feed_posts')
      .select('*')
      .or(filter)
      .order('created_at', { ascending: false })
      .limit(50);
    setGroups((posts as FeedPost[]) ?? []);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen>
      <H1 style={{ marginBottom: space.lg }}>Chats</H1>

      <H2 style={{ marginBottom: space.md }}>Your matches</H2>
      {friends.length === 0 ? (
        <Body muted style={{ marginBottom: space.xl }}>No matches yet — say hi to someone in Matches.</Body>
      ) : (
        friends.map((f) => (
          <Card key={f.id} onPress={() => router.push(`/dm/${f.id}`)} style={{ marginBottom: space.sm, padding: space.md }}>
            <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
              <Avatar name={f.display_name} url={f.avatar_url} />
              <View style={{ flex: 1 }}>
                <Body style={{ fontWeight: '700' }}>{f.display_name}</Body>
                <Body muted numberOfLines={1}>{f.research_topic ?? f.university}</Body>
              </View>
            </View>
          </Card>
        ))
      )}

      <H2 style={{ marginTop: space.xl, marginBottom: space.md }}>Meetup group chats</H2>
      {groups.length === 0 ? (
        <Empty title="no plans yet" hint="Join a coffee run on the Noticeboard and its group chat appears here." />
      ) : (
        groups.map((p) => (
          <Card key={p.id} tone="blue" onPress={() => router.push(`/post/chat/${p.id}`)} style={{ marginBottom: space.sm, padding: space.md }}>
            <Body style={{ fontWeight: '700' }}>
              {kindInfo(p.kind).emoji} {p.title}
            </Body>
            <Body muted style={{ fontSize: 13 }}>
              {formatWhen(p.starts_at)} · {p.attendee_count + 1} people
            </Body>
          </Card>
        ))
      )}
    </Screen>
  );
}
