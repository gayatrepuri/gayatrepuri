// Private chat with one of your matches.
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Chat } from '../../components/Chat';
import { useMe } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { colors, fonts } from '../../lib/theme';

export default function DirectMessage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useMe();
  const [name, setName] = useState('');

  useEffect(() => {
    supabase
      .from('public_profiles')
      .select('display_name')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => setName(data?.display_name ?? ''));
  }, [id]);

  return (
    <>
      <Stack.Screen
        options={{
          title: name,
          headerRight: () => (
            <Pressable onPress={() => router.push(`/person/${id}`)}>
              <Text style={{ fontFamily: fonts.bodyBold, color: colors.maroon }}>Profile</Text>
            </Pressable>
          ),
        }}
      />
      <Chat mode="dm" otherId={id} myId={userId} names={{}} />
    </>
  );
}
