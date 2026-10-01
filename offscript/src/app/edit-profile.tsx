// Change your answers, photo and privacy settings.
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { ProfileSection, draftFromProfile, type ProfileDraft } from '../components/ProfileForm';
import { Avatar, Body, Button, Screen } from '../components/ui';
import { useMe } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { space } from '../lib/theme';

export default function EditProfile() {
  const { profile, refreshProfile } = useMe();
  const [draft, setDraft] = useState<ProfileDraft>(() => draftFromProfile(profile));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (result.canceled) return;
    setUploading(true);
    try {
      const asset = result.assets[0];
      const bytes = await (await fetch(asset.uri)).arrayBuffer();
      const path = `${profile.id}/avatar-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, bytes, { contentType: asset.mimeType ?? 'image/jpeg', upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id);
      await refreshProfile();
    } catch (e: any) {
      Alert.alert('Upload failed', e.message ?? String(e));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update(draft).eq('id', profile.id);
    setSaving(false);
    if (error) return Alert.alert('Could not save', error.message);
    await refreshProfile();
    router.back();
  };

  return (
    <Screen>
      <Pressable onPress={pickPhoto} style={{ alignItems: 'center', marginBottom: space.xl }}>
        <Avatar name={profile.display_name} url={profile.avatar_url} size={96} />
        <Body muted style={{ marginTop: space.sm }}>{uploading ? 'Uploading…' : 'Change photo'}</Body>
      </Pressable>
      {(['basics', 'research', 'fun', 'privacy'] as const).map((s) => (
        <View key={s} style={{ marginBottom: space.xl }}>
          <ProfileSection section={s} draft={draft} setDraft={setDraft} city={profile.city} />
        </View>
      ))}
      <Button title="Save" onPress={save} loading={saving} />
    </Screen>
  );
}
