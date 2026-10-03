// The Noticeboard: everything people have posted, newest first.
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '../../components/PostCard';
import { Sticker } from '../../components/Sticker';
import { Chip, Empty, GinghamBand, Logo, PaperLabel, Tap } from '../../components/ui';
import { POST_KINDS } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { colors, fonts, radius, space } from '../../lib/theme';
import type { FeedPost, PostKind } from '../../lib/types';

export default function Noticeboard() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [kind, setKind] = useState<PostKind | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    let q = supabase
      .from('feed_posts')
      .select('*')
      .eq('is_cancelled', false)
      // hide things that started more than 3 hours ago
      .or(`starts_at.is.null,starts_at.gte."${new Date(Date.now() - 3 * 3600_000).toISOString()}"`)
      .order('created_at', { ascending: false })
      .limit(100);
    if (kind !== 'all') q = q.eq('kind', kind);
    const { data } = await q;
    setPosts((data as FeedPost[]) ?? []);
  }, [kind]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const header = (
    <View>
      <GinghamBand height={124}>
        <PaperLabel>
          <Logo size={40} />
        </PaperLabel>
      </GinghamBand>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: space.lg }}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Chip label="All" selected={kind === 'all'} onPress={() => setKind('all')} />
          {POST_KINDS.map((k) => (
            <Chip key={k.kind} sticker={k.sticker} label={k.label} selected={kind === k.kind} onPress={() => setKind(k.kind)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={<Empty title="quiet in here" sticker="coffee" />}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.maroon}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      />

      <View style={{ position: 'absolute', right: space.lg, bottom: space.lg }}>
      <Tap
        accessibilityLabel="New post"
        onPress={() => router.push('/post/new')}
        style={{
          backgroundColor: colors.maroon,
          borderRadius: radius.pill,
          paddingVertical: 10,
          paddingLeft: 12,
          paddingRight: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          shadowColor: colors.tamarind,
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 5,
        }}
      >
        <Sticker name="postcard" size={30} />
        <Text style={{ fontFamily: fonts.bodyBold, color: colors.butter, fontSize: 15 }}>Post</Text>
      </Tap>
      </View>
    </SafeAreaView>
  );
}
