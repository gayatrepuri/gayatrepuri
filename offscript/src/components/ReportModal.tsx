// A pop-up for reporting a person or post. Reports land in the `reports`
// table, which you check in the Supabase dashboard (docs/SETUP_GUIDE.md, step 10).
import { useState } from 'react';
import { Alert, Modal, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, radius, space } from '../lib/theme';
import { Button, Chip, ChipRow, H2, Input } from './ui';

const REASONS = ['Spam or scam', 'Harassment or hate', 'Fake profile', 'Inappropriate content', 'Something else'];

export function ReportModal({
  visible,
  onClose,
  reporterId,
  targetUser,
  targetPost,
}: {
  visible: boolean;
  onClose: () => void;
  reporterId: string;
  targetUser?: string;
  targetPost?: string;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setBusy(true);
    const { error } = await supabase.from('reports').insert({
      reporter_id: reporterId,
      target_user: targetUser ?? null,
      target_post: targetPost ?? null,
      reason: details.trim() ? `${reason}: ${details.trim()}` : reason,
    });
    setBusy(false);
    if (error) return Alert.alert('Could not send report', error.message);
    setReason(null);
    setDetails('');
    onClose();
    Alert.alert('Thank you', 'We read every report and will look into it.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#0006' }}>
        <View style={{ backgroundColor: colors.paper, padding: space.xl, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
          <H2 style={{ marginBottom: space.md }}>What’s wrong?</H2>
          <ChipRow>
            {REASONS.map((r) => (
              <Chip key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />
            ))}
          </ChipRow>
          <View style={{ height: space.md }} />
          <Input label="Anything else? (optional)" value={details} onChangeText={setDetails} multiline maxLength={800} />
          <Button title="Send report" onPress={submit} loading={busy} disabled={!reason} />
          <Button title="Cancel" variant="ghost" onPress={onClose} style={{ marginTop: space.sm, borderWidth: 0 }} />
        </View>
      </View>
    </Modal>
  );
}
