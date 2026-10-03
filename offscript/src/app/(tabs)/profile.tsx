// "Me": your framed portrait, your stickers and settings.
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Linking, View } from 'react-native';
import { GoldFrame } from '../../components/GoldFrame';
import { ProfileDetails } from '../../components/ProfileDetails';
import { Body, Button, GinghamBand, H1, Screen, Tap } from '../../components/ui';
import { useAuth, useMe } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { colors, space } from '../../lib/theme';

// Where businesses and event organisers can get in touch to sponsor Offscript.
// Set EXPO_PUBLIC_SPONSOR_EMAIL in .env; the link stays hidden until you do.
const SPONSOR_EMAIL = process.env.EXPO_PUBLIC_SPONSOR_EMAIL;

export default function Me() {
  const { profile, refreshProfile } = useMe();
  const { signOut } = useAuth();

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const deleteAccount = () =>
    Alert.alert('Delete your account?', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.rpc('delete_my_account');
          if (error) return Alert.alert('Could not delete', error.message);
          await signOut();
        },
      },
    ]);

  return (
    <Screen>
      <GinghamBand height={130} />
      <View style={{ alignItems: 'center', marginBottom: space.lg, marginTop: -110 }}>
        <Tap onPress={() => router.push('/edit-profile')}>
          <GoldFrame uri={profile.avatar_url} name={profile.display_name} width={220} />
        </Tap>
        <H1 style={{ marginTop: space.md, textAlign: 'center' }}>
          {profile.display_name}
        </H1>
        <Body muted>{profile.university}</Body>
      </View>

      <Button title="Edit" variant="blue" sticker="clip" onPress={() => router.push('/edit-profile')} />

      <View style={{ marginTop: space.xl }}>
        <ProfileDetails person={profile} visible={profile.visible_fields} />
      </View>

      <View style={{ marginTop: space.xxl, alignItems: 'center', gap: space.md }}>
        {SPONSOR_EMAIL ? (
          <Body muted onPress={() => Linking.openURL(`mailto:${SPONSOR_EMAIL}?subject=Sponsoring%20Offscript`)}>
            sponsor offscript
          </Body>
        ) : null}
        <Body muted onPress={signOut}>sign out</Body>
        <Body muted style={{ color: colors.danger, fontSize: 12 }} onPress={deleteAccount}>
          delete account
        </Body>
      </View>
    </Screen>
  );
}
