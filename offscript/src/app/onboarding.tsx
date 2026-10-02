// New people answer a few questions before they get in (5 short steps).
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { ProfileSection, draftFromProfile, type ProfileDraft, type Section } from '../components/ProfileForm';
import { Body, Button, Screen } from '../components/ui';
import { refreshThemes } from '../lib/ai';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { colors, space } from '../lib/theme';

const STEPS: Section[] = ['basics', 'photo', 'research', 'fun', 'privacy'];

export default function Onboarding() {
  const { profile, refreshProfile, signOut } = useAuth();
  if (!profile) {
    // logged in, but no profile came back (e.g. a network hiccup)
    return (
      <Screen style={{ flexGrow: 1, justifyContent: 'center' }}>
        <Body style={{ textAlign: 'center', marginBottom: space.lg }}>Couldn’t load your profile.</Body>
        <Button title="Try again" onPress={refreshProfile} />
        <Button title="Sign out" variant="ghost" onPress={signOut} style={{ marginTop: space.md, borderWidth: 0 }} />
      </Screen>
    );
  }
  return <OnboardingSteps />;
}

function OnboardingSteps() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProfileDraft>(() => draftFromProfile(profile!));
  const [saving, setSaving] = useState(false);

  const next = async () => {
    if (step === 0 && draft.display_name.trim().length < 2) return Alert.alert('Your name?');
    if (STEPS[step] === 'research' && !draft.research_field) return Alert.alert('Pick a field');
    if (step < STEPS.length - 1) return setStep(step + 1);

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ ...draft, display_name: draft.display_name.trim(), onboarded: true })
      .eq('id', profile!.id);
    setSaving(false);
    if (error) return Alert.alert('Could not save', error.message);
    refreshThemes(); // AI matching works in the background
    await refreshProfile(); // this moves you into the app
  };

  return (
    <Screen>
      {/* progress: a row of little dots that fill in */}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: space.xl, marginTop: space.md }}>
        {STEPS.map((s, i) => (
          <View
            key={s}
            style={{
              width: i === step ? 22 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i <= step ? colors.maroon : colors.line,
            }}
          />
        ))}
      </View>

      <ProfileSection section={STEPS[step]} draft={draft} setDraft={setDraft} userId={profile!.id} />

      <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.xl }}>
        {step > 0 ? <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
        <Button
          title={step === STEPS.length - 1 ? 'Done' : STEPS[step] === 'photo' && !draft.avatar_url ? 'Skip' : 'Next'}
          onPress={next}
          loading={saving}
          style={{ flex: 2 }}
        />
      </View>
      {step === 0 ? (
        <Button title="Sign out" variant="ghost" onPress={signOut} style={{ marginTop: space.lg, borderWidth: 0 }} />
      ) : null}
    </Screen>
  );
}
