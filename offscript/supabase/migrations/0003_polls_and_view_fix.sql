-- =====================================================================
-- Offscript: polls + a fix so everyone can see each other's posts
-- Paste this whole file into Supabase → SQL Editor → "Run".
-- If Supabase offers "Run and enable RLS", either button is fine.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Fix: posts from other people not showing on the Board
--
-- public_profiles and feed_posts are "views": they show other people's
-- profiles with hidden answers blanked out. They must run with the
-- database's own rights (security_invoker = false). If they run with the
-- viewer's rights instead, each person can only read their OWN profile, so
-- the Board only ever shows your own posts. Supabase's security suggestions
-- can switch this on; the views already protect privacy themselves
-- (hidden answers are blanked, blocked people are removed), so we keep it
-- off. Supabase may show a "security definer view" notice for these two
-- views; that's expected.
-- ---------------------------------------------------------------------
alter view public.public_profiles set (security_invoker = false);

-- ---------------------------------------------------------------------
-- 2. Polls
-- ---------------------------------------------------------------------
alter table public.posts drop constraint if exists posts_kind_check;
alter table public.posts add constraint posts_kind_check check (kind in (
  'coffee', 'study', 'event', 'rant', 'collab',
  'ticket', 'study_participants', 'conference', 'poll', 'other'));

create table public.poll_options (
  id       bigint generated always as identity primary key,
  post_id  uuid not null references public.posts(id) on delete cascade,
  label    text not null check (char_length(label) between 1 and 80),
  position int not null default 0,
  unique (post_id, id)
);
alter table public.poll_options enable row level security;
create policy "poll options: signed-in can read" on public.poll_options for select
  using (auth.uid() is not null);
create policy "poll options: author adds" on public.poll_options for insert
  with check (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()));

-- one vote per person per poll (voting again just changes your answer)
create table public.poll_votes (
  post_id    uuid not null,
  option_id  bigint not null,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id),
  foreign key (post_id, option_id) references public.poll_options(post_id, id) on delete cascade
);
alter table public.poll_votes enable row level security;
create policy "poll votes: signed-in can read" on public.poll_votes for select
  using (auth.uid() is not null);
create policy "poll votes: vote as yourself" on public.poll_votes for insert
  with check (auth.uid() = user_id);
create policy "poll votes: change your vote" on public.poll_votes for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "poll votes: remove your vote" on public.poll_votes for delete
  using (auth.uid() = user_id);

-- The feed now also says how many people voted (same columns as before + vote_count).
create or replace view public.feed_posts
with (security_barrier = true)
as
select
  p.*,
  a.display_name   as author_name,
  a.avatar_url     as author_avatar,
  a.university     as author_university,
  a.research_field as author_field,
  (select count(*) from public.post_attendees pa where pa.post_id = p.id)::int as attendee_count,
  exists (select 1 from public.post_attendees pa
          where pa.post_id = p.id and pa.user_id = auth.uid()) as i_joined,
  (select count(*) from public.poll_votes v where v.post_id = p.id)::int as vote_count
from public.posts p
join public.public_profiles a on a.id = p.author_id;  -- hides blocked / un-onboarded authors

alter view public.feed_posts set (security_invoker = false);
revoke all on public.feed_posts from anon;
grant select on public.feed_posts to authenticated;
