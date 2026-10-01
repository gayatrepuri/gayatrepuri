// The Noticeboard: everything people have posted, newest first.
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '../../components/PostCard';
import { Chip, Empty, Logo } from '../../components/ui';
import { useMe } from '../../lib/auth';
import { CITIES, POST_KINDS } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { colors, fonts, radius, space } from '../../lib/theme';
import type { City, FeedPost, PostKind } from '../../lib/types';

export default function Noticeboard() {
  const { profile } = useMe();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [city, setCity] = useState<City | 'All'>(profile.city);
  const [kind, setKind] = useState<PostKind | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    let q = supabase
      .from('feed_posts')
      .select('*')
      .eq('is_cancelled', false)
      // hide things that started more than 3 hours ago
      .or(`starts_at.is.null,starts_at.gte.${new Date(Date.now() - 3 * 3600_000).toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(100);
    if (city !== 'All') q = q.eq('city', city);
    if (kind !== 'all') q = q.eq('kind', kind);
    const { data } = await q;
    setPosts((data as FeedPost[]) ?? []);
  }, [city, kind]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const header = (
    <View>
      <View style={{ alignItems: 'center', paddingTop: space.sm, paddingBottom: space.md }}>
        <Logo size={44} />
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.sm }}>
        {(['All', ...CITIES] as const).map((c) => (
          <Chip key={c} label={c} selected={city === c} onPress={() => setCity(c)} />
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: space.lg }}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Chip label="Everything" selected={kind === 'all'} onPress={() => setKind('all')} />
          {POST_KINDS.map((k) => (
            <Chip key={k.kind} label={`${k.emoji} ${k.label}`} selected={kind === k.kind} onPress={() => setKind(k.kind)} />
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
        ListEmptyComponent={<Empty title="quiet in here…" hint="Be the first — post a coffee run or a study session." />}
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

      {/* the big "+" button */}
      <Pressable
        accessibilityLabel="New post"
        onPress={() => router.push('/post/new')}
        style={{
          position: 'absolute',
          right: space.lg,
          bottom: space.lg,
          backgroundColor: colors.maroon,
          borderRadius: radius.pill,
          paddingVertical: 14,
          paddingHorizontal: 20,
          shadowColor: colors.tamarind,
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <Text style={{ fontFamily: fonts.bodyBold, color: colors.butter, fontSize: 15 }}>＋  Post</Text>
      </Pressable>
    </SafeAreaView>
  );
}
