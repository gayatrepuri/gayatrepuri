// Turns database errors into a friendly pop-up.
import { Alert } from 'react-native';

export function handleError(error: { message?: string } | null | undefined) {
  if (!error) return false;
  Alert.alert('Hmm', error.message ?? 'Something went wrong.');
  return true;
}
