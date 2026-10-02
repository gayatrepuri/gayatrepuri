// Landing page: a maroon envelope on a gingham tablecloth.
//  1. the flap opens
//  2. a letter slides out and "Offscript" is typed onto it
//  3. the letter's second fold opens and asks for your email
// (Long-press "Offscript" on the letter to reveal a password box. It's only
//  for test accounts, e.g. the one you give Apple's reviewers. See docs/SETUP_GUIDE.md.)
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Gingham } from '../../components/Gingham';
import { LogoFrame } from '../../components/LogoFrame';
import { TornPaper, tornPath } from '../../components/TornPaper';
import { Sticker } from '../../components/Sticker';
import { Button, Script, styles as ui, Tap } from '../../components/ui';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { colors, fonts, space } from '../../lib/theme';

const WORD = 'Offscript';
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
  const P1 = LW * 0.5; // letter: top panel (the word)
  const P2 = LW * 0.8; // letter: second fold (the email box)
  const SH = P1 + P2 + EH * 0.55; // whole stage height
  const envTop0 = SH / 2 - EH / 2;
  const letterTop0 = envTop0 + 6;
  const risen = envTop0 - P1 * 0.85 - letterTop0; // how far the letter slides up
  const letterFinal = 0 - letterTop0;
  const envFinal = P1 + P2 - EH * 0.45 - envTop0;

  // ---- animation values ----
  const flap = useRef(new Animated.Value(1)).current; // 1 = closed, -1 = flipped open
  const letterY = useRef(new Animated.Value(0)).current;
  const envY = useRef(new Animated.Value(0)).current;
  const unfold = useRef(new Animated.Value(0)).current; // second fold: 0 = folded, 1 = open
  const caret = useRef(new Animated.Value(1)).current;
  const frameIn = useRef(new Animated.Value(0)).current; // scalloped frame around the word
  const [flapOpen, setFlapOpen] = useState(false);
  const [letterOut, setLetterOut] = useState(false);
  const [typed, setTyped] = useState(0);
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
    Animated.loop(
      Animated.sequence([
        Animated.timing(caret, { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.timing(caret, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    ).start();

    (async () => {
      await wait(500);
      // 1. open the flap (it slips behind the letter halfway through)
      setTimeout(() => alive && setFlapOpen(true), 330);
      await play(Animated.timing(flap, { toValue: -1, duration: 700, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }));
      // 2. the letter slides out...
      await play(Animated.timing(letterY, { toValue: risen, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }));
      // ...and the word is typed, one letter at a time
      for (let i = 1; i <= WORD.length && alive; i++) {
        setTyped(i);
        await wait(110);
      }
      await play(Animated.timing(frameIn, { toValue: 1, duration: 600, useNativeDriver: true }));
      if (!alive) return;
      // 3. letter comes fully out, envelope drops behind it, second fold opens
      setLetterOut(true);
      await play(
        Animated.parallel([
          Animated.timing(letterY, { toValue: letterFinal, duration: 650, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
          Animated.timing(envY, { toValue: envFinal, duration: 650, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        ]),
      );
      await play(Animated.spring(unfold, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }));
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

  // rotate/scale around an edge instead of the middle
  const aroundTop = (h: number, t: Animated.AnimatedInterpolation<number> | Animated.Value) => [
    { translateY: -h / 2 },
    { scaleY: t },
    { translateY: h / 2 },
  ];

  const typedWord = WORD.slice(0, typed);

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
              transform: [{ translateY: envY }, ...aroundTop(FH, flap)],
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
              top: letterTop0,
              left: LX,
              width: LW,
              zIndex: letterOut ? 6 : 3,
              transform: [{ translateY: letterY }],
            }}
          >
            {/* top panel: the typed word, then its scalloped frame */}
            <TornPaper width={LW} height={P1} edges={{ top: true, left: true, right: true }} seed={3} style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Tap onLongPress={() => setUsePassword(!usePassword)}>
                <LogoFrame width={Math.min(LW * 0.82, (P1 / 0.66) * 0.96)} frameOpacity={frameIn}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -P1 * 0.06 }}>
                    <Text style={{ fontFamily: fonts.logo, fontSize: LW * 0.17, color: colors.maroon, lineHeight: LW * 0.26 }}>
                      {typedWord || ' '}
                    </Text>
                    {!ready ? (
                      <Animated.Text style={{ opacity: caret, fontFamily: fonts.body, fontSize: LW * 0.1, color: colors.maroon }}>|</Animated.Text>
                    ) : null}
                  </View>
                </LogoFrame>
              </Tap>
            </TornPaper>
            {/* gold wax seal holding the letter (appears once it's out of the envelope) */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -20,
                left: LW / 2 - 22,
                opacity: letterY.interpolate({ inputRange: [risen, risen * 0.4], outputRange: [1, 0], extrapolate: 'clamp' }),
              }}
            >
              <Sticker name="goldseal" size={44} />
            </Animated.View>

            {/* second fold: opens downward and asks for your email */}
            <Animated.View style={{ height: P2, transform: aroundTop(P2, unfold) }}>
              <TornPaper width={LW} height={P2} edges={{ left: true, right: true, bottom: true }} seed={5} style={{ padding: space.lg, justifyContent: 'center' }}>
                {/* the fold crease */}
                <View style={{ position: 'absolute', top: 0, left: 4, right: 4, height: 1, backgroundColor: '#D8C9AA' }} />
                <TextInput
                  ref={inputRef}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
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
                <View style={{ height: space.lg }} />
                {notYet ? (
                  <View style={{ alignItems: 'center' }}>
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
              </TornPaper>
              {/* a soft shadow that lifts as the fold opens */}
              <Animated.View
                pointerEvents="none"
                style={{ position: 'absolute', top: 0, left: 0, opacity: unfold.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }) }}
              >
                <Svg width={LW} height={P2}>
                  <Path d={tornPath(LW, P2, { left: true, right: true, bottom: true }, 5)} fill={colors.tamarind} />
                </Svg>
              </Animated.View>
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
