-- =====================================================================
-- The "launching soon" website's pre-registration list.
-- Run this once in Supabase → SQL Editor. It works on its own: it doesn't
-- need any of the other files, and it doesn't touch the app's data.
--
-- See who signed up:      Table Editor → waitlist
-- Quick summary:          select * from public.waitlist_summary;
-- =====================================================================

create table public.waitlist (
  id          bigint generated always as identity primary key,
  email       text not null unique
              check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- secret per sign-up, so only the person who just signed up can add their details
  token       uuid not null default gen_random_uuid(),
  -- short code for their "bring a friend" link (offscript.../?ref=abc12345)
  ref_code    text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  referred_by text,                         -- the ref_code of whoever sent them
  university  text,
  stage       text,                         -- Masters / PhD / Postdoc / Staff / Other
  wants       text[] not null default '{}', -- what they'd use Offscript for
  source      text,                         -- e.g. "instagram" from ?src=instagram
  created_at  timestamptz not null default now()
);
alter table public.waitlist enable row level security;
-- No policies on purpose: nobody can read the list from the website.
-- The website can only call the three functions below.

-- 1. Join the list. Returns your place in the queue and your share code.
create or replace function public.join_waitlist(p_email text, p_ref text default null, p_source text default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  e text := lower(trim(p_email));
  r public.waitlist;
begin
  if e is null or char_length(e) > 254 or e !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please check your email address';
  end if;

  insert into public.waitlist (email, referred_by, source)
  values (e, left(nullif(trim(p_ref), ''), 16), left(nullif(trim(p_source), ''), 40))
  on conflict (email) do nothing
  returning * into r;

  if r.id is null then
    -- already on the list: no token, so nobody can change someone else's details
    select * into r from public.waitlist where email = e;
    return json_build_object(
      'already', true,
      'position', (select count(*) from public.waitlist where id <= r.id),
      'ref', r.ref_code);
  end if;

  return json_build_object(
    'already', false,
    'position', (select count(*) from public.waitlist where id <= r.id),
    'token', r.token,
    'ref', r.ref_code);
end;
$$;

-- 2. The optional "tell us a bit more" step after signing up.
create or replace function public.waitlist_details(p_token uuid, p_university text, p_stage text, p_wants text[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.waitlist
  set university = left(nullif(trim(p_university), ''), 80),
      stage      = left(nullif(trim(p_stage), ''), 40),
      wants      = coalesce((select array_agg(left(w, 30)) from unnest(p_wants[1:10]) w), '{}')
  where token = p_token;
$$;

-- 3. How many people are waiting (shown on the website once it's big enough).
create or replace function public.waitlist_count()
returns int
language sql stable
security definer
set search_path = public
as $$
  select count(*)::int from public.waitlist;
$$;

revoke all on function public.join_waitlist(text, text, text) from public;
revoke all on function public.waitlist_details(uuid, text, text, text[]) from public;
revoke all on function public.waitlist_count() from public;
grant execute on function public.join_waitlist(text, text, text) to anon, authenticated;
grant execute on function public.waitlist_details(uuid, text, text, text[]) to anon, authenticated;
grant execute on function public.waitlist_count() to anon, authenticated;

-- A summary just for you (not reachable from the website).
create view public.waitlist_summary as
select 'total' as what, 'everyone' as value, count(*) as people from public.waitlist
union all
select 'university', coalesce(university, '(not given)'), count(*) from public.waitlist group by university
union all
select 'stage', coalesce(stage, '(not given)'), count(*) from public.waitlist group by stage
union all
select 'wants', w, count(*) from public.waitlist, unnest(wants) w group by w
union all
select 'came from', coalesce(source, '(direct)'), count(*) from public.waitlist group by source
union all
select 'top referrer', w.email, count(*) from public.waitlist f
  join public.waitlist w on w.ref_code = f.referred_by
  group by w.email
order by what, people desc;
revoke all on public.waitlist_summary from public, anon, authenticated;
