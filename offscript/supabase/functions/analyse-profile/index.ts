// analyse-profile: turns someone's profile answers into themes + embeddings
// for AI matching. The app calls it after a profile is saved.
//
//  1. Reads the caller's profile, using ONLY the answers they chose to show.
//  2. Asks Claude to describe their research and their taste (music, films,
//     places...) and to pick theme tags from a fixed list (so tags can match
//     between people).
//  3. Turns both descriptions into embeddings with Supabase's built-in
//     gte-small model (free, runs inside this function, no extra account).
//  4. Saves everything to the profile_themes table.
//
// Deploy (see docs/SETUP_GUIDE.md, "AI matching"):
//   npx supabase functions deploy analyse-profile
//   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
import Anthropic from 'npm:@anthropic-ai/sdk@^0.131.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

declare const Supabase: any; // provided by Supabase's edge runtime

// Theme tags Claude may choose from. Keep these broad so people overlap.
const RESEARCH_THEMES = [
  'machine learning', 'data science', 'computational', 'mathematics', 'physics', 'astronomy',
  'chemistry', 'biology', 'genetics', 'neuroscience', 'psychology', 'health & medicine',
  'public health', 'climate & environment', 'ecology', 'engineering', 'materials',
  'economics', 'politics', 'law', 'social policy', 'sociology', 'anthropology', 'education',
  'history', 'philosophy', 'literature', 'linguistics', 'art & design', 'music research',
  'qualitative methods', 'quantitative methods', 'lab work', 'fieldwork', 'theory',
  'interdisciplinary', 'tech & society', 'ethics',
];
const TASTE_THEMES = [
  // music
  'melancholy indie', 'pop', 'classical', 'jazz', 'hip-hop', 'rock', 'folk', 'electronic',
  'musicals', 'k-pop', 'r&b & soul', 'nostalgic throwbacks', 'singer-songwriter',
  // film
  'romance films', 'arthouse cinema', 'sci-fi', 'horror', 'comedy', 'animation', 'documentaries',
  'period dramas', 'thrillers', 'cult classics', 'coming-of-age',
  // places & travel
  'snowy places', 'beaches & islands', 'big cities', 'mountains', 'countryside', 'road trips',
  'east asia', 'south asia', 'europe', 'latin america', 'africa', 'north america', 'middle east',
  // vibe
  'hopeless romantic', 'night owl', 'cosy homebody', 'adventurous', 'dark humour', 'bookish',
  'coffee lover', 'foodie', 'outdoorsy', 'artsy', 'nostalgic', 'sporty', 'introspective',
  'social butterfly',
];

const SCHEMA = {
  type: 'object',
  properties: {
    research_summary: {
      type: 'string',
      description: 'One or two plain-English sentences about their research area, topic and methods.',
    },
    research_themes: {
      type: 'array',
      items: { type: 'string', enum: RESEARCH_THEMES },
      description: 'Up to 5 tags that fit their research.',
    },
    taste_summary: {
      type: 'string',
      description:
        'Two or three sentences about their personality and taste: the genres, moods and eras of their music and films, the kind of places they dream of, and the vibe their answers give off.',
    },
    taste_themes: {
      type: 'array',
      items: { type: 'string', enum: TASTE_THEMES },
      description: 'Up to 8 tags that fit their taste and vibe.',
    },
  },
  required: ['research_summary', 'research_themes', 'taste_summary', 'taste_themes'],
  additionalProperties: false,
};

type Themes = {
  research_summary: string;
  research_themes: string[];
  taste_summary: string;
  taste_themes: string[];
};

const LABELS: Record<string, string> = {
  degree_stage: 'Stage',
  department: 'Department',
  research_field: 'Research field',
  research_topic: 'Working on',
  interests: 'Interests',
  bio: 'About me',
  favourite_movie: 'Favourite movie',
  favourite_song: 'Favourite song',
  cry_spot: 'Favourite place to cry at university',
  dream_destination: 'Dream holiday destination',
  comfort_order: 'Coffee order',
};

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from the function's secrets
const embedder = new Supabase.ai.Session('gte-small');

async function embed(text: string) {
  const vec = (await embedder.run(text, { mean_pool: true, normalize: true })) as number[];
  return `[${vec.join(',')}]`; // pgvector's text format
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  // Who is calling? (The app sends the user's login token automatically.)
  const auth = req.headers.get('Authorization') ?? '';
  const asUser = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData } = await asUser.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return new Response('Not signed in', { status: 401 });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: profile } = await admin.from('profiles').select('*').eq('id', userId).single();
  if (!profile?.onboarded) return Response.json({ skipped: 'not onboarded' });

  // Only the answers this person chose to show
  const visible: string[] = profile.visible_fields ?? [];
  const lines = Object.entries(LABELS)
    .filter(([key]) => visible.includes(key))
    .map(([key, label]) => {
      const v = profile[key];
      const text = Array.isArray(v) ? v.join(', ') : v;
      return text ? `${label}: ${text}` : null;
    })
    .filter(Boolean)
    .join('\n');
  if (!lines) return Response.json({ skipped: 'nothing visible to analyse' });

  // Skip if nothing changed since last time (saves money)
  const hash = await sha256(lines);
  const { data: existing } = await admin.from('profile_themes').select('source_hash').eq('profile_id', userId).maybeSingle();
  if (existing?.source_hash === hash) return Response.json({ skipped: 'unchanged' });

  // Ask Claude to read between the lines
  let themes: Themes;
  try {
    const response = await anthropic.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      // if Claude's safety checks ever decline, retry on Anthropic's recommended fallback model
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system:
        'You help an app for university researchers match people who would get on. ' +
        "Read a member's profile answers and describe what they reveal. Use what you know about the " +
        'songs, films, artists and places they mention (genre, mood, era, setting). ' +
        'Only describe what the answers support; leave out anything about health, religion, ' +
        'ethnicity, sexuality or politics unless it is literally their research topic.',
      messages: [{ role: 'user', content: `Profile answers:\n${lines}` }],
    });
    if (response.stop_reason === 'refusal') return Response.json({ skipped: 'declined' });
    const block = response.content.find((b) => b.type === 'text');
    if (!block || block.type !== 'text') return Response.json({ skipped: 'no output' });
    themes = JSON.parse(block.text) as Themes;
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return new Response('ANTHROPIC_API_KEY is missing or wrong', { status: 500 });
    } else if (error instanceof Anthropic.RateLimitError) {
      return new Response('Claude is busy, try again later', { status: 503 });
    } else if (error instanceof Anthropic.APIError) {
      return new Response(`Claude error ${error.status}: ${error.message}`, { status: 502 });
    }
    throw error;
  }

  const [researchVec, tasteVec] = await Promise.all([
    embed(`${themes.research_summary} Themes: ${themes.research_themes.join(', ')}`),
    embed(`${themes.taste_summary} Themes: ${themes.taste_themes.join(', ')}`),
  ]);

  const { error } = await admin.from('profile_themes').upsert({
    profile_id: userId,
    research_summary: themes.research_summary,
    taste_summary: themes.taste_summary,
    research_themes: themes.research_themes,
    taste_themes: themes.taste_themes,
    research_vec: researchVec,
    taste_vec: tasteVec,
    source_hash: hash,
    updated_at: new Date().toISOString(),
  });
  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ ok: true, research_themes: themes.research_themes, taste_themes: themes.taste_themes });
});
