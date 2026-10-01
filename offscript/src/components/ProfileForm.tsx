// The questions people answer about themselves. Used both when joining
// (onboarding, one section per step) and on the "Edit profile" screen.
import { Pressable, Switch, Text, View } from 'react-native';
import {
  DEGREE_STAGES,
  FUN_QUESTIONS,
  INTEREST_TAGS,
  RESEARCH_FIELDS,
  VISIBILITY_OPTIONS,
} from '../lib/constants';
import { colors, fonts, space } from '../lib/theme';
import type { Profile } from '../lib/types';
import { Body, Chip, ChipRow, H2, Input, Label } from './ui';

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
});

export type Section = 'basics' | 'research' | 'fun' | 'privacy';

type Props = {
  section: Section;
  draft: ProfileDraft;
  setDraft: (d: ProfileDraft) => void;
  city: string;
};

export function ProfileSection({ section, draft, setDraft, city }: Props) {
  const set = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => setDraft({ ...draft, [key]: value });
  const toggleIn = (key: 'interests' | 'visible_fields', value: string) => {
    const list = draft[key];
    set(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  if (section === 'basics') {
    return (
      <View>
        <H2 style={{ marginBottom: space.lg }}>The basics</H2>
        <Input label="Name people will see" value={draft.display_name} onChangeText={(t) => set('display_name', t)} placeholder="Ada L." />
        <Input label="Pronouns (optional)" value={draft.pronouns ?? ''} onChangeText={(t) => set('pronouns', t || null)} placeholder="she/her" />
        <Input
          label="Age"
          value={draft.age ? String(draft.age) : ''}
          onChangeText={(t) => set('age', t ? Number(t.replace(/\D/g, '')) || null : null)}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="26"
        />
        <Label>Where are you at?</Label>
        <ChipRow>
          {DEGREE_STAGES.map((s) => (
            <Chip key={s} label={s} selected={draft.degree_stage === s} onPress={() => set('degree_stage', s)} />
          ))}
        </ChipRow>
        <View style={{ height: space.lg }} />
        <Input label="Department" value={draft.department ?? ''} onChangeText={(t) => set('department', t || null)} placeholder="Dept. of Physics" />
        {city === 'Cambridge' ? (
          <Input label="College (optional)" value={draft.college ?? ''} onChangeText={(t) => set('college', t || null)} placeholder="Trinity" />
        ) : null}
      </View>
    );
  }

  if (section === 'research') {
    return (
      <View>
        <H2 style={{ marginBottom: space.sm }}>Your research</H2>
        <Body muted style={{ marginBottom: space.lg }}>
          We use this to match you with people working on similar things (and some refreshingly different things).
        </Body>
        <Label>Broad field</Label>
        <ChipRow>
          {RESEARCH_FIELDS.map((f) => (
            <Chip key={f} label={f} selected={draft.research_field === f} onPress={() => set('research_field', f)} />
          ))}
        </ChipRow>
        <View style={{ height: space.lg }} />
        <Input
          label="What are you working on, in one line?"
          value={draft.research_topic ?? ''}
          onChangeText={(t) => set('research_topic', t || null)}
          placeholder="Why bees like some flowers more than others"
        />
        <Label>Interests (pick a few)</Label>
        <ChipRow>
          {INTEREST_TAGS.map((t) => (
            <Chip key={t} label={t} selected={draft.interests.includes(t)} onPress={() => toggleIn('interests', t)} />
          ))}
        </ChipRow>
        <View style={{ height: space.lg }} />
        <Input
          label="Short bio"
          value={draft.bio ?? ''}
          onChangeText={(t) => set('bio', t || null)}
          placeholder="3rd-year PhD, professional procrastinator, will trade stats help for cake."
          multiline
          maxLength={400}
        />
      </View>
    );
  }

  if (section === 'fun') {
    return (
      <View>
        <H2 style={{ marginBottom: space.sm }}>The fun bit</H2>
        <Body muted style={{ marginBottom: space.lg }}>All optional. You decide what’s shown on the next step.</Body>
        {FUN_QUESTIONS.map((q) => (
          <Input
            key={q.key}
            label={q.label}
            value={draft[q.key] ?? ''}
            onChangeText={(t) => set(q.key, t || null)}
            placeholder={q.placeholder}
          />
        ))}
      </View>
    );
  }

  // privacy
  return (
    <View>
      <H2 style={{ marginBottom: space.sm }}>What can others see?</H2>
      <Body muted style={{ marginBottom: space.lg }}>
        Your name and university are always shown. Everything else is up to you — change it any time.
      </Body>
      {VISIBILITY_OPTIONS.map((o) => {
        const on = draft.visible_fields.includes(o.key);
        return (
          <Pressable
            key={o.key}
            onPress={() => toggleIn('visible_fields', o.key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.cream,
            }}
          >
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.coffee }}>{o.label}</Text>
            <Switch
              value={on}
              onValueChange={() => toggleIn('visible_fields', o.key)}
              trackColor={{ true: colors.maroon, false: colors.cream }}
              thumbColor={colors.butter}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
