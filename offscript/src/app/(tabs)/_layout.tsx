// The bottom tab bar.
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';
import { colors, fonts } from '../../lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.maroon,
        tabBarInactiveTintColor: colors.boho,
        tabBarStyle: { backgroundColor: colors.butter, borderTopColor: colors.butterDeep },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Noticeboard', tabBarIcon: icon('cafe-outline') }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches', tabBarIcon: icon('sparkles-outline') }} />
      <Tabs.Screen name="inbox" options={{ title: 'Chats', tabBarIcon: icon('chatbubbles-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Me', tabBarIcon: icon('person-circle-outline') }} />
    </Tabs>
  );
}
