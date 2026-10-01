// Turns database errors into friendly messages, and sends people to the
// Plus screen when they hit a free-plan limit.
import { router } from 'expo-router';
import { Alert } from 'react-native';

const LIMIT_MESSAGES: Record<string, string> = {
  posts_per_month: "That's this month's free posts.",
  joins_per_month: "That's this month's free joins.",
  connections_per_week: "That's this week's free hellos.",
  hosted_events_active: 'One event at a time on free.',
};

export function handleError(error: { message?: string } | null | undefined) {
  if (!error) return false;
  const msg = error.message ?? 'Something went wrong.';
  const limit = msg.match(/FREE_LIMIT:(\w+)/)?.[1];
  if (limit) {
    Alert.alert('Go Plus ✦', LIMIT_MESSAGES[limit] ?? 'Free limit reached.', [
      { text: 'Not now', style: 'cancel' },
      { text: 'See Plus', onPress: () => router.push('/plus') },
    ]);
  } else {
    Alert.alert('Hmm', msg);
  }
  return true;
}
