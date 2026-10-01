// The "frame" around the whole app: loads fonts, keeps track of who is
// logged in, and decides which screens they're allowed to see.
import { DellaRespira_400Regular } from '@expo-google-fonts/della-respira';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Sacramento_400Regular } from '@expo-google-fonts/sacramento';
import { Yesteryear_400Regular } from '@expo-google-fonts/yesteryear';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../lib/auth';
import { colors, fonts } from '../lib/theme';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { session, profile, loading } = useAuth();
  const [fontsLoaded] = useFonts({
    Yesteryear_400Regular,
    DellaRespira_400Regular,
    Sacramento_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  const ready = fontsLoaded && !loading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const signedIn = Boolean(session);
  const onboarded = Boolean(profile?.onboarded);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.paper },
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.maroon,
        headerTitleStyle: { fontFamily: fonts.heading },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      {/* Logged out: welcome + email code screens */}
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* Logged in but hasn't answered the questions yet */}
      <Stack.Protected guard={signedIn && !onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      {/* The real app */}
      <Stack.Protected guard={signedIn && onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="post/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="post/[id]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="post/chat/[id]" options={{ headerShown: true, title: 'Group chat' }} />
        <Stack.Screen name="person/[id]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="dm/[id]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: true, title: 'Edit profile' }} />
        <Stack.Screen name="plus" options={{ presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootStack />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
