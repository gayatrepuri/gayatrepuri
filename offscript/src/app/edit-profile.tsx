// Change your portrait, answers and what others can see.
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { ProfileSection, draftFromProfile, type ProfileDraft } from '../components/ProfileForm';
import { Button, Screen } from '../components/ui';
import { refreshThemes } from '../lib/ai';
import { useMe } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { space } from '../lib/theme';

export default function EditProfile() {
  const { profile, refreshProfile } = useMe();
  const [draft, setDraft] = useState<ProfileDraft>(() => draftFromProfile(profile));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (draft.age != null && (draft.age < 16 || draft.age > 100)) {
      return Alert.alert('Check your age', 'Age needs to be between 16 and 100, or leave it blank.');
    }
    setSaving(true);
    const { error } = await supabase.from('profiles').update(draft).eq('id', profile.id);
    setSaving(false);
    if (error) return Alert.alert('Could not save', error.message);
    refreshThemes(); // AI matching works in the background
    await refreshProfile();
    router.back();
  };

  return (
    <Screen>
      {(['photo', 'basics', 'research', 'fun', 'privacy'] as const).map((s) => (
        <View key={s} style={{ marginBottom: space.xxl }}>
          <ProfileSection section={s} draft={draft} setDraft={setDraft} userId={profile.id} />
        </View>
      ))}
      <Button title="Save" onPress={save} loading={saving} />
    </Screen>
  );
}
