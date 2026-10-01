// The building blocks every screen uses: buttons, inputs, chips, cards...
// Everything you can tap gently squishes and gives a tiny vibration.
import * as Haptics from 'expo-haptics';
import { useRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, space } from '../lib/theme';
import { GoldAvatar } from './GoldFrame';
import { Sticker, type StickerName } from './Sticker';

export function haptic(kind: 'light' | 'success' = 'light') {
  if (Platform.OS === 'web') return;
  if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** A pressable that squishes when touched. */
export function Tap({
  children,
  onPress,
  onLongPress,
  style,
  disabled,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPressIn={() => to(0.95)}
      onPressOut={() => to(1)}
      onPress={
        onPress
          ? () => {
              haptic();
              onPress();
            }
          : undefined
      }
      onLongPress={onLongPress}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Screen({
  children,
  scroll = true,
  style,
  bg = colors.paper,
}: {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  bg?: string;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[{ padding: space.lg, paddingBottom: 120 }, style]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

/** The "Offscript" wordmark. */
export function Logo({ size = 56, color = colors.maroon }: { size?: number; color?: string }) {
  return (
    <Text style={{ fontFamily: fonts.logo, fontSize: size, color, lineHeight: size * 1.35, textAlign: 'center' }}>
      Offscript
    </Text>
  );
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.h1, style]}>{children}</Text>;
}
export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.h2, style]}>{children}</Text>;
}
export function Script({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.script, style]}>{children}</Text>;
}
export function Body({
  children,
  style,
  muted,
  bold,
  numberOfLines,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  muted?: boolean;
  bold?: boolean;
  numberOfLines?: number;
  onPress?: () => void;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      onPress={onPress}
      style={[styles.body, muted && { color: colors.boho }, bold && { fontFamily: fonts.bodyBold }, style]}
    >
      {children}
    </Text>
  );
}
export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

type ButtonVariant = 'primary' | 'butter' | 'blue' | 'ghost' | 'danger';
export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  sticker,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  sticker?: StickerName;
}) {
  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.maroon, fg: colors.butter, border: colors.maroon },
    butter: { bg: colors.butter, fg: colors.maroon, border: colors.maroon },
    blue: { bg: colors.babyBlue, fg: colors.tamarind, border: colors.babyBlue },
    ghost: { bg: 'transparent', fg: colors.maroon, border: colors.maroon },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.danger },
  };
  const p = palette[variant];
  return (
    <Tap
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, { backgroundColor: p.bg, borderColor: p.border, opacity: disabled ? 0.45 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {sticker ? <Sticker name={sticker} size={22} /> : null}
          <Text style={[styles.buttonText, { color: p.fg }]}>{title}</Text>
        </View>
      )}
    </Tap>
  );
}

export function Input({ label, style, ...props }: TextInputProps & { label?: string }) {
  return (
    <View style={{ marginBottom: space.md }}>
      {label ? <Label>{label}</Label> : null}
      <TextInput
        placeholderTextColor={colors.boho + '88'}
        style={[styles.input, props.multiline && { minHeight: 96, textAlignVertical: 'top' }, style]}
        {...props}
      />
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  small,
  sticker,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
  sticker?: StickerName;
}) {
  const body = (
    <View
      style={[
        styles.chip,
        small && { paddingVertical: 3, paddingHorizontal: 9 },
        selected && { backgroundColor: colors.maroon, borderColor: colors.maroon },
      ]}
    >
      {sticker ? <Sticker name={sticker} size={small ? 16 : 20} /> : null}
      <Text style={[styles.chipText, small && { fontSize: 11 }, selected && { color: colors.butter }]}>{label}</Text>
    </View>
  );
  return onPress ? <Tap onPress={onPress}>{body}</Tap> : body;
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>{children}</View>;
}

type Tone = 'white' | 'cream' | 'kraft' | 'butter' | 'blue' | 'maroon';
const TONE_BG: Record<Tone, string> = {
  white: colors.white,
  cream: colors.cream,
  kraft: colors.kraft,
  butter: colors.butter,
  blue: colors.babyBlue,
  maroon: colors.maroon,
};

export function Card({
  children,
  style,
  tone = 'cream',
  onPress,
  tilt = 0,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: Tone;
  onPress?: () => void;
  tilt?: number;
}) {
  const s = [styles.card, { backgroundColor: TONE_BG[tone], transform: [{ rotate: `${tilt}deg` }] }, style];
  return onPress ? (
    <Tap onPress={onPress} style={s}>
      {children}
    </Tap>
  ) : (
    <View style={s}>{children}</View>
  );
}

export const Avatar = ({ name, url, size = 44 }: { name?: string | null; url?: string | null; size?: number }) => (
  <GoldAvatar name={name} uri={url} size={size} />
);

export function Empty({ title, sticker = 'bunny' }: { title: string; sticker?: StickerName }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xxl, gap: space.sm }}>
      <Sticker name={sticker} size={72} />
      <Script style={{ fontSize: 30 }}>{title}</Script>
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxl, backgroundColor: colors.paper }}>
      <ActivityIndicator color={colors.maroon} />
    </View>
  );
}

export const styles = StyleSheet.create({
  h1: { fontFamily: fonts.heading, fontSize: 32, color: colors.maroon, letterSpacing: 1 },
  h2: { fontFamily: fonts.heading, fontSize: 22, color: colors.maroon, letterSpacing: 0.5 },
  script: { fontFamily: fonts.script, fontSize: 26, color: colors.maroonSoft },
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.coffee, lineHeight: 20 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.boho,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  button: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 13,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontFamily: fonts.bodyBold, fontSize: 15, letterSpacing: 0.3 },
  input: {
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.coffee,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.maroon + '44',
    backgroundColor: colors.cream,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: colors.maroon },
  card: {
    borderRadius: radius.sm,
    padding: space.lg,
    shadowColor: colors.tamarind,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});
