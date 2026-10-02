// Type in the code from your email, on a little card over the gingham.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, useWindowDimensions, View } from 'react-native';
import { Gingham } from '../../components/Gingham';
import { Sticker } from '../../components/Sticker';
import { TornPaper } from '../../components/TornPaper';
import { Body, Button, H1, Input, Screen } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { space } from '../../lib/theme';

export default function Verify() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const cardW = Math.min(useWindowDimensions().width - 32, 360);

  const verify = async () => {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) Alert.alert('Hmm', 'That code didn’t work');
    // on success the app moves you on automatically (see src/app/_layout.tsx)
  };

  return (
    <View style={{ flex: 1 }}>
      <Gingham />
      <Screen bg="transparent" style={{ flexGrow: 1, justifyContent: 'center' }}>
        <TornPaper width={cardW} height={400} seed={9} style={{ padding: space.xl, alignSelf: 'center', justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: space.lg }}>
            <Sticker name="envelope" size={72} />
            <H1 style={{ marginTop: space.sm }}>Check your post</H1>
            <Body muted>{email}</Body>
          </View>
          <Input
            value={code}
            onChangeText={setCode}
            placeholder="······"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={8}
            style={{ fontSize: 26, letterSpacing: 10, textAlign: 'center' }}
          />
          <Button title="Let me in" onPress={verify} loading={busy} disabled={code.trim().length < 6} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.xl, marginTop: space.lg }}>
            <Body muted onPress={() => router.back()}>← back</Body>
            <Body
              muted
              style={{ textDecorationLine: 'underline' }}
              onPress={async () => {
                await supabase.auth.signInWithOtp({ email });
                Alert.alert('Sent again');
              }}
            >
              resend
            </Body>
          </View>
        </TornPaper>
      </Screen>
    </View>
  );
}
