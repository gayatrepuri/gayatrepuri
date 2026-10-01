// Matches: people with a similar research focus, plus requests waiting for you.
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { Avatar, Body, Button, Card, Chip, ChipRow, Empty, H1, H2, Screen, Script } from '../../components/ui';
import { useMe } from '../../lib/auth';
import { CITIES } from '../../lib/constants';
import { handleError } from '../../lib/errors';
import { supabase } from '../../lib/supabase';
import { colors, space } from '../../lib/theme';
import type { Match, PublicProfile } from '../../lib/types';

type Request = { requester_id: string; note: string | null; person?: PublicProfile };

export default function Matches() {
  const { userId, profile } = useMe();
  const [matches, setMatches] = useState<Match[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [city, setCity] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const isPlus = profile.is_plus;

  const load = useCallback(async () => {
    const [{ data: m }, { data: r }] = await Promise.all([
      supabase.rpc('suggested_matches', { only_city: city }),
      supabase.from('connections').select('requester_id, note').eq('addressee_id', userId).eq('status', 'pending'),
    ]);
    setMatches((m as Match[]) ?? []);
    const reqs = (r as Request[]) ?? [];
    if (reqs.length) {
      const { data: people } = await supabase
        .from('public_profiles')
        .select('*')
        .in('id', reqs.map((x) => x.requester_id));
      reqs.forEach((x) => (x.person = (people as PublicProfile[])?.find((p) => p.id === x.requester_id)));
    }
    setRequests(reqs.filter((x) => x.person));
  }, [city, userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const connect = async (id: string) => {
    const { error } = await supabase.from('connections').insert({ requester_id: userId, addressee_id: id });
    if (handleError(error)) return;
    setSent(new Set(sent).add(id));
  };

  const respond = async (id: string, status: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('connections')
      .update({ status })
      .eq('requester_id', id)
      .eq('addressee_id', userId);
    if (handleError(error)) return;
    if (status === 'accepted') Alert.alert('It’s a match ✿', 'You can now message each other from Chats.');
    load();
  };

  return (
    <Screen>
      <H1>Your people</H1>
      <Script style={{ marginBottom: space.lg }}>similar research, nearby</Script>

      {requests.length ? (
        <View style={{ marginBottom: space.xl }}>
          <H2 style={{ marginBottom: space.md }}>Waiting for you</H2>
          {requests.map((r) => (
            <Card key={r.requester_id} tone="butter" style={{ marginBottom: space.md }}>
              <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                <Avatar name={r.person!.display_name} url={r.person!.avatar_url} />
                <View style={{ flex: 1 }}>
                  <Body style={{ fontWeight: '700' }} >{r.person!.display_name}</Body>
                  <Body muted>{r.person!.university}</Body>
                </View>
              </View>
              {r.note ? <Body style={{ marginTop: space.sm }}>“{r.note}”</Body> : null}
              <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
                <Button title="Accept" onPress={() => respond(r.requester_id, 'accepted')} style={{ flex: 1 }} />
                <Button title="Not now" variant="ghost" onPress={() => respond(r.requester_id, 'declined')} style={{ flex: 1 }} />
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.lg }}>
        <Chip label="Anywhere" selected={city === null} onPress={() => setCity(null)} />
        {CITIES.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={city === c}
            onPress={() => (isPlus ? setCity(c) : router.push('/plus'))}
          />
        ))}
      </View>

      {matches.length === 0 ? (
        <Empty title="finding your people…" hint="Add more interests to your profile to get better matches." />
      ) : (
        matches.map((m) => (
          <Card key={m.id} onPress={() => router.push(`/person/${m.id}`)} style={{ marginBottom: space.md }}>
            <View style={{ flexDirection: 'row', gap: space.md }}>
              <Avatar name={m.display_name} url={m.avatar_url} size={52} />
              <View style={{ flex: 1 }}>
                <H2 style={{ fontSize: 19 }}>{m.display_name}</H2>
                <Body muted style={{ fontSize: 13 }}>
                  {[m.degree_stage, m.university].filter(Boolean).join(' · ')}
                </Body>
                {m.research_topic ? <Body style={{ marginTop: 4 }}>{m.research_topic}</Body> : null}
              </View>
            </View>
            {m.shared_interests.length ? (
              <View style={{ marginTop: space.md }}>
                <ChipRow>
                  {m.shared_interests.map((t) => (
                    <Chip key={t} label={`♡ ${t}`} small />
                  ))}
                </ChipRow>
              </View>
            ) : null}
            <Button
              title={sent.has(m.id) ? 'Request sent ✓' : 'Say hi'}
              variant={sent.has(m.id) ? 'blue' : 'butter'}
              disabled={sent.has(m.id)}
              onPress={() => connect(m.id)}
              style={{ marginTop: space.md }}
            />
          </Card>
        ))
      )}

      {!isPlus && matches.length >= 5 ? (
        <Card tone="maroon" onPress={() => router.push('/plus')}>
          <Body style={{ color: colors.butter, textAlign: 'center' }}>
            Free shows your top 5 matches. Offscript Plus shows everyone ✦
          </Body>
        </Card>
      ) : null}
    </Screen>
  );
}
