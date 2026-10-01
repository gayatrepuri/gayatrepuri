// The building blocks every screen uses: buttons, inputs, chips, cards...
// They all share the Offscript look from src/lib/theme.ts.
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
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

/** The "Offscript" wordmark in the swashy script font. */
export function Logo({ size = 56, color = colors.maroon }: { size?: number; color?: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: fonts.logo, fontSize: size, color, lineHeight: size * 1.35 }}>Offscript</Text>
      <Text
        style={{
          fontFamily: fonts.bodyBold,
          fontSize: size * 0.2,
          letterSpacing: size * 0.06,
          color,
          marginTop: -size * 0.02,
        }}
      >
        LONDON · CAMBRIDGE
      </Text>
    </View>
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
  numberOfLines,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  muted?: boolean;
  numberOfLines?: number;
  onPress?: () => void;
}) {
  return (
    <Text numberOfLines={numberOfLines} onPress={onPress} style={[styles.body, muted && { color: colors.boho }, style]}>
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
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
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
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: p.bg, borderColor: p.border, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <Text style={[styles.buttonText, { color: p.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Input({ label, style, ...props }: TextInputProps & { label?: string }) {
  return (
    <View style={{ marginBottom: space.md }}>
      {label ? <Label>{label}</Label> : null}
      <TextInput
        placeholderTextColor={colors.boho + '99'}
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
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        small && { paddingVertical: 4, paddingHorizontal: 10 },
        selected && { backgroundColor: colors.maroon, borderColor: colors.maroon },
      ]}
    >
      <Text style={[styles.chipText, small && { fontSize: 12 }, selected && { color: colors.butter }]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>{children}</View>;
}

export function Card({
  children,
  style,
  tone = 'white',
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'white' | 'butter' | 'blue' | 'maroon';
  onPress?: () => void;
}) {
  const bg = { white: colors.white, butter: colors.butter, blue: colors.babyBlue, maroon: colors.maroon }[tone];
  const content = <View style={[styles.card, { backgroundColor: bg }, style]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      {content}
    </Pressable>
  );
}

export function Avatar({ name, url, size = 44 }: { name?: string | null; url?: string | null; size?: number }) {
  if (url) {
    return <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  const initials = (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.babyBlue,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.heading, color: colors.maroon, fontSize: size * 0.4 }}>{initials}</Text>
    </View>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xxl }}>
      <Script style={{ fontSize: 34 }}>{title}</Script>
      {hint ? <Body muted style={{ textAlign: 'center', marginTop: space.sm }}>{hint}</Body> : null}
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxl }}>
      <ActivityIndicator color={colors.maroon} />
    </View>
  );
}

export const styles = StyleSheet.create({
  h1: { fontFamily: fonts.heading, fontSize: 32, color: colors.maroon, letterSpacing: 1 },
  h2: { fontFamily: fonts.heading, fontSize: 22, color: colors.maroon, letterSpacing: 0.5 },
  script: { fontFamily: fonts.script, fontSize: 26, color: colors.maroonSoft },
  body: { fontFamily: fonts.body, fontSize: 15, color: colors.coffee, lineHeight: 21 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.boho,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  button: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontFamily: fonts.bodyBold, fontSize: 15, letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cream,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.coffee,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.maroon + '55',
    backgroundColor: colors.white,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.maroon },
  card: {
    borderRadius: radius.lg,
    padding: space.lg,
    shadowColor: colors.tamarind,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
