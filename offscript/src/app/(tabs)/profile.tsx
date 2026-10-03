// "Me": your framed portrait, your stickers, your plan and settings.
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, Platform, View } from 'react-native';
import { GoldFrame } from '../../components/GoldFrame';
import { ProfileDetails } from '../../components/ProfileDetails';
import { Body, Button, Card, GinghamBand, H1, Screen, Tap } from '../../components/ui';
import { useAuth, useMe } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { colors, space } from '../../lib/theme';
import type { Usage } from '../../lib/types';

export default function Me() {
  const { profile, refreshProfile } = useMe();
  const { signOut } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      supabase.rpc('get_my_usage').then(({ data }) => setUsage(data as Usage));
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
          {profile.is_plus ? ' ✦' : ''}
        </H1>
        <Body muted>{profile.university}</Body>
      </View>

      <Button title="Edit" variant="blue" sticker="clip" onPress={() => router.push('/edit-profile')} />

      {usage && !usage.is_plus ? (
        <Card tone="maroon" onPress={() => router.push('/plus')} style={{ marginTop: space.xl }}>
          <Body style={{ color: colors.butter, textAlign: 'center' }}>
            {usage.posts_this_month}/{usage.limits.posts_per_month} posts · {usage.joins_this_month}/{usage.limits.joins_per_month} joins ·{' '}
            {usage.connections_this_week}/{usage.limits.connections_per_week} hellos
          </Body>
          <Body bold style={{ color: colors.butter, textAlign: 'center', marginTop: 4 }}>
            Go unlimited ✦
          </Body>
        </Card>
      ) : null}

      <View style={{ marginTop: space.xl }}>
        <ProfileDetails person={profile} visible={profile.visible_fields} />
      </View>

      <View style={{ marginTop: space.xxl, alignItems: 'center', gap: space.md }}>
        {profile.is_plus ? (
          <Body
            muted
            onPress={() =>
              Linking.openURL(
                Platform.OS === 'android'
                  ? 'https://play.google.com/store/account/subscriptions'
                  : 'https://apps.apple.com/account/subscriptions',
              )
            }
          >
            manage subscription
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
