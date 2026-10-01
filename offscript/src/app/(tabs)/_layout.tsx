// The bottom tab bar, with sticker icons that lift up when selected.
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';
import { Sticker, type StickerName } from '../../components/Sticker';
import { colors, fonts } from '../../lib/theme';

const icon = (name: StickerName) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return (
      <View style={{ opacity: focused ? 1 : 0.55, transform: [{ scale: focused ? 1.15 : 1 }, { rotate: focused ? '-6deg' : '0deg' }] }}>
        <Sticker name={name} size={30} />
      </View>
    );
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.maroon,
        tabBarInactiveTintColor: colors.boho,
        tabBarStyle: { backgroundColor: colors.cream, borderTopColor: colors.line, height: 84, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Board', tabBarIcon: icon('clip') }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches', tabBarIcon: icon('waxheart') }} />
      <Tabs.Screen name="inbox" options={{ title: 'Post', tabBarIcon: icon('envelope') }} />
      <Tabs.Screen name="profile" options={{ title: 'Me', tabBarIcon: icon('bunny') }} />
    </Tabs>
  );
}
