// Matches: swipe through people with a similar research focus.
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { GoldFrame } from '../../components/GoldFrame';
import { Sticker } from '../../components/Sticker';
import { SwipeDeck } from '../../components/SwipeDeck';
import { Avatar, Body, Button, Card, Chip, ChipRow, Empty, GinghamBand, H1, PaperLabel, H2, Screen, Tap } from '../../components/ui';
import { refreshThemes } from '../../lib/ai';
import { useMe } from '../../lib/auth';
import { handleError } from '../../lib/errors';
import { supabase } from '../../lib/supabase';
import { colors, space } from '../../lib/theme';
import type { Match, PublicProfile } from '../../lib/types';

type Request = { requester_id: string; person?: PublicProfile };

export default function Matches() {
  const { userId, profile } = useMe();
  const [matches, setMatches] = useState<Match[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [deckKey, setDeckKey] = useState(0);
  const analysed = useRef(false);

  const load = useCallback(async () => {
    const [{ data: m }, { data: r }] = await Promise.all([
      supabase.rpc('suggested_matches', { only_city: null }),
      supabase.from('connections').select('requester_id').eq('addressee_id', userId).eq('status', 'pending'),
    ]);
    setMatches((m as Match[]) ?? []);
    setDeckKey((k) => k + 1);
    const reqs = (r as Request[]) ?? [];
    if (reqs.length) {
      const { data: people } = await supabase
        .from('public_profiles')
        .select('*')
        .in('id', reqs.map((x) => x.requester_id));
      reqs.forEach((x) => (x.person = (people as PublicProfile[])?.find((p) => p.id === x.requester_id)));
    }
    setRequests(reqs.filter((x) => x.person));
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
      // once per visit to the app, make sure your AI themes are up to date
      // (the server skips the work if nothing changed), then refresh the deck
      if (!analysed.current) {
        analysed.current = true;
        refreshThemes().then(load);
      }
    }, [load]),
  );

  const sayHi = async (m: Match) => {
    const { error } = await supabase.from('connections').insert({ requester_id: userId, addressee_id: m.id });
    handleError(error);
  };

  const respond = async (id: string, status: 'accepted' | 'declined') => {
    const { error } = await supabase.from('connections').update({ status }).eq('requester_id', id).eq('addressee_id', userId);
    if (!handleError(error)) load();
  };

  return (
    <Screen>
      <GinghamBand>
        <PaperLabel>
          <H1 style={{ textAlign: 'center' }}>Your people</H1>
        </PaperLabel>
      </GinghamBand>

      {requests.length ? (
        <View style={{ marginBottom: space.xl }}>
          <H2 style={{ marginBottom: space.md }}>Said hi to you</H2>
          {requests.map((r) => (
            <Card key={r.requester_id} tone="butter" style={{ marginBottom: space.md, padding: space.md }}>
              <Tap onPress={() => router.push(`/person/${r.requester_id}`)} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                <Avatar name={r.person!.display_name} url={r.person!.avatar_url} size={48} />
                <View style={{ flex: 1 }}>
                  <Body bold>{r.person!.display_name}</Body>
                  <Body muted numberOfLines={1}>{r.person!.university}</Body>
                </View>
              </Tap>
              <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
                <Button title="Hi back" sticker="bulb" onPress={() => respond(r.requester_id, 'accepted')} style={{ flex: 1 }} />
                <Button title="Not now" variant="ghost" onPress={() => respond(r.requester_id, 'declined')} style={{ flex: 1 }} />
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      <SwipeDeck
        key={deckKey}
        items={matches}
        onYes={sayHi}
        empty={
          <Empty title="that's everyone for now" sticker="swan" />
        }
        renderCard={(m) => (
          <Card tone="blue" style={{ alignItems: 'center', paddingVertical: space.xl }}>
            <Tap onPress={() => router.push(`/person/${m.id}`)}>
              <GoldFrame uri={m.avatar_url} name={m.display_name} width={190} />
            </Tap>
            <H2 style={{ marginTop: space.md, textAlign: 'center' }}>{m.display_name}</H2>
            <Body muted style={{ textAlign: 'center' }}>
              {[m.degree_stage, m.university].filter(Boolean).join(' · ')}
            </Body>
            {m.research_topic ? (
              <Body style={{ textAlign: 'center', marginTop: space.sm }} numberOfLines={2}>
                “{m.research_topic}”
              </Body>
            ) : null}
            {(m.shared_themes ?? []).length || (m.shared_interests ?? []).length ? (
              <View style={{ marginTop: space.md, alignItems: 'center' }}>
                <Body muted style={{ fontSize: 11, marginBottom: 6 }}>
                  you both
                </Body>
                <ChipRow>
                  {[...new Set([...(m.shared_themes ?? []), ...(m.shared_interests ?? [])])].slice(0, 5).map((t) => (
                    <Chip key={t} label={t} small sticker="hibiscus" />
                  ))}
                </ChipRow>
              </View>
            ) : null}
            {(() => {
              // a conversation starter from what you have in common
              const topic =
                (m.shared_themes ?? [])[0] ??
                (m.shared_interests ?? [])[0] ??
                (m.research_field && m.research_field === profile.research_field ? m.research_field.toLowerCase() : null);
              return topic ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md }}>
                  <Sticker name="bulb" size={24} />
                  <Body style={{ fontSize: 13 }}>ask about {topic}</Body>
                </View>
              ) : null;
            })()}
          </Card>
        )}
      />
      <Body muted style={{ textAlign: 'center', marginTop: space.md, fontSize: 11, color: colors.boho }}>
        swipe right to connect · left to skip
      </Body>
    </Screen>
  );
}
