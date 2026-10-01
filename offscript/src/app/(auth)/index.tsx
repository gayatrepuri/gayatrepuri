// Welcome screen: enter your university email and we send you a 6-digit code.
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Body, Button, Input, Logo, Screen, Script } from '../../components/ui';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { colors, space } from '../../lib/theme';

export default function Welcome() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  // Password login is only for test accounts you create (e.g. for Apple's reviewers).
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');

  const passwordLogin = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error) Alert.alert('Could not sign in', error.message);
  };

  const sendCode = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean.includes('@')) return Alert.alert('Hmm', 'That doesn’t look like an email address.');
    if (!isSupabaseConfigured) {
      return Alert.alert('Almost there', 'Add your Supabase keys to the .env file first (see docs/SETUP_GUIDE.md).');
    }
    setBusy(true);
    const { data: allowed } = await supabase.rpc('is_allowed_email', { email: clean });
    if (!allowed) {
      setBusy(false);
      return Alert.alert(
        'Not yet!',
        'Offscript is only open to London and Cambridge universities for now. Please use your university email (e.g. name@ucl.ac.uk or abc12@cam.ac.uk).',
      );
    }
    const { error } = await supabase.auth.signInWithOtp({ email: clean, options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return Alert.alert('Could not send code', error.message);
    router.push({ pathname: '/verify', params: { email: clean } });
  };

  return (
    <Screen bg={colors.paper} style={{ flexGrow: 1, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: space.xxl }}>
        <Logo size={72} />
        <Script style={{ fontSize: 30, marginTop: space.lg, textAlign: 'center' }}>
          coffee runs, thesis rants & the people who get it
        </Script>
      </View>

      <Input
        label="Your university email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@ucl.ac.uk"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        returnKeyType="send"
        onSubmitEditing={sendCode}
      />
      {usePassword ? (
        <>
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
          <Button title="Sign in" onPress={passwordLogin} loading={busy} />
        </>
      ) : (
        <Button title="Send me a login code" onPress={sendCode} loading={busy} />
      )}

      <Body muted style={{ textAlign: 'center', marginTop: space.lg, fontSize: 13 }}>
        Only for students & researchers at London and Cambridge universities. No passwords — we email you a code.
      </Body>
      <Body
        muted
        style={{ textAlign: 'center', marginTop: space.xl, fontSize: 12, textDecorationLine: 'underline' }}
        onPress={() => setUsePassword(!usePassword)}
      >
        {usePassword ? 'Use an email code instead' : 'Test account? Sign in with a password'}
      </Body>
    </Screen>
  );
}
