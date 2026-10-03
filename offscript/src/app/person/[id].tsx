// Someone else's profile: framed portrait, their stickers, say hi.
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { GoldFrame } from '../../components/GoldFrame';
import { ProfileDetails } from '../../components/ProfileDetails';
import { ReportModal } from '../../components/ReportModal';
import { Body, Button, H1, Loading, Screen } from '../../components/ui';
import { useMe } from '../../lib/auth';
import { handleError } from '../../lib/errors';
import { supabase } from '../../lib/supabase';
import { space } from '../../lib/theme';
import type { Connection, PublicProfile } from '../../lib/types';

export default function Person() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useMe();
  const [person, setPerson] = useState<PublicProfile | null>(null);
  const [conn, setConn] = useState<Connection | null>(null);
  const [missing, setMissing] = useState(false);
  const [reporting, setReporting] = useState(false);

  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('public_profiles').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('connections')
        .select('*')
        .or(`and(requester_id.eq.${userId},addressee_id.eq.${id}),and(requester_id.eq.${id},addressee_id.eq.${userId})`)
        .maybeSingle(),
    ]);
    setPerson(p as PublicProfile | null);
    setMissing(!p);
    setConn(c as Connection | null);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const sayHi = async () => {
    const { error } = await supabase.from('connections').insert({ requester_id: userId, addressee_id: id });
    if (!handleError(error)) load();
  };

  const block = () =>
    Alert.alert('Block?', 'You won’t see each other anymore.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('blocks').insert({ blocker_id: userId, blocked_id: id });
          router.back();
        },
      },
    ]);

  if (missing) return <Screen><Body>Not available.</Body></Screen>;
  if (!person) return <Loading />;

  const isMe = id === userId;
  const accepted = conn?.status === 'accepted';
  const pending = conn?.status === 'pending' && conn.requester_id === userId;
  const theyAsked = conn?.status === 'pending' && conn.requester_id === id;

  return (
    <Screen>
      <Stack.Screen options={{ title: '' }} />
      <View style={{ alignItems: 'center', marginBottom: space.xl }}>
        <GoldFrame uri={person.avatar_url} name={person.display_name} width={230} />
        <H1 style={{ marginTop: space.md, textAlign: 'center' }}>
          {person.display_name}
          {person.is_plus ? ' ✦' : ''}
        </H1>
        <Body muted>{person.university}</Body>
      </View>

      {!isMe ? (
        accepted ? (
          <Button title="Message" sticker="envelope" onPress={() => router.push(`/dm/${id}`)} />
        ) : theyAsked ? (
          <Button title="Hi back" sticker="bulb" onPress={sayHi} />
        ) : (
          <Button title={pending ? 'Sent' : 'Say hi'} sticker="bulb" variant={pending ? 'blue' : 'primary'} disabled={pending} onPress={sayHi} />
        )
      ) : null}

      <View style={{ marginTop: space.xl }}>
        <ProfileDetails person={person} />
      </View>

      {!isMe ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.xl, marginTop: space.xxl }}>
          <Body muted style={{ fontSize: 12 }} onPress={() => setReporting(true)}>report</Body>
          <Body muted style={{ fontSize: 12 }} onPress={block}>block</Body>
        </View>
      ) : null}
      <ReportModal visible={reporting} onClose={() => setReporting(false)} reporterId={userId} targetUser={id} />
    </Screen>
  );
}
