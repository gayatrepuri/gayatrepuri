// The "frame" around the whole app: loads fonts, keeps track of who is
// logged in, and decides which screens they're allowed to see.
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../lib/auth';
import '../lib/webAlert';
import { colors, fonts } from '../lib/theme';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { session, profile, loading } = useAuth();
  // fonts live in assets/fonts (so the web version can find them too)
  const [fontsLoaded, fontError] = useFonts({
    MrsSaintDelafield_400Regular: require('../../assets/fonts/MrsSaintDelafield_400Regular.ttf'),
    RammettoOne_400Regular: require('../../assets/fonts/RammettoOne_400Regular.ttf'),
    Sacramento_400Regular: require('../../assets/fonts/Sacramento_400Regular.ttf'),
    CourierPrime_400Regular: require('../../assets/fonts/CourierPrime_400Regular.ttf'),
    CourierPrime_400Regular_Italic: require('../../assets/fonts/CourierPrime_400Regular_Italic.ttf'),
    CourierPrime_700Bold: require('../../assets/fonts/CourierPrime_700Bold.ttf'),
  });
  // if a font ever fails to load, carry on with standard fonts rather than a blank screen
  const ready = (fontsLoaded || fontError != null) && !loading;

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
