// The answers of a poll: tap one to vote (tap another to change your mind).
// Bars fill in baby blue to show how everyone voted.
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { handleError } from '../lib/errors';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius, space } from '../lib/theme';
import { haptic, Body, Tap } from './ui';

type Option = { id: number; label: string; position: number };
type Vote = { option_id: number; user_id: string };

export function PollBlock({ postId, myId }: { postId: string; myId: string }) {
  const [options, setOptions] = useState<Option[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);

  const load = useCallback(async () => {
    const [{ data: o }, { data: v }] = await Promise.all([
      supabase.from('poll_options').select('id, label, position').eq('post_id', postId).order('position'),
      supabase.from('poll_votes').select('option_id, user_id').eq('post_id', postId),
    ]);
    setOptions((o as Option[]) ?? []);
    setVotes((v as Vote[]) ?? []);
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const mine = votes.find((v) => v.user_id === myId)?.option_id;
  const total = votes.length;

  const vote = async (optionId: number) => {
    if (optionId === mine) return;
    haptic('success');
    // show it straight away, then save
    setVotes([...votes.filter((v) => v.user_id !== myId), { option_id: optionId, user_id: myId }]);
    const { error } = mine
      ? await supabase.from('poll_votes').update({ option_id: optionId }).eq('post_id', postId).eq('user_id', myId)
      : await supabase.from('poll_votes').insert({ post_id: postId, option_id: optionId, user_id: myId });
    if (handleError(error)) load();
  };

  return (
    <View style={{ gap: space.sm }}>
      {options.map((o) => {
        const count = votes.filter((v) => v.option_id === o.id).length;
        const pct = total ? Math.round((count / total) * 100) : 0;
        const chosen = o.id === mine;
        return (
          <Tap
            key={o.id}
            onPress={() => vote(o.id)}
            style={{
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: chosen ? colors.maroon : colors.sky,
              backgroundColor: colors.cream,
              overflow: 'hidden',
            }}
          >
            {/* the filled part of the bar (only after you've voted) */}
            {mine ? (
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${pct}%`,
                  backgroundColor: chosen ? colors.butterDeep : colors.babyBlue,
                }}
              />
            ) : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: space.md }}>
              <Text style={{ fontFamily: chosen ? fonts.bodyBold : fonts.body, color: colors.coffee, fontSize: 15, flex: 1 }}>
                {chosen ? '✓ ' : ''}
                {o.label}
              </Text>
              {mine ? <Text style={{ fontFamily: fonts.bodyBold, color: colors.maroon }}>{pct}%</Text> : null}
            </View>
          </Tap>
        );
      })}
      <Body muted style={{ fontSize: 12, textAlign: 'center' }}>
        {total} {total === 1 ? 'vote' : 'votes'}
        {mine ? ' · tap another answer to change' : ' · tap to vote'}
      </Body>
    </View>
  );
}
