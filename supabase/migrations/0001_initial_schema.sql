-- ─────────────────────────────────────────────────────────────
-- Remodule Ai: database setup
-- Run this once in Supabase → SQL Editor → New query → paste → Run.
-- Every table has "row level security": each user only sees their own rows.
-- ─────────────────────────────────────────────────────────────

-- Updates the "updated_at" column automatically.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── Assemblies: one row per uploaded assembly, including its cost settings ──
create table public.assemblies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text,
  is_demo boolean not null default false,
  currency text not null default 'EUR',
  -- Cost settings (Phase 2 form, used by the savings calculator in Phase 4)
  labour_rate_per_hour numeric(12,2),
  new_part_number_cost numeric(12,2),
  tooling_cost_per_changed_part numeric(12,2),
  holding_cost_pct numeric(6,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger assemblies_updated_at before update on public.assemblies
  for each row execute function public.set_updated_at();

-- ── Parts: the bill of materials, plus the per-part form ──
create table public.parts (
  id uuid primary key default gen_random_uuid(),
  assembly_id uuid not null references public.assemblies (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sort_order integer not null default 0,
  -- BOM fields
  part_number text not null,
  description text,
  quantity numeric(12,3) not null default 1,
  material text,
  unit_cost numeric(12,4),
  annual_volume integer,
  supplier text,
  make_or_buy text check (make_or_buy in ('make', 'buy')),
  -- Per-part form (what CAD can't show)
  function text,
  connects_to text,
  joining_method text check (joining_method in ('bolted', 'welded', 'glued', 'press-fit', 'snap-fit', 'other')),
  wears_out boolean,
  used_standalone boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index parts_assembly_idx on public.parts (assembly_id, sort_order);
create trigger parts_updated_at before update on public.parts
  for each row execute function public.set_updated_at();

-- ── Files: drawings now; STEP/CAD files can be added later via "kind" ──
create table public.assembly_files (
  id uuid primary key default gen_random_uuid(),
  assembly_id uuid not null references public.assemblies (id) on delete cascade,
  part_id uuid references public.parts (id) on delete set null,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('drawing', 'bom', 'cad')),
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);
create index assembly_files_assembly_idx on public.assembly_files (assembly_id);

-- ── Analysis runs: one row each time the AI analyses an assembly ──
create table public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  assembly_id uuid not null references public.assemblies (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  model text not null,
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
  error text,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index analysis_runs_assembly_idx on public.analysis_runs (assembly_id, created_at desc);

-- ── Suggestions from the AI (numbers only, never money) ──
create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.analysis_runs (id) on delete cascade,
  assembly_id uuid not null references public.assemblies (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('merge_parts', 'standardise_interface', 'create_module', 'change_joining', 'change_material')),
  affected_part_numbers text[] not null default '{}',
  proposed_change text not null,
  reasoning text not null,
  knock_on_effects jsonb not null default '{}',
  risks text[] not null default '{}',
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  costing_inputs jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index suggestions_assembly_idx on public.suggestions (assembly_id);
create trigger suggestions_updated_at before update on public.suggestions
  for each row execute function public.set_updated_at();

-- ── Decisions: every approve/reject, kept forever for later learning ──
create table public.suggestion_decisions (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.suggestions (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  decision text not null check (decision in ('approved', 'rejected', 'reset')),
  reason text,
  -- Snapshot of the suggestion at decision time, so learning data survives edits.
  suggestion_snapshot jsonb,
  created_at timestamptz not null default now()
);
create index suggestion_decisions_suggestion_idx on public.suggestion_decisions (suggestion_id);

-- ── Comments on suggestions ──
create table public.suggestion_comments (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.suggestions (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ── End-of-life rating per part, per analysis run ──
create table public.eol_ratings (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.analysis_runs (id) on delete cascade,
  assembly_id uuid not null references public.assemblies (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  part_number text not null,
  rating text not null check (rating in ('reusable', 'remanufacturable', 'recyclable', 'none')),
  reason text not null,
  -- Optional "after approved changes" rating, filled when a suggestion changes it.
  rating_after text check (rating_after in ('reusable', 'remanufacturable', 'recyclable', 'none')),
  reason_after text
);
create index eol_ratings_run_idx on public.eol_ratings (run_id);

-- ── Waitlist from the public website ──
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320 and email like '%@%'),
  company text check (char_length(company) <= 200),
  role text check (char_length(role) <= 200),
  created_at timestamptz not null default now()
);
create unique index waitlist_email_idx on public.waitlist (lower(email));

-- ─────────────────────────────────────────────────────────────
-- Security rules
-- ─────────────────────────────────────────────────────────────
alter table public.assemblies enable row level security;
alter table public.parts enable row level security;
alter table public.assembly_files enable row level security;
alter table public.analysis_runs enable row level security;
alter table public.suggestions enable row level security;
alter table public.suggestion_decisions enable row level security;
alter table public.suggestion_comments enable row level security;
alter table public.eol_ratings enable row level security;
alter table public.waitlist enable row level security;

-- Owner-only access on all tool tables.
do $$
declare t text;
begin
  foreach t in array array['assemblies','parts','assembly_files','analysis_runs','suggestions',
                           'suggestion_decisions','suggestion_comments','eol_ratings']
  loop
    execute format('create policy "owner can read" on public.%I for select to authenticated using (owner_id = (select auth.uid()))', t);
    execute format('create policy "owner can insert" on public.%I for insert to authenticated with check (owner_id = (select auth.uid()))', t);
    execute format('create policy "owner can update" on public.%I for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))', t);
    execute format('create policy "owner can delete" on public.%I for delete to authenticated using (owner_id = (select auth.uid()))', t);
  end loop;
end $$;

-- Decisions are a permanent record: no edits or deletes.
drop policy "owner can update" on public.suggestion_decisions;
drop policy "owner can delete" on public.suggestion_decisions;

-- Anyone may join the waitlist; nobody can read it through the website.
create policy "anyone can join waitlist" on public.waitlist for insert to anon, authenticated with check (true);

-- ─────────────────────────────────────────────────────────────
-- File storage: a private "drawings" bucket. Files live in a folder named after the user's id.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
values ('drawings', 'drawings', false, 20971520) -- 20 MB per file
on conflict (id) do nothing;

create policy "owner can read drawings" on storage.objects for select to authenticated
  using (bucket_id = 'drawings' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owner can upload drawings" on storage.objects for insert to authenticated
  with check (bucket_id = 'drawings' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owner can delete drawings" on storage.objects for delete to authenticated
  using (bucket_id = 'drawings' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Explicit permissions (harmless if Supabase already granted them).
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.assemblies, public.parts, public.assembly_files,
  public.analysis_runs, public.suggestions, public.suggestion_comments, public.eol_ratings to authenticated;
grant select, insert on public.suggestion_decisions to authenticated;
grant insert on public.waitlist to anon, authenticated;
