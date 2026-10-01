// Shows someone's answers (only the ones they chose to make visible).
import { View } from 'react-native';
import { space } from '../lib/theme';
import type { PublicProfile } from '../lib/types';
import { Body, Chip, ChipRow, Label } from './ui';

const ROWS: { key: keyof PublicProfile; label: string }[] = [
  { key: 'pronouns', label: 'Pronouns' },
  { key: 'age', label: 'Age' },
  { key: 'degree_stage', label: 'Stage' },
  { key: 'department', label: 'Department' },
  { key: 'college', label: 'College' },
  { key: 'research_field', label: 'Field' },
  { key: 'research_topic', label: 'Working on' },
  { key: 'bio', label: 'About' },
  { key: 'favourite_movie', label: 'Favourite movie' },
  { key: 'favourite_song', label: 'Favourite song' },
  { key: 'cry_spot', label: 'Favourite place to cry' },
  { key: 'dream_destination', label: 'Dream destination' },
  { key: 'comfort_order', label: 'Coffee order' },
];

/** `visible` is only passed for your own profile (to preview what others see). */
export function ProfileDetails({ person, visible }: { person: PublicProfile; visible?: string[] }) {
  const shown = (key: string) => !visible || visible.includes(key);
  const interests = shown('interests') ? person.interests ?? [] : [];
  return (
    <View style={{ gap: space.md }}>
      {ROWS.filter((r) => shown(r.key) && person[r.key] != null && person[r.key] !== '').map((r) => (
        <View key={r.key}>
          <Label>{r.label}</Label>
          <Body>{String(person[r.key])}</Body>
        </View>
      ))}
      {interests.length ? (
        <View>
          <Label>Interests</Label>
          <ChipRow>
            {interests.map((t) => (
              <Chip key={t} label={t} small />
            ))}
          </ChipRow>
        </View>
      ) : null}
    </View>
  );
}
