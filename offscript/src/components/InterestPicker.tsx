// Choose interests from the long grouped list: type to search, or open a group.
// Your picks always show at the top so you can untick them easily.
import { useState } from 'react';
import { View } from 'react-native';
import { INTEREST_GROUPS } from '../lib/constants';
import { colors, space } from '../lib/theme';
import { Body, Chip, ChipRow, Input, Label, Tap } from './ui';

export function InterestPicker({
  selected,
  onToggle,
  max,
}: {
  selected: string[];
  onToggle: (tag: string) => void;
  max?: number; // optional limit (posts allow 5 tags)
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const full = max != null && selected.length >= max;

  const chip = (t: string) => (
    <Chip key={t} label={t} small selected={selected.includes(t)} onPress={() => (full && !selected.includes(t) ? null : onToggle(t))} />
  );

  return (
    <View>
      {selected.length ? (
        <View style={{ marginBottom: space.md }}>
          <ChipRow>{selected.map(chip)}</ChipRow>
        </View>
      ) : null}

      <Input value={query} onChangeText={setQuery} placeholder="search, e.g. quantum, law, climbing" autoCapitalize="none" />

      {q ? (
        <ChipRow>
          {INTEREST_GROUPS.flatMap((g) => g.tags)
            .filter((t, i, all) => all.indexOf(t) === i && t.toLowerCase().includes(q))
            .map(chip)}
        </ChipRow>
      ) : (
        INTEREST_GROUPS.map((g) => {
          const isOpen = open === g.title;
          const picked = g.tags.filter((t) => selected.includes(t)).length;
          return (
            <View key={g.title} style={{ borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <Tap
                onPress={() => setOpen(isOpen ? null : g.title)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}
              >
                <Label>{g.title}</Label>
                <Body muted style={{ fontSize: 12 }}>
                  {picked ? `${picked} picked  ` : ''}
                  {isOpen ? '▴' : '▾'}
                </Body>
              </Tap>
              {isOpen ? (
                <View style={{ paddingBottom: space.md }}>
                  <ChipRow>{g.tags.map(chip)}</ChipRow>
                </View>
              ) : null}
            </View>
          );
        })
      )}
      {full ? <Body muted style={{ fontSize: 11, marginTop: 6 }}>up to {max}</Body> : null}
    </View>
  );
}
