// Make a new post: pick a sticker, write a line, choose when.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Sticker } from '../../components/Sticker';
import { Button, Chip, ChipRow, H1, Input, Label, Screen, Tap } from '../../components/ui';
import { useMe } from '../../lib/auth';
import { INTEREST_TAGS, POST_KINDS } from '../../lib/constants';
import { handleError } from '../../lib/errors';
import { supabase } from '../../lib/supabase';
import { colors, fonts, radius, space } from '../../lib/theme';
import type { PostKind } from '../../lib/types';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 → 22:00

export default function NewPost() {
  const { userId, profile } = useMe();
  const [kind, setKind] = useState<PostKind>('coffee');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [location, setLocation] = useState('');
  const [dayOffset, setDayOffset] = useState<number | null>(0);
  const [hour, setHour] = useState<number | null>(null);
  const [capacity, setCapacity] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return { i, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }) };
      }),
    [],
  );
  const example = POST_KINDS.find((k) => k.kind === kind)!.example;

  const startsAt = () => {
    if (dayOffset === null || hour === null) return null;
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  const submit = async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        kind,
        title: title.trim(),
        body: body.trim() || null,
        location: location.trim() || null,
        city: profile.city,
        starts_at: startsAt(),
        capacity: capacity ? Number(capacity) : null,
        tags,
      })
      .select('id')
      .single();
    setBusy(false);
    if (handleError(error)) return;
    router.replace(`/post/${data!.id}`);
  };

  return (
    <Screen>
      <H1 style={{ marginBottom: space.lg, textAlign: 'center' }}>What’s the plan?</H1>

      {/* sticker picker */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.md, marginBottom: space.xl }}>
        {POST_KINDS.map((k) => {
          const on = kind === k.kind;
          return (
            <Tap
              key={k.kind}
              onPress={() => setKind(k.kind)}
              style={{
                width: 92,
                alignItems: 'center',
                paddingVertical: space.sm,
                borderRadius: radius.md,
                backgroundColor: on ? colors.butter : 'transparent',
                borderWidth: 1.5,
                borderColor: on ? colors.maroon : 'transparent',
                transform: [{ rotate: on ? '-3deg' : '0deg' }],
              }}
            >
              <Sticker name={k.sticker} size={46} />
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.maroon, marginTop: 4, textAlign: 'center' }}>{k.label}</Text>
            </Tap>
          );
        })}
      </View>

      <Input value={title} onChangeText={setTitle} placeholder={example} maxLength={120} style={{ fontFamily: fonts.heading, fontSize: 16 }} />
      <Input value={location} onChangeText={setLocation} placeholder="where?" />

      <Label>When</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Chip label="Anytime" selected={dayOffset === null} onPress={() => { setDayOffset(null); setHour(null); }} />
          {days.map((d) => (
            <Chip key={d.i} label={d.label} selected={dayOffset === d.i} onPress={() => setDayOffset(d.i)} />
          ))}
        </View>
      </ScrollView>
      {dayOffset !== null ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.sm }}>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {HOURS.map((h) => (
              <Chip key={h} label={`${String(h).padStart(2, '0')}:00`} selected={hour === h} onPress={() => setHour(h)} />
            ))}
          </View>
        </ScrollView>
      ) : null}
      <View style={{ height: space.lg }} />

      <Input value={body} onChangeText={setBody} placeholder="details (optional)" multiline maxLength={2000} />
      <Input
        value={capacity}
        onChangeText={(t) => setCapacity(t.replace(/\D/g, ''))}
        keyboardType="number-pad"
        placeholder="max people (optional)"
        maxLength={3}
      />

      <Label>Tags</Label>
      <ChipRow>
        {INTEREST_TAGS.map((t) => (
          <Chip
            key={t}
            label={t}
            small
            selected={tags.includes(t)}
            onPress={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t].slice(0, 5))}
          />
        ))}
      </ChipRow>

      <Button
        title="Pin it"
        sticker="waxseal"
        onPress={submit}
        loading={busy}
        disabled={title.trim().length < 3 || (dayOffset !== null && hour === null)}
        style={{ marginTop: space.xl }}
      />
      <Button title="Cancel" variant="ghost" onPress={() => router.back()} style={{ marginTop: space.md, borderWidth: 0 }} />
    </Screen>
  );
}
