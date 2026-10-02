-- =====================================================================
-- Offscript: AI matching
-- Paste this whole file into Supabase → SQL Editor → "Run" (after 0001).
--
-- How it works:
--  1. When someone saves their profile, the app calls the `analyse-profile`
--     function (supabase/functions/analyse-profile). It sends ONLY the answers
--     they chose to show to Claude, which describes their research and their
--     taste (music, films, places...) and picks theme tags from a fixed list.
--  2. Those descriptions are turned into "embeddings" (lists of numbers that
--     capture meaning) and stored below.
--  3. suggested_matches() now also scores how close two people's meanings are,
--     and returns the themes they share so the app can say *why* you matched.
-- =====================================================================

-- pgvector: lets the database store embeddings and compare them
create extension if not exists vector with schema extensions;

create table public.profile_themes (
  profile_id      uuid primary key references public.profiles(id) on delete cascade,
  research_summary text,
  taste_summary    text,
  research_themes  text[] not null default '{}',
  taste_themes     text[] not null default '{}',
  research_vec     extensions.vector(384),
  taste_vec        extensions.vector(384),
  source_hash      text,           -- lets the function skip work when nothing changed
  updated_at       timestamptz not null default now()
);
-- Locked: only the server function writes here, and the app reads it
-- through suggested_matches() below.
alter table public.profile_themes enable row level security;

-- The old version returns different columns, so it has to be replaced.
drop function if exists public.suggested_matches(text);

-- Score: same field (+5), each shared interest tag (+2), same city (+3),
-- same university (+1), PLUS the AI part: similar research meaning (up to +12),
-- similar taste (up to +10), and +2 for every shared AI theme.
create or replace function public.suggested_matches(only_city text default null)
returns table (
  id uuid, display_name text, avatar_url text, university text, city text,
  degree_stage text, research_field text, research_topic text,
  interests text[], shared_interests text[], shared_themes text[], score int
)
language sql stable
security definer
set search_path = public, extensions
as $$
  with me as (select * from public.profiles where id = auth.uid()),
  my_themes as (select * from public.profile_themes where profile_id = auth.uid()),
  scored as (
    select
      pp.*,
      array(select unnest(pp.interests) intersect select unnest(me.interests)) as s_interests,
      array(
        select unnest(coalesce(t.research_themes, '{}') || coalesce(t.taste_themes, '{}'))
        intersect
        select unnest(coalesce(mt.research_themes, '{}') || coalesce(mt.taste_themes, '{}'))
      ) as s_themes,
      -- cosine similarity (1 = same meaning). This embedding model rates even
      -- unrelated texts around 0.75, so only the part above 0.75 counts.
      coalesce(greatest(0, (1 - (t.research_vec <=> mt.research_vec)) - 0.75) / 0.25, 0) as research_sim,
      coalesce(greatest(0, (1 - (t.taste_vec <=> mt.taste_vec)) - 0.75) / 0.25, 0) as taste_sim
    from public.public_profiles pp
    cross join me
    left join my_themes mt on true
    left join public.profile_themes t on t.profile_id = pp.id
    where pp.id <> me.id
      and (only_city is null or pp.city = only_city)
      and not exists (  -- hide people you've already connected with / asked
        select 1 from public.connections c
        where (c.requester_id = me.id and c.addressee_id = pp.id)
           or (c.requester_id = pp.id and c.addressee_id = me.id and c.status <> 'pending'))
  )
  select
    s.id, s.display_name, s.avatar_url, s.university, s.city,
    s.degree_stage, s.research_field, s.research_topic, s.interests,
    s.s_interests, s.s_themes,
    ( case when s.research_field is not null and s.research_field = me.research_field then 5 else 0 end
    + 2 * cardinality(s.s_interests)
    + case when s.city = me.city then 3 else 0 end
    + case when s.university = me.university then 1 else 0 end
    + round(12 * least(1, s.research_sim))
    + round(10 * least(1, s.taste_sim))
    + 2 * cardinality(s.s_themes) )::int as score
  from scored s, me
  order by score desc, s.created_at desc
  limit case when public.is_plus(auth.uid()) then 100 else 5 end;
$$;
grant execute on function public.suggested_matches(text) to authenticated;
