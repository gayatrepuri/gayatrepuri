// The questions people answer about themselves. Used both when joining
// (onboarding, one section per step) and on the "Edit profile" screen.
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Switch, View } from 'react-native';
import { DEGREE_STAGES, FUN_QUESTIONS, INTEREST_TAGS, RESEARCH_FIELDS, VISIBILITY_OPTIONS } from '../lib/constants';
import { supabase } from '../lib/supabase';
import { colors, space } from '../lib/theme';
import type { Profile } from '../lib/types';
import { GoldFrame } from './GoldFrame';
import { Sticker } from './Sticker';
import { Body, Chip, ChipRow, H2, Input, Label, Tap } from './ui';

export type ProfileDraft = Pick<
  Profile,
  | 'display_name'
  | 'pronouns'
  | 'age'
  | 'degree_stage'
  | 'department'
  | 'college'
  | 'research_field'
  | 'research_topic'
  | 'interests'
  | 'bio'
  | 'favourite_movie'
  | 'favourite_song'
  | 'cry_spot'
  | 'dream_destination'
  | 'comfort_order'
  | 'visible_fields'
  | 'avatar_url'
>;

export const draftFromProfile = (p: Profile): ProfileDraft => ({
  display_name: p.display_name,
  pronouns: p.pronouns,
  age: p.age,
  degree_stage: p.degree_stage,
  department: p.department,
  college: p.college,
  research_field: p.research_field,
  research_topic: p.research_topic,
  interests: p.interests ?? [],
  bio: p.bio,
  favourite_movie: p.favourite_movie,
  favourite_song: p.favourite_song,
  cry_spot: p.cry_spot,
  dream_destination: p.dream_destination,
  comfort_order: p.comfort_order,
  visible_fields: p.visible_fields ?? [],
  avatar_url: p.avatar_url,
});

export type Section = 'photo' | 'basics' | 'research' | 'fun' | 'privacy';

type Props = {
  section: Section;
  draft: ProfileDraft;
  setDraft: (d: ProfileDraft) => void;
  userId: string;
};

/** Pick a photo, upload it, and return its web address. */
async function pickAndUpload(userId: string) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.7,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const bytes = await (await fetch(asset.uri)).arrayBuffer();
  const path = `${userId}/photo-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, bytes, { contentType: asset.mimeType ?? 'image/jpeg', upsert: true });
  if (error) throw error;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

export function ProfileSection({ section, draft, setDraft, userId }: Props) {
  const [uploading, setUploading] = useState(false);
  const set = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => setDraft({ ...draft, [key]: value });
  const toggleIn = (key: 'interests' | 'visible_fields', value: string) => {
    const list = draft[key];
    set(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  if (section === 'photo') {
    return (
      <View style={{ alignItems: 'center' }}>
        <H2 style={{ marginBottom: space.lg }}>Your portrait</H2>
        <Tap
          onPress={async () => {
            try {
              setUploading(true);
              const url = await pickAndUpload(userId);
              if (url) set('avatar_url', url);
            } catch (e: any) {
              Alert.alert('Upload failed', e.message ?? String(e));
            } finally {
              setUploading(false);
            }
          }}
        >
          <GoldFrame uri={draft.avatar_url} name={draft.display_name} width={230} />
        </Tap>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md }}>
          <Sticker name="camera" size={26} />
          <Body muted>{uploading ? 'uploading…' : 'tap to choose'}</Body>
        </View>
      </View>
    );
  }

  if (section === 'basics') {
    return (
      <View>
        <H2 style={{ marginBottom: space.lg }}>Hello, you</H2>
        <Input label="Name" value={draft.display_name} onChangeText={(t) => set('display_name', t)} placeholder="Ada L." />
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Input label="Pronouns" value={draft.pronouns ?? ''} onChangeText={(t) => set('pronouns', t || null)} placeholder="she/her" />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Age"
              value={draft.age ? String(draft.age) : ''}
              onChangeText={(t) => set('age', t ? Number(t.replace(/\D/g, '')) || null : null)}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="26"
            />
          </View>
        </View>
        <Label>Stage</Label>
        <ChipRow>
          {DEGREE_STAGES.map((s) => (
            <Chip key={s} label={s} selected={draft.degree_stage === s} onPress={() => set('degree_stage', s)} />
          ))}
        </ChipRow>
        <View style={{ height: space.lg }} />
        <Input label="Department" value={draft.department ?? ''} onChangeText={(t) => set('department', t || null)} placeholder="Physics" />
        <Input label="College (optional)" value={draft.college ?? ''} onChangeText={(t) => set('college', t || null)} placeholder="Trinity" />
      </View>
    );
  }

  if (section === 'research') {
    return (
      <View>
        <H2 style={{ marginBottom: space.lg }}>Your research</H2>
        <Label>Field</Label>
        <ChipRow>
          {RESEARCH_FIELDS.map((f) => (
            <Chip key={f} label={f} selected={draft.research_field === f} onPress={() => set('research_field', f)} />
          ))}
        </ChipRow>
        <View style={{ height: space.lg }} />
        <Input
          label="Working on"
          value={draft.research_topic ?? ''}
          onChangeText={(t) => set('research_topic', t || null)}
          placeholder="Why bees prefer some flowers"
        />
        <Label>Interests</Label>
        <ChipRow>
          {INTEREST_TAGS.map((t) => (
            <Chip key={t} label={t} selected={draft.interests.includes(t)} onPress={() => toggleIn('interests', t)} />
          ))}
        </ChipRow>
        <View style={{ height: space.lg }} />
        <Input label="About" value={draft.bio ?? ''} onChangeText={(t) => set('bio', t || null)} placeholder="Will trade stats help for cake." multiline maxLength={300} />
      </View>
    );
  }

  if (section === 'fun') {
    return (
      <View>
        <H2 style={{ marginBottom: space.lg }}>The fun bit</H2>
        {FUN_QUESTIONS.map((q) => (
          <View key={q.key} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <Sticker name={q.sticker} size={40} />
            <View style={{ flex: 1 }}>
              <Input label={q.label} value={draft[q.key] ?? ''} onChangeText={(t) => set(q.key, t || null)} placeholder={q.placeholder} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // privacy
  return (
    <View>
      <H2 style={{ marginBottom: space.lg }}>Show on my profile</H2>
      {VISIBILITY_OPTIONS.map((o) => {
        const on = draft.visible_fields.includes(o.key);
        return (
          <Tap
            key={o.key}
            onPress={() => toggleIn('visible_fields', o.key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: colors.line,
              opacity: on ? 1 : 0.5,
            }}
          >
            <Sticker name={o.sticker} size={30} />
            <Body style={{ flex: 1 }}>{o.label}</Body>
            <Switch
              value={on}
              onValueChange={() => toggleIn('visible_fields', o.key)}
              trackColor={{ true: colors.maroon, false: colors.line }}
              thumbColor={colors.butter}
            />
          </Tap>
        );
      })}
    </View>
  );
}
