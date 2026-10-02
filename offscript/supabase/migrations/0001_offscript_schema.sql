-- =====================================================================
-- Offscript database schema
-- Paste this whole file into Supabase → SQL Editor → "Run".
-- It creates every table, security rule and helper function the app uses.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Universities we allow (currently London + Cambridge; never shown in the app)
--    Sign-up is only possible with an email ending in one of these domains.
-- ---------------------------------------------------------------------
create table public.universities (
  domain text primary key,          -- e.g. 'ucl.ac.uk'
  name   text not null,             -- e.g. 'UCL'
  city   text not null check (city in ('London', 'Cambridge'))
);
-- Locked: nobody can read or change this list from the app. The sign-up check
-- below runs with admin rights, and you edit the list in the Supabase dashboard.
alter table public.universities enable row level security;

insert into public.universities (domain, name, city) values
  ('cam.ac.uk',         'University of Cambridge',            'Cambridge'),
  ('aru.ac.uk',         'Anglia Ruskin University',           'Cambridge'),
  ('ucl.ac.uk',         'UCL',                                'London'),
  ('imperial.ac.uk',    'Imperial College London',            'London'),
  ('ic.ac.uk',          'Imperial College London',            'London'),
  ('kcl.ac.uk',         'King''s College London',             'London'),
  ('lse.ac.uk',         'LSE',                                'London'),
  ('qmul.ac.uk',        'Queen Mary University of London',    'London'),
  ('city.ac.uk',        'City St George''s, University of London', 'London'),
  ('citystgeorges.ac.uk','City St George''s, University of London', 'London'),
  ('sgul.ac.uk',        'St George''s, University of London', 'London'),
  ('gold.ac.uk',        'Goldsmiths',                         'London'),
  ('soas.ac.uk',        'SOAS',                               'London'),
  ('bbk.ac.uk',         'Birkbeck',                           'London'),
  ('rhul.ac.uk',        'Royal Holloway',                     'London'),
  ('royalholloway.ac.uk','Royal Holloway',                    'London'),
  ('london.ac.uk',      'University of London',               'London'),
  ('sas.ac.uk',         'School of Advanced Study',           'London'),
  ('lshtm.ac.uk',       'LSHTM',                              'London'),
  ('icr.ac.uk',         'Institute of Cancer Research',       'London'),
  ('rvc.ac.uk',         'Royal Veterinary College',           'London'),
  ('london.edu',        'London Business School',             'London'),
  ('arts.ac.uk',        'University of the Arts London',      'London'),
  ('rca.ac.uk',         'Royal College of Art',               'London'),
  ('brunel.ac.uk',      'Brunel University of London',        'London'),
  ('westminster.ac.uk', 'University of Westminster',          'London'),
  ('lsbu.ac.uk',        'London South Bank University',       'London'),
  ('uel.ac.uk',         'University of East London',          'London'),
  ('gre.ac.uk',         'University of Greenwich',            'London'),
  ('mdx.ac.uk',         'Middlesex University',               'London'),
  ('roehampton.ac.uk',  'University of Roehampton',           'London'),
  ('kingston.ac.uk',    'Kingston University',                'London'),
  ('londonmet.ac.uk',   'London Metropolitan University',     'London'),
  ('uwl.ac.uk',         'University of West London',          'London'),
  ('stmarys.ac.uk',     'St Mary''s University',              'London'),
  ('ram.ac.uk',         'Royal Academy of Music',             'London'),
  ('rcm.ac.uk',         'Royal College of Music',             'London'),
  ('crick.ac.uk',       'Francis Crick Institute',            'London');

-- Individual emails you let in even without a university address — e.g. the
-- test account you give Apple / Google reviewers (docs/SETUP_GUIDE.md, step 9).
insert into public.universities (domain, name, city) values
  ('offscript.team', 'Offscript Team', 'London');
create table public.allowed_emails (
  email  text primary key,
  domain text not null default 'offscript.team' references public.universities(domain)
);
alter table public.allowed_emails enable row level security; -- no policies: dashboard only

-- Find the university for an email address. Subdomains count too,
-- so 'jo@student.kcl.ac.uk' and 'jo@cantab.cam.ac.uk' both work.
create or replace function public.university_for_email(email text)
returns public.universities
language sql stable
security definer
set search_path = public
as $$
  -- ($1 is the email passed in; written as $1 so it can't be confused with a column)
  select m.domain, m.name, m.city from (
    select u.domain, u.name, u.city, 0 as rank, 0 as len
    from public.allowed_emails a join public.universities u on u.domain = a.domain
    where a.email = lower($1)
    union all
    select u.domain, u.name, u.city, 1, length(u.domain)
    from public.universities u
    where lower(split_part($1, '@', 2)) = u.domain
       or lower(split_part($1, '@', 2)) like '%.' || u.domain
  ) m
  order by m.rank, m.len desc
  limit 1;
$$;

-- The app calls this before sending the login code, so people get a
-- friendly message instead of a code that never arrives.
create or replace function public.is_allowed_email(email text)
returns boolean
language sql stable
set search_path = public
as $$
  select (public.university_for_email($1)).domain is not null;
$$;
grant execute on function public.is_allowed_email(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Profiles (one per person)
-- ---------------------------------------------------------------------
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email_domain      text not null references public.universities(domain),
  university        text not null,
  city              text not null check (city in ('London', 'Cambridge')),
  display_name      text not null default '',
  pronouns          text,
  avatar_url        text,
  degree_stage      text,            -- 'Masters', 'PhD (year 2)', 'Postdoc', ...
  department        text,
  college           text,            -- Cambridge college, optional
  research_field    text,            -- broad area, picked from a list
  research_topic    text,            -- one-liner: "Bayesian models of bird migration"
  interests         text[] not null default '{}', -- tags used for matching
  bio               text,
  -- the fun "get to know me" answers
  age               int check (age is null or age between 16 and 100),
  favourite_movie   text,
  favourite_song    text,
  cry_spot          text,            -- favourite place to cry at uni
  dream_destination text,
  comfort_order     text,            -- go-to coffee order
  -- which of the answers above the person wants others to see
  visible_fields    text[] not null default
    array['degree_stage','department','research_field','research_topic',
          'interests','bio','favourite_movie','favourite_song','cry_spot',
          'dream_destination','comfort_order','college','pronouns'],
  onboarded         boolean not null default false,
  -- subscription (set ONLY by the server, never by the app)
  is_plus           boolean not null default false,
  plus_expires_at   timestamptz,
  created_at        timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- You can read and edit only your own full row.
create policy "own profile: read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile: update" on public.profiles for update using (auth.uid() = id);

-- Stop people from making themselves "Plus" for free or changing university.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.is_plus         := old.is_plus;
    new.plus_expires_at := old.plus_expires_at;
    new.email_domain    := old.email_domain;
    new.university      := old.university;
    new.city            := old.city;
  end if;
  return new;
end;
$$;
create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- When someone signs up: block non-university emails and create their profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uni public.universities;
begin
  uni := public.university_for_email(new.email);
  if uni.domain is null then
    raise exception 'We aren''t there yet.';
  end if;
  insert into public.profiles (id, email_domain, university, city)
  values (new.id, uni.domain, uni.name, uni.city);
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Is this person currently on Offscript Plus?
create or replace function public.is_plus(uid uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_plus and (plus_expires_at is null or plus_expires_at > now())
       from public.profiles where id = uid),
    false);
$$;

-- ---------------------------------------------------------------------
-- 3. Blocks (safety) — needed for App Store approval
-- ---------------------------------------------------------------------
create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);
alter table public.blocks enable row level security;
create policy "blocks: mine" on public.blocks for all
  using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- true if either person has blocked the other
create or replace function public.is_blocked(a uuid, b uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

-- ---------------------------------------------------------------------
-- 4. Public profile view — only shows the answers people chose to show
-- ---------------------------------------------------------------------
create view public.public_profiles
with (security_barrier = true)
as
select
  p.id, p.display_name, p.avatar_url, p.university, p.city, p.created_at,
  p.is_plus,
  case when 'pronouns'          = any(p.visible_fields) then p.pronouns          end as pronouns,
  case when 'degree_stage'      = any(p.visible_fields) then p.degree_stage      end as degree_stage,
  case when 'department'        = any(p.visible_fields) then p.department        end as department,
  case when 'college'           = any(p.visible_fields) then p.college           end as college,
  case when 'research_field'    = any(p.visible_fields) then p.research_field    end as research_field,
  case when 'research_topic'    = any(p.visible_fields) then p.research_topic    end as research_topic,
  case when 'interests'         = any(p.visible_fields) then p.interests else '{}'::text[] end as interests,
  case when 'bio'               = any(p.visible_fields) then p.bio               end as bio,
  case when 'age'               = any(p.visible_fields) then p.age               end as age,
  case when 'favourite_movie'   = any(p.visible_fields) then p.favourite_movie   end as favourite_movie,
  case when 'favourite_song'    = any(p.visible_fields) then p.favourite_song    end as favourite_song,
  case when 'cry_spot'          = any(p.visible_fields) then p.cry_spot          end as cry_spot,
  case when 'dream_destination' = any(p.visible_fields) then p.dream_destination end as dream_destination,
  case when 'comfort_order'     = any(p.visible_fields) then p.comfort_order     end as comfort_order
from public.profiles p
where p.onboarded
  and auth.uid() is not null
  and not public.is_blocked(auth.uid(), p.id);

revoke all on public.public_profiles from anon;
grant select on public.public_profiles to authenticated;

-- ---------------------------------------------------------------------
-- 5. Posts — coffee runs, study sessions, events, tickets, rants...
-- ---------------------------------------------------------------------
create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  kind        text not null check (kind in (
                'coffee', 'study', 'event', 'rant', 'collab',
                'ticket', 'study_participants', 'conference', 'other')),
  title       text not null check (char_length(title) between 3 and 120),
  body        text check (char_length(body) <= 2000),
  location    text,
  city        text not null check (city in ('London', 'Cambridge')),
  starts_at   timestamptz,
  capacity    int check (capacity is null or capacity between 1 and 500),
  tags        text[] not null default '{}',
  is_cancelled boolean not null default false,
  created_at  timestamptz not null default now()
);
create index posts_city_created_idx on public.posts (city, created_at desc);
alter table public.posts enable row level security;

create policy "posts: signed-in can read" on public.posts for select
  using (auth.uid() is not null and not public.is_blocked(auth.uid(), author_id));
create policy "posts: create own" on public.posts for insert
  with check (auth.uid() = author_id);
create policy "posts: edit own" on public.posts for update
  using (auth.uid() = author_id);
create policy "posts: delete own" on public.posts for delete
  using (auth.uid() = author_id);

-- People who joined / RSVP'd to a post (the feed view is defined below)
create table public.post_attendees (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.post_attendees enable row level security;
create policy "attendees: signed-in can read" on public.post_attendees for select
  using (auth.uid() is not null);
create policy "attendees: join as yourself" on public.post_attendees for insert
  with check (auth.uid() = user_id);
create policy "attendees: leave as yourself" on public.post_attendees for delete
  using (auth.uid() = user_id);

-- Group chat inside each post (host + people who joined)
create table public.post_messages (
  id         bigint generated always as identity primary key,
  post_id    uuid not null references public.posts(id) on delete cascade,
  sender_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index post_messages_post_idx on public.post_messages (post_id, created_at);
alter table public.post_messages enable row level security;

create or replace function public.is_in_post(pid uuid, uid uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.posts where id = pid and author_id = uid)
      or exists (select 1 from public.post_attendees where post_id = pid and user_id = uid);
$$;

create policy "post chat: members read" on public.post_messages for select
  using (public.is_in_post(post_id, auth.uid()));
create policy "post chat: members write" on public.post_messages for insert
  with check (auth.uid() = sender_id and public.is_in_post(post_id, auth.uid()));

-- The feed: posts + who wrote them + how many have joined.
create view public.feed_posts
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
          where pa.post_id = p.id and pa.user_id = auth.uid()) as i_joined
from public.posts p
join public.public_profiles a on a.id = p.author_id;  -- hides blocked / un-onboarded authors

revoke all on public.feed_posts from anon;
grant select on public.feed_posts to authenticated;

-- ---------------------------------------------------------------------
-- 6. Connections ("matches") and direct messages
-- ---------------------------------------------------------------------
create table public.connections (
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  note         text check (char_length(note) <= 280),
  created_at   timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);
alter table public.connections enable row level security;
create policy "connections: see mine" on public.connections for select
  using (auth.uid() in (requester_id, addressee_id));
create policy "connections: send" on public.connections for insert
  with check (auth.uid() = requester_id and status = 'pending'
              and not public.is_blocked(requester_id, addressee_id));
create policy "connections: respond" on public.connections for update
  using (auth.uid() = addressee_id) with check (auth.uid() = addressee_id);
create policy "connections: remove" on public.connections for delete
  using (auth.uid() in (requester_id, addressee_id));

create or replace function public.are_connected(a uuid, b uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.connections
    where status = 'accepted'
      and ((requester_id = a and addressee_id = b) or (requester_id = b and addressee_id = a))
  ) and not public.is_blocked(a, b);
$$;

create table public.direct_messages (
  id           bigint generated always as identity primary key,
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body         text not null check (char_length(body) between 1 and 2000),
  created_at   timestamptz not null default now()
);
create index dm_pair_idx on public.direct_messages (sender_id, recipient_id, created_at);
alter table public.direct_messages enable row level security;
create policy "dm: read mine" on public.direct_messages for select
  using (auth.uid() in (sender_id, recipient_id));
create policy "dm: send to connections" on public.direct_messages for insert
  with check (auth.uid() = sender_id and public.are_connected(sender_id, recipient_id));

-- ---------------------------------------------------------------------
-- 7. Reports (safety) — needed for App Store approval
-- ---------------------------------------------------------------------
create table public.reports (
  id          bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_user uuid references public.profiles(id) on delete set null,
  target_post uuid references public.posts(id) on delete set null,
  reason      text not null check (char_length(reason) between 1 and 1000),
  created_at  timestamptz not null default now()
);
alter table public.reports enable row level security;
create policy "reports: file" on public.reports for insert
  with check (auth.uid() = reporter_id);
-- (Nobody can read reports from the app. You read them in the Supabase dashboard.)

-- ---------------------------------------------------------------------
-- 8. FREEMIUM LIMITS — enforced by the database so nobody can cheat.
--    Change the numbers here any time; the app reads them from get_my_usage().
-- ---------------------------------------------------------------------
create table public.plan_limits (
  key         text primary key,
  free_limit  int not null,
  description text not null
);
insert into public.plan_limits (key, free_limit, description) values
  ('posts_per_month',       3, 'Meetups / coffee runs / requests you can post each month'),
  ('joins_per_month',       5, 'Meetups and events you can join each month'),
  ('connections_per_week',  5, 'New match requests you can send each week'),
  ('hosted_events_active',  1, 'Upcoming events (kind = event) you can host at once');
alter table public.plan_limits enable row level security;
create policy "limits: anyone signed in can read" on public.plan_limits for select
  using (auth.uid() is not null);

create or replace function public.limit_for(k text)
returns int language sql stable set search_path = public as $$
  select free_limit from public.plan_limits where key = k;
$$;

create or replace function public.enforce_post_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_plus(new.author_id) then return new; end if;

  if (select count(*) from public.posts
      where author_id = new.author_id
        and created_at >= date_trunc('month', now())) >= public.limit_for('posts_per_month') then
    raise exception 'FREE_LIMIT:posts_per_month';
  end if;

  if new.kind = 'event' and (select count(*) from public.posts
      where author_id = new.author_id and kind = 'event' and not is_cancelled
        and (starts_at is null or starts_at > now())) >= public.limit_for('hosted_events_active') then
    raise exception 'FREE_LIMIT:hosted_events_active';
  end if;
  return new;
end;
$$;
create trigger enforce_post_limits before insert on public.posts
  for each row execute function public.enforce_post_limits();

create or replace function public.enforce_join_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.posts;
begin
  select * into p from public.posts where id = new.post_id;
  if p.author_id = new.user_id then
    raise exception 'You are hosting this one already!';
  end if;
  if p.is_cancelled then
    raise exception 'This meetup was cancelled.';
  end if;
  if p.capacity is not null and
     (select count(*) from public.post_attendees where post_id = new.post_id) >= p.capacity then
    raise exception 'Sorry — this one is full.';
  end if;
  if not public.is_plus(new.user_id) and
     (select count(*) from public.post_attendees
      where user_id = new.user_id and created_at >= date_trunc('month', now()))
       >= public.limit_for('joins_per_month') then
    raise exception 'FREE_LIMIT:joins_per_month';
  end if;
  return new;
end;
$$;
create trigger enforce_join_limits before insert on public.post_attendees
  for each row execute function public.enforce_join_limits();

create or replace function public.enforce_connection_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- if they already asked you, sending one back simply accepts it
  if exists (select 1 from public.connections
             where requester_id = new.addressee_id and addressee_id = new.requester_id) then
    update public.connections set status = 'accepted'
      where requester_id = new.addressee_id and addressee_id = new.requester_id;
    return null; -- don't insert a duplicate row
  end if;
  if not public.is_plus(new.requester_id) and
     (select count(*) from public.connections
      where requester_id = new.requester_id and created_at >= now() - interval '7 days')
       >= public.limit_for('connections_per_week') then
    raise exception 'FREE_LIMIT:connections_per_week';
  end if;
  return new;
end;
$$;
create trigger enforce_connection_limits before insert on public.connections
  for each row execute function public.enforce_connection_limits();

-- What the app shows on the "your plan" card.
create or replace function public.get_my_usage()
returns json
language sql stable
security definer
set search_path = public
as $$
  select json_build_object(
    'is_plus', public.is_plus(auth.uid()),
    'posts_this_month', (select count(*) from public.posts
        where author_id = auth.uid() and created_at >= date_trunc('month', now())),
    'joins_this_month', (select count(*) from public.post_attendees
        where user_id = auth.uid() and created_at >= date_trunc('month', now())),
    'connections_this_week', (select count(*) from public.connections
        where requester_id = auth.uid() and created_at >= now() - interval '7 days'),
    'limits', (select json_object_agg(key, free_limit) from public.plan_limits)
  );
$$;
grant execute on function public.get_my_usage() to authenticated;

-- ---------------------------------------------------------------------
-- 9. MATCHING — people near you with a similar research focus.
--    Score: same research field (+5), each shared interest tag (+2),
--    same city (+3), same university (+1). Free users see the top 5;
--    Plus members see everyone + can filter by city.
-- ---------------------------------------------------------------------
create or replace function public.suggested_matches(only_city text default null)
returns table (
  id uuid, display_name text, avatar_url text, university text, city text,
  degree_stage text, research_field text, research_topic text,
  interests text[], shared_interests text[], score int
)
language sql stable
security definer
set search_path = public
as $$
  with me as (select * from public.profiles where id = auth.uid())
  select
    pp.id, pp.display_name, pp.avatar_url, pp.university, pp.city,
    pp.degree_stage, pp.research_field, pp.research_topic, pp.interests,
    array(select unnest(pp.interests) intersect select unnest(me.interests)) as shared_interests,
    ( case when pp.research_field is not null and pp.research_field = me.research_field then 5 else 0 end
    + 2 * cardinality(array(select unnest(pp.interests) intersect select unnest(me.interests)))
    + case when pp.city = me.city then 3 else 0 end
    + case when pp.university = me.university then 1 else 0 end )::int as score
  from public.public_profiles pp, me
  where pp.id <> me.id
    and (only_city is null or pp.city = only_city)
    and not exists (  -- hide people you've already connected with / asked
      select 1 from public.connections c
      where (c.requester_id = me.id and c.addressee_id = pp.id)
         or (c.requester_id = pp.id and c.addressee_id = me.id and c.status <> 'pending'))
  order by score desc, pp.created_at desc
  limit case when public.is_plus(auth.uid()) then 100 else 5 end;
$$;
grant execute on function public.suggested_matches(text) to authenticated;

-- ---------------------------------------------------------------------
-- 10. Account deletion (Apple requires an in-app "delete my account")
-- ---------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------------------------------------------------------------------
-- 11. Live updates for chats
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.post_messages;
alter publication supabase_realtime add table public.direct_messages;

-- ---------------------------------------------------------------------
-- 12. Profile photos storage bucket
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
create policy "avatars: see own" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: update own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
