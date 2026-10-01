// Turns database errors into friendly messages, and sends people to the
// Plus screen when they hit a free-plan limit.
import { router } from 'expo-router';
import { Alert } from 'react-native';

const LIMIT_MESSAGES: Record<string, string> = {
  posts_per_month: "You've used this month's free posts.",
  joins_per_month: "You've joined this month's free meetups.",
  connections_per_week: "You've sent this week's free match requests.",
  hosted_events_active: 'Free accounts can host one upcoming event at a time.',
};

export function handleError(error: { message?: string } | null | undefined) {
  if (!error) return false;
  const msg = error.message ?? 'Something went wrong.';
  const limit = msg.match(/FREE_LIMIT:(\w+)/)?.[1];
  if (limit) {
    Alert.alert('Time to go Plus?', `${LIMIT_MESSAGES[limit] ?? "You've hit a free limit."} Upgrade to Offscript Plus for unlimited everything.`, [
      { text: 'Not now', style: 'cancel' },
      { text: 'See Plus', onPress: () => router.push('/plus') },
    ]);
  } else {
    Alert.alert('Oops', msg);
  }
  return true;
}
