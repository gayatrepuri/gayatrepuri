// A chat thread with live updates. Used for both the group chat on a
// meetup post and private messages between two matched people.
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { handleError } from '../lib/errors';
import { timeAgo } from '../lib/format';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius, space } from '../lib/theme';
import type { ChatMessage } from '../lib/types';

type Props =
  | { mode: 'post'; postId: string; myId: string; names: Record<string, string> }
  | { mode: 'dm'; otherId: string; myId: string; names: Record<string, string> };

export function Chat(props: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const { myId } = props;
  const threadKey = props.mode === 'post' ? props.postId : props.otherId;

  const load = useCallback(async () => {
    const query =
      props.mode === 'post'
        ? supabase.from('post_messages').select('id, sender_id, body, created_at').eq('post_id', props.postId)
        : supabase
            .from('direct_messages')
            .select('id, sender_id, body, created_at')
            .or(
              `and(sender_id.eq.${myId},recipient_id.eq.${props.otherId}),and(sender_id.eq.${props.otherId},recipient_id.eq.${myId})`,
            );
    const { data } = await query.order('created_at', { ascending: true }).limit(300);
    setMessages((data as ChatMessage[]) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mode, threadKey, myId]);

  useEffect(() => {
    load();
    const table = props.mode === 'post' ? 'post_messages' : 'direct_messages';
    const channel = supabase
      .channel(`chat-${threadKey}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          ...(props.mode === 'post' ? { filter: `post_id=eq.${props.postId}` } : {}),
        },
        (payload) => {
          const m = payload.new as ChatMessage & { recipient_id?: string };
          if (props.mode === 'dm' && ![m.sender_id, m.recipient_id].includes(props.otherId)) return;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadKey]);

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    const { data, error } =
      props.mode === 'post'
        ? await supabase
            .from('post_messages')
            .insert({ post_id: props.postId, sender_id: myId, body })
            .select('id, sender_id, body, created_at')
            .single()
        : await supabase
            .from('direct_messages')
            .insert({ sender_id: myId, recipient_id: props.otherId, body })
            .select('id, sender_id, body, created_at')
            .single();
    if (handleError(error)) {
      setDraft(body);
      return;
    }
    if (data) setMessages((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data as ChatMessage]));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ padding: space.lg, gap: space.sm }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <Text style={{ fontFamily: fonts.script, fontSize: 26, color: colors.boho, textAlign: 'center', marginTop: 40 }}>
            say hello ✿
          </Text>
        }
        renderItem={({ item }) => {
          const mine = item.sender_id === myId;
          return (
            <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              {!mine && props.mode === 'post' ? (
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: colors.boho, marginBottom: 2 }}>
                  {props.names[item.sender_id] ?? 'Someone'}
                </Text>
              ) : null}
              <View
                style={{
                  backgroundColor: mine ? colors.maroon : colors.white,
                  borderRadius: radius.md,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ fontFamily: fonts.body, fontSize: 15, color: mine ? colors.butter : colors.coffee }}>
                  {item.body}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 10,
                  color: colors.boho,
                  marginTop: 2,
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                }}
              >
                {timeAgo(item.created_at)}
              </Text>
            </View>
          );
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          padding: space.md,
          gap: space.sm,
          borderTopWidth: 1,
          borderTopColor: colors.cream,
          backgroundColor: colors.paper,
        }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a message…"
          placeholderTextColor={colors.boho}
          multiline
          style={{
            flex: 1,
            backgroundColor: colors.white,
            borderRadius: radius.lg,
            paddingHorizontal: 14,
            paddingVertical: 10,
            fontFamily: fonts.body,
            fontSize: 15,
            maxHeight: 120,
          }}
        />
        <Pressable
          onPress={send}
          style={{
            backgroundColor: colors.maroon,
            borderRadius: radius.pill,
            paddingHorizontal: 18,
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: fonts.bodyBold, color: colors.butter }}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
