// Landing page: logo, email, one button. That's it.
// (Long-press the logo to reveal a password box — only for test accounts,
// e.g. the one you give Apple's reviewers. See docs/SETUP_GUIDE.md.)
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, View } from 'react-native';
import { Sticker } from '../../components/Sticker';
import { Button, Input, Logo, Screen, Script, Tap } from '../../components/ui';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { space } from '../../lib/theme';

export default function Welcome() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [notYet, setNotYet] = useState(false);

  // the little stickers gently float
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [float]);
  const bob = (dist: number, rotate = '0deg') => ({
    transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, dist] }) }, { rotate }],
  });

  const sendCode = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean.includes('@')) return;
    if (!isSupabaseConfigured) return Alert.alert('Setup needed', 'Add your Supabase keys to .env');
    setBusy(true);
    setNotYet(false);
    const { data: allowed } = await supabase.rpc('is_allowed_email', { email: clean });
    if (!allowed) {
      setBusy(false);
      return setNotYet(true);
    }
    const { error } = await supabase.auth.signInWithOtp({ email: clean, options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return Alert.alert('Hmm', error.message);
    router.push({ pathname: '/verify', params: { email: clean } });
  };

  const passwordLogin = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error) Alert.alert('Hmm', error.message);
  };

  return (
    <Screen style={{ flexGrow: 1, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: space.xxl }}>
        <View style={{ flexDirection: 'row', gap: space.xl, marginBottom: space.md }}>
          <Animated.View style={bob(-6, '-12deg')}>
            <Sticker name="ticket" size={44} />
          </Animated.View>
          <Animated.View style={bob(5)}>
            <Sticker name="waxheart" size={44} />
          </Animated.View>
          <Animated.View style={bob(-4, '10deg')}>
            <Sticker name="coffee" size={44} />
          </Animated.View>
        </View>
        <Tap onLongPress={() => setUsePassword(!usePassword)}>
          <Logo size={76} />
        </Tap>
      </View>

      <Input
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setNotYet(false);
        }}
        placeholder="university email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        returnKeyType="go"
        onSubmitEditing={usePassword ? passwordLogin : sendCode}
        style={{ textAlign: 'center' }}
      />
      {usePassword ? (
        <Input value={password} onChangeText={setPassword} placeholder="password" secureTextEntry style={{ textAlign: 'center' }} />
      ) : null}

      {notYet ? (
        <View style={{ alignItems: 'center', marginVertical: space.md }}>
          <Sticker name="postcard" size={48} />
          <Script style={{ textAlign: 'center' }}>we aren’t there yet ✿</Script>
        </View>
      ) : (
        <Button
          title={usePassword ? 'Sign in' : 'Continue'}
          onPress={usePassword ? passwordLogin : sendCode}
          loading={busy}
          disabled={!email.includes('@')}
        />
      )}
    </Screen>
  );
}
