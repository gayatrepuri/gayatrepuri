// Make a new post: coffee run, study session, event, spare ticket...
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Body, Button, Chip, ChipRow, H1, Input, Label, Screen } from '../../components/ui';
import { useMe } from '../../lib/auth';
import { CITIES, INTEREST_TAGS, POST_KINDS } from '../../lib/constants';
import { handleError } from '../../lib/errors';
import { supabase } from '../../lib/supabase';
import { space } from '../../lib/theme';
import type { City, PostKind } from '../../lib/types';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 → 22:00

export default function NewPost() {
  const { userId, profile } = useMe();
  const [kind, setKind] = useState<PostKind>('coffee');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState<City>(profile.city);
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
        const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
        return { i, label };
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
        city,
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
      <H1 style={{ marginBottom: space.lg }}>What’s the plan?</H1>

      <Label>Type</Label>
      <ChipRow>
        {POST_KINDS.map((k) => (
          <Chip key={k.kind} label={`${k.emoji} ${k.label}`} selected={kind === k.kind} onPress={() => setKind(k.kind)} />
        ))}
      </ChipRow>
      <View style={{ height: space.lg }} />

      <Input label="Headline" value={title} onChangeText={setTitle} placeholder={example} maxLength={120} />
      <Input label="Details (optional)" value={body} onChangeText={setBody} placeholder="What, who it's for, what to bring…" multiline maxLength={2000} />
      <Input label="Where" value={location} onChangeText={setLocation} placeholder="Jack's Gelato, Bene't St" />

      <Label>City</Label>
      <ChipRow>
        {CITIES.map((c) => (
          <Chip key={c} label={c} selected={city === c} onPress={() => setCity(c)} />
        ))}
      </ChipRow>
      <View style={{ height: space.lg }} />

      <Label>When</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Chip label="Flexible" selected={dayOffset === null} onPress={() => { setDayOffset(null); setHour(null); }} />
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

      <Input
        label="Max people (optional)"
        value={capacity}
        onChangeText={(t) => setCapacity(t.replace(/\D/g, ''))}
        keyboardType="number-pad"
        placeholder="e.g. 4"
        maxLength={3}
      />

      <Label>Tags (help the right people find it)</Label>
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

      <Button title="Post it" onPress={submit} loading={busy} disabled={title.trim().length < 3 || (dayOffset !== null && hour === null)} style={{ marginTop: space.xl }} />
      {dayOffset !== null && hour === null ? <Body muted style={{ textAlign: 'center', marginTop: space.sm }}>Pick a time (or choose “Flexible”).</Body> : null}
      <Button title="Cancel" variant="ghost" onPress={() => router.back()} style={{ marginTop: space.md, borderWidth: 0 }} />
    </Screen>
  );
}
