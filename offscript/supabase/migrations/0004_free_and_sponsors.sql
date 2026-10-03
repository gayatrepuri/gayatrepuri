-- =====================================================================
-- Offscript is free for everyone. Money comes from sponsor cards
-- (ads and sponsored events) that YOU add in the Supabase Table Editor.
--
-- Run this once in Supabase → SQL Editor (after 0001–0003).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. No more paid plan: everyone gets everything.
--    The limit checks all ask "is this person on Plus?" first, so
--    answering "yes" for everyone switches every limit off, while the
--    useful checks in the same triggers ("this meetup is full",
--    "you're hosting this already") keep working.
-- ---------------------------------------------------------------------
create or replace function public.is_plus(uid uuid)
returns boolean
language sql stable
set search_path = public
as $$
  select true;
$$;

-- ---------------------------------------------------------------------
-- 2. Sponsor cards
--    One row = one card that shows up between posts on the Board.
--    kind: 'ad'    → a business or brand ("10% off at Fitzbillies")
--          'event' → a sponsored event (careers fair, conference, ball)
--          'perk'  → a discount or freebie for Offscript members
-- ---------------------------------------------------------------------
create table public.sponsored (
  id              uuid primary key default gen_random_uuid(),
  sponsor_name    text not null check (char_length(sponsor_name) between 1 and 60),
  kind            text not null default 'ad' check (kind in ('ad', 'event', 'perk')),
  title           text not null check (char_length(title) between 1 and 80),
  body            text check (char_length(body) <= 280),
  image_url       text,                     -- optional picture (upload to the "sponsors" bucket)
  link_url        text check (link_url is null or link_url ~ '^https://'),
  button_label    text check (char_length(button_label) <= 24), -- e.g. "Get tickets"; blank = "Find out more"
  event_starts_at timestamptz,              -- events only
  event_location  text,                     -- events only
  universities    text[],                   -- blank = everyone; otherwise only these university names
  adults_only     boolean not null default false, -- alcohol, nightlife… never shown to under-18s
  show_from       timestamptz not null default now(),
  show_until      timestamptz not null,
  weight          int not null default 1 check (weight between 1 and 10), -- bigger = shown more often
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
alter table public.sponsored enable row level security;
-- No policies on purpose: the app can't read the table directly.
-- It asks sponsored_for_me() below, which only hands back live cards
-- that fit the person looking.

create or replace function public.sponsored_for_me()
returns table (
  id uuid, sponsor_name text, kind text, title text, body text,
  image_url text, link_url text, button_label text,
  event_starts_at timestamptz, event_location text, weight int
)
language sql stable
security definer
set search_path = public
as $$
  select s.id, s.sponsor_name, s.kind, s.title, s.body,
         s.image_url, s.link_url, s.button_label,
         s.event_starts_at, s.event_location, s.weight
  from public.sponsored s
  join public.profiles me on me.id = auth.uid()
  where s.is_active
    and now() between s.show_from and s.show_until
    and (s.universities is null or cardinality(s.universities) = 0
         or me.university = any (s.universities))
    and (not s.adults_only or coalesce(me.age, 0) >= 18)
  order by s.weight desc, s.created_at desc
  limit 20;
$$;
revoke all on function public.sponsored_for_me() from public, anon;
grant execute on function public.sponsored_for_me() to authenticated;

-- ---------------------------------------------------------------------
-- 3. Counting views and taps, so you can show sponsors what they got.
--    Only totals ever leave the database; sponsors never see who.
-- ---------------------------------------------------------------------
create table public.sponsored_events (
  id           bigint generated always as identity primary key,
  sponsored_id uuid not null references public.sponsored(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete set null,
  action       text not null check (action in ('view', 'tap')),
  created_at   timestamptz not null default now()
);
create index sponsored_events_lookup on public.sponsored_events (sponsored_id, user_id, action, created_at);
alter table public.sponsored_events enable row level security;
-- No policies: the app writes through log_sponsored() only.

create or replace function public.log_sponsored(sid uuid, what text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or what not in ('view', 'tap') then return; end if;
  -- the same person scrolling past the same card counts once every 6 hours
  if what = 'view' and exists (
       select 1 from public.sponsored_events
       where sponsored_id = sid and user_id = auth.uid() and action = 'view'
         and created_at > now() - interval '6 hours') then
    return;
  end if;
  insert into public.sponsored_events (sponsored_id, user_id, action)
  select sid, auth.uid(), what
  where exists (select 1 from public.sponsored where id = sid);
end;
$$;
revoke all on function public.log_sponsored(uuid, text) from public, anon;
grant execute on function public.log_sponsored(uuid, text) to authenticated;

-- The report you send sponsors. Open it in SQL Editor with:
--   select * from public.sponsor_report;
create view public.sponsor_report as
select
  s.sponsor_name,
  s.title,
  s.show_from::date  as from_date,
  s.show_until::date as until_date,
  count(*) filter (where e.action = 'view')                     as views,
  count(distinct e.user_id) filter (where e.action = 'view')    as people_reached,
  count(*) filter (where e.action = 'tap')                      as taps,
  round(100.0 * count(*) filter (where e.action = 'tap')
        / nullif(count(*) filter (where e.action = 'view'), 0), 1) as tap_rate_percent
from public.sponsored s
left join public.sponsored_events e on e.sponsored_id = s.id
group by s.id
order by s.show_from desc;
revoke all on public.sponsor_report from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. A public storage folder for sponsor pictures.
--    Upload in Storage → sponsors, then copy the file's URL into image_url.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('sponsors', 'sponsors', true)
on conflict (id) do nothing;
