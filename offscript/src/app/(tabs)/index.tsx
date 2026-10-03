// The Noticeboard: everything people have posted, newest first,
// with the odd sponsor card pinned in between (that's how Offscript stays free).
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '../../components/PostCard';
import { SponsoredCard } from '../../components/SponsoredCard';
import { Sticker } from '../../components/Sticker';
import { Chip, Empty, GinghamBand, Logo, PaperLabel, Tap } from '../../components/ui';
import { POST_KINDS } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { colors, fonts, radius, space } from '../../lib/theme';
import type { FeedPost, PostKind, Sponsored } from '../../lib/types';

// first sponsor card after this many posts, then one every AD_EVERY posts
const FIRST_AD_AFTER = 3;
const AD_EVERY = 6;

type Row = { type: 'post'; post: FeedPost } | { type: 'ad'; ad: Sponsored; key: string };

// Mix sponsor cards into the posts. Cards with a bigger "weight" come up more often.
function withAds(posts: FeedPost[], ads: Sponsored[]): Row[] {
  const rows: Row[] = posts.map((post) => ({ type: 'post', post }));
  if (!ads.length || !posts.length) return rows;
  const pool = ads.flatMap((a) => Array<Sponsored>(Math.max(1, a.weight)).fill(a)).sort(() => Math.random() - 0.5);
  const out: Row[] = [];
  let n = 0;
  rows.forEach((row, i) => {
    out.push(row);
    const count = i + 1;
    if (count === FIRST_AD_AFTER || (count > FIRST_AD_AFTER && (count - FIRST_AD_AFTER) % AD_EVERY === 0)) {
      const ad = pool[n % pool.length];
      out.push({ type: 'ad', ad, key: `ad-${n}-${ad.id}` });
      n++;
    }
  });
  // a short board still gets one card at the bottom
  if (n === 0) out.push({ type: 'ad', ad: pool[0], key: `ad-0-${pool[0].id}` });
  return out;
}

export default function Noticeboard() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [ads, setAds] = useState<Sponsored[]>([]);
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
    const [{ data }, { data: sponsored }] = await Promise.all([q, supabase.rpc('sponsored_for_me')]);
    setPosts((data as FeedPost[]) ?? []);
    // if the sponsor table isn't set up yet this is just empty
    setAds((sponsored as Sponsored[]) ?? []);
  }, [kind]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const rows = useMemo(() => withAds(posts, ads), [posts, ads]);

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
        data={rows}
        keyExtractor={(r) => (r.type === 'post' ? r.post.id : r.key)}
        renderItem={({ item }) => (item.type === 'post' ? <PostCard post={item.post} /> : <SponsoredCard ad={item.ad} />)}
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
