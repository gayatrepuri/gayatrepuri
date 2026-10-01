// "Me": your profile, your plan, settings, sign out and delete account.
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, Platform, View } from 'react-native';
import { ProfileDetails } from '../../components/ProfileDetails';
import { Avatar, Body, Button, Card, H1, H2, Label, Screen } from '../../components/ui';
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
    Alert.alert('Delete your account?', 'This permanently deletes your profile, posts and messages. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete forever',
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
      <View style={{ alignItems: 'center', marginBottom: space.lg }}>
        <Avatar name={profile.display_name} url={profile.avatar_url} size={96} />
        <H1 style={{ marginTop: space.md, textAlign: 'center' }}>
          {profile.display_name}
          {profile.is_plus ? ' ✦' : ''}
        </H1>
        <Body muted>
          {profile.university} · {profile.city}
        </Body>
      </View>

      <Button title="Edit profile & privacy" variant="butter" onPress={() => router.push('/edit-profile')} />

      {/* Plan card */}
      <Card tone={profile.is_plus ? 'butter' : 'maroon'} style={{ marginVertical: space.xl }}>
        <H2 style={{ color: profile.is_plus ? colors.maroon : colors.butter }}>
          {profile.is_plus ? 'Offscript Plus ✦' : 'Free plan'}
        </H2>
        {usage && !usage.is_plus ? (
          <View style={{ marginTop: space.sm }}>
            <Body style={{ color: colors.butter }}>
              Posts this month: {usage.posts_this_month}/{usage.limits.posts_per_month}
            </Body>
            <Body style={{ color: colors.butter }}>
              Meetups joined this month: {usage.joins_this_month}/{usage.limits.joins_per_month}
            </Body>
            <Body style={{ color: colors.butter }}>
              Match requests this week: {usage.connections_this_week}/{usage.limits.connections_per_week}
            </Body>
            <Button title="Go unlimited — Plus" variant="butter" onPress={() => router.push('/plus')} style={{ marginTop: space.md }} />
          </View>
        ) : (
          <Body style={{ marginTop: space.sm }}>Unlimited everything. Thank you for supporting Offscript!</Body>
        )}
      </Card>

      <Label>How others see you</Label>
      <Card style={{ marginBottom: space.xl }}>
        <ProfileDetails person={profile} visible={profile.visible_fields} />
      </Card>

      <Button
        title="Manage subscription"
        variant="ghost"
        onPress={() =>
          Linking.openURL(
            Platform.OS === 'android'
              ? 'https://play.google.com/store/account/subscriptions'
              : 'https://apps.apple.com/account/subscriptions',
          )
        }
        style={{ marginBottom: space.md }}
      />
      <Button title="Sign out" variant="ghost" onPress={signOut} style={{ marginBottom: space.md }} />
      <Button title="Delete my account" variant="danger" onPress={deleteAccount} />
    </Screen>
  );
}
