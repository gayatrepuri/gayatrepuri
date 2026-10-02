// On phones, Alert.alert shows a native pop-up. In a web browser it does
// nothing, so on the web version we show the browser's own pop-ups instead.
import { Alert, Platform, type AlertButton } from 'react-native';

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  Alert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const text = [title, message].filter(Boolean).join('\n\n');
    const actions = (buttons ?? []).filter((b) => b.style !== 'cancel');
    if (!buttons || buttons.length <= 1) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }
    // "Cancel" + one action → OK/Cancel box; the action runs on OK
    if (window.confirm(text)) actions[actions.length - 1]?.onPress?.();
    else buttons.find((b) => b.style === 'cancel')?.onPress?.();
  };
}
