// The questions new people answer before they get in (4 short steps).
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { ProfileSection, draftFromProfile, type ProfileDraft, type Section } from '../components/ProfileForm';
import { Body, Button, Screen, Script } from '../components/ui';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { colors, space } from '../lib/theme';

const STEPS: Section[] = ['basics', 'research', 'fun', 'privacy'];

export default function Onboarding() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProfileDraft>(() => draftFromProfile(profile!));
  const [saving, setSaving] = useState(false);

  const next = async () => {
    if (step === 0 && draft.display_name.trim().length < 2) {
      return Alert.alert('One thing', 'Pop in the name you’d like people to see.');
    }
    if (step === 1 && !draft.research_field) {
      return Alert.alert('One thing', 'Pick a broad research field so we can find your people.');
    }
    if (step < STEPS.length - 1) return setStep(step + 1);

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ ...draft, display_name: draft.display_name.trim(), onboarded: true })
      .eq('id', profile!.id);
    setSaving(false);
    if (error) return Alert.alert('Could not save', error.message);
    await refreshProfile(); // this moves you into the app
  };

  return (
    <Screen>
      <Script style={{ textAlign: 'center' }}>welcome to offscript</Script>
      <Body muted style={{ textAlign: 'center', marginBottom: space.md }}>
        {profile?.university} · step {step + 1} of {STEPS.length}
      </Body>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: space.xl }}>
        {STEPS.map((s, i) => (
          <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? colors.maroon : colors.cream }} />
        ))}
      </View>

      <ProfileSection section={STEPS[step]} draft={draft} setDraft={setDraft} city={profile?.city ?? 'London'} />

      <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.xl }}>
        {step > 0 ? <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
        <Button title={step === STEPS.length - 1 ? 'Finish' : 'Next'} onPress={next} loading={saving} style={{ flex: 2 }} />
      </View>
      {step === 0 ? (
        <Button title="Sign out" variant="ghost" onPress={signOut} style={{ marginTop: space.lg, borderWidth: 0 }} />
      ) : null}
    </Screen>
  );
}
