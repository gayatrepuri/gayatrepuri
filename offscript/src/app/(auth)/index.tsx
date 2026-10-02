// Landing page: a maroon envelope on a gingham tablecloth.
//  1. the flap opens
//  2. a torn-paper letter slides out, already showing "Offscript" and the email box
// (Long-press "Offscript" on the letter to reveal a password box. It's only
//  for test accounts, e.g. the one you give Apple's reviewers. See docs/SETUP_GUIDE.md.)
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, KeyboardAvoidingView, Platform, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Gingham } from '../../components/Gingham';
import { Sticker } from '../../components/Sticker';
import { TornPaper } from '../../components/TornPaper';
import { Button, Script, styles as ui, Tap } from '../../components/ui';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { colors, fonts, space } from '../../lib/theme';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const play = (a: Animated.CompositeAnimation) => new Promise<void>((r) => a.start(() => r()));

export default function Welcome() {
  const { width: screenW } = useWindowDimensions();

  // ---- sizes (everything scales with the screen width) ----
  const W = Math.min(screenW - 48, 340); // envelope width
  const EH = W * 0.64; // envelope height
  const FH = EH * 0.56; // flap height
  const LW = W * 0.88; // letter width
  const LX = (W - LW) / 2;
  const LH = LW * 1.02; // letter height
  const SH = LH + EH * 0.45; // whole stage height
  const envTop0 = (SH - EH) / 2;
  const envFinal = LH - EH * 0.45 - envTop0; // envelope ends up peeking out under the letter
  const S0 = 0.6; // the letter starts small, tucked inside the envelope
  const yInside = envTop0 + EH / 2 - LH / 2;
  const yPeek = yInside - W * 0.3;

  // ---- animation values ----
  const flap = useRef(new Animated.Value(1)).current; // 1 = closed, -1 = flipped open
  const t = useRef(new Animated.Value(0)).current; // letter: 0 inside → 1 peeking out → 2 fully out
  const [flapOpen, setFlapOpen] = useState(false);
  const [letterOut, setLetterOut] = useState(false);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // ---- form ----
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [notYet, setNotYet] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      await wait(450);
      // 1. open the flap (it slips behind the letter halfway through)
      setTimeout(() => alive && setFlapOpen(true), 330);
      await play(Animated.timing(flap, { toValue: -1, duration: 700, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }));
      // 2. the letter peeks out of the envelope...
      await play(Animated.timing(t, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }));
      if (!alive) return;
      // ...then comes all the way out towards you while the envelope drops behind it
      setLetterOut(true);
      await play(Animated.timing(t, { toValue: 2, duration: 750, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }));
      if (!alive) return;
      setReady(true);
      inputRef.current?.focus();
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const envY = t.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 0, envFinal] });
  const letterY = t.interpolate({ inputRange: [0, 1, 2], outputRange: [yInside, yPeek, 0] });
  const letterScale = t.interpolate({ inputRange: [0, 1, 2], outputRange: [S0, S0, 1] });
  const sealOpacity = t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 0, 1] });

  return (
    <View style={{ flex: 1 }}>
      <Gingham />
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ width: W, height: SH }}>
          {/* envelope: back panel */}
          <Animated.View style={{ position: 'absolute', top: envTop0, left: 0, zIndex: 1, transform: [{ translateY: envY }] }}>
            <Svg width={W} height={EH}>
              <Rect x={0} y={0} width={W} height={EH} rx={4} fill="#4E0709" />
            </Svg>
          </Animated.View>

          {/* envelope: flap (in front while closed, behind the letter once open) */}
          <Animated.View
            style={{
              position: 'absolute',
              top: envTop0,
              left: 0,
              zIndex: flapOpen ? 2 : 5,
              // flip around the top edge
              transform: [{ translateY: envY }, { translateY: -FH / 2 }, { scaleY: flap }, { translateY: FH / 2 }],
            }}
          >
            <Svg width={W} height={FH}>
              <Defs>
                <LinearGradient id="flapG" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#7A1013" />
                  <Stop offset="1" stopColor="#9A2A2E" />
                </LinearGradient>
              </Defs>
              <Path d={`M0 0 H${W} L${W / 2 + 10} ${FH - 4} Q${W / 2} ${FH + 2} ${W / 2 - 10} ${FH - 4} Z`} fill="url(#flapG)" stroke="#5C0A0C" strokeWidth={1} />
            </Svg>
            <View style={{ position: 'absolute', left: W / 2 - 20, top: FH - 30 }}>
              <Sticker name="waxheart" size={40} />
            </View>
          </Animated.View>

          {/* the letter */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: LX,
              width: LW,
              zIndex: letterOut ? 6 : 3,
              transform: [{ translateY: letterY }, { scale: letterScale }],
            }}
          >
            <TornPaper width={LW} height={LH} seed={3} style={{ paddingHorizontal: space.lg, paddingVertical: space.xl, justifyContent: 'space-evenly' }}>
              <Tap onLongPress={() => setUsePassword(!usePassword)}>
                <Text style={{ fontFamily: fonts.logo, fontSize: LW * 0.2, color: colors.maroon, textAlign: 'center', lineHeight: LW * 0.3 }}>
                  Offscript
                </Text>
              </Tap>

              <View>
                <TextInput
                  ref={inputRef}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setNotYet(false);
                  }}
                  placeholder="university email"
                  placeholderTextColor={colors.boho + '88'}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="go"
                  editable={ready}
                  onSubmitEditing={usePassword ? passwordLogin : sendCode}
                  style={lineInput}
                />
                {usePassword ? (
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="password"
                    placeholderTextColor={colors.boho + '88'}
                    secureTextEntry
                    style={[...lineInput, { marginTop: space.sm }]}
                  />
                ) : null}
              </View>

              {notYet ? (
                <Script style={{ textAlign: 'center' }}>we aren’t there yet ✿</Script>
              ) : (
                <Button
                  title={usePassword ? 'Sign in' : 'Continue'}
                  onPress={usePassword ? passwordLogin : sendCode}
                  loading={busy}
                  disabled={!email.includes('@')}
                />
              )}
            </TornPaper>

            {/* gold wax seal pinning the letter */}
            <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -20, left: LW / 2 - 22, opacity: sealOpacity }}>
              <Sticker name="goldseal" size={44} />
            </Animated.View>
          </Animated.View>

          {/* envelope: front pocket (in front of the letter while it's inside) */}
          <Animated.View style={{ position: 'absolute', top: envTop0, left: 0, zIndex: 4, transform: [{ translateY: envY }] }}>
            <Svg width={W} height={EH}>
              <Defs>
                <LinearGradient id="pocketG" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#8E1F23" />
                  <Stop offset="1" stopColor="#6B0B0C" />
                </LinearGradient>
              </Defs>
              <Path d={`M0 2 L${W / 2} ${EH * 0.56} L${W} 2 V${EH - 4} Q${W} ${EH} ${W - 4} ${EH} H4 Q0 ${EH} 0 ${EH - 4} Z`} fill="url(#pocketG)" />
              <Path d={`M0 ${EH} L${W * 0.42} ${EH * 0.5} M${W} ${EH} L${W * 0.58} ${EH * 0.5}`} stroke="#4E0709" strokeWidth={1} opacity={0.5} />
            </Svg>
            <View style={{ position: 'absolute', left: W / 2 - W * 0.11, top: EH * 0.58 }}>
              <Sticker name="bow" size={W * 0.22} />
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// the email/password lines: just an underline on the paper
const lineInput = [
  ui.input,
  {
    textAlign: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 1.5,
    borderRadius: 0,
    borderColor: colors.maroon + '66',
    position: 'relative', // keep it in front of the paper texture
    zIndex: 1,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  } as any,
];
