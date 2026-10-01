// Type in the 6-digit code from your email.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Body, Button, H1, Input, Screen } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { space } from '../../lib/theme';

export default function Verify() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const verify = async () => {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) Alert.alert('That code didn’t work', error.message);
    // On success the app automatically moves you on (see src/app/_layout.tsx).
  };

  const resend = async () => {
    await supabase.auth.signInWithOtp({ email });
    Alert.alert('Sent', 'A fresh code is on its way.');
  };

  return (
    <Screen style={{ flexGrow: 1, justifyContent: 'center' }}>
      <H1>Check your inbox</H1>
      <Body muted style={{ marginTop: space.sm, marginBottom: space.xl }}>
        We sent a login code to {email}. It can take a minute — peek in junk too.
      </Body>
      <Input
        label="Code"
        value={code}
        onChangeText={setCode}
        placeholder="123456"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        maxLength={8}
        style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
      />
      <Button title="Let me in" onPress={verify} loading={busy} disabled={code.trim().length < 6} />
      <Button title="Send a new code" variant="ghost" onPress={resend} style={{ marginTop: space.md }} />
      <Button title="Use a different email" variant="ghost" onPress={() => router.back()} style={{ marginTop: space.md, borderWidth: 0 }} />
    </Screen>
  );
}
