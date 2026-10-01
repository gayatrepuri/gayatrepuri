// Group chat for a meetup (host + everyone who joined).
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Chat } from '../../../components/Chat';
import { useMe } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';

export default function PostChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useMe();
  const [title, setTitle] = useState('Group chat');
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data: post } = await supabase.from('feed_posts').select('title, author_id').eq('id', id).maybeSingle();
      if (post) setTitle(post.title);
      const { data: att } = await supabase.from('post_attendees').select('user_id').eq('post_id', id);
      const ids = [...(att ?? []).map((a) => a.user_id), post?.author_id].filter(Boolean) as string[];
      const { data: ppl } = await supabase.from('public_profiles').select('id, display_name').in('id', ids);
      setNames(Object.fromEntries((ppl ?? []).map((p) => [p.id, p.display_name])));
    })();
  }, [id]);

  return (
    <>
      <Stack.Screen options={{ title }} />
      <Chat mode="post" postId={id} myId={userId} names={names} />
    </>
  );
}
