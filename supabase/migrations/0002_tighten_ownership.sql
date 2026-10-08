-- ─────────────────────────────────────────────────────────────
-- Remodule Ai: extra safety rule (Phase 2)
-- Run once in Supabase → SQL Editor → New query → paste → Run.
--
-- Rows that belong to an assembly (parts, drawings, analysis results) may only be
-- added to or moved into an assembly that the same user owns.
-- ─────────────────────────────────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array['parts','assembly_files','analysis_runs','suggestions','eol_ratings']
  loop
    execute format('drop policy if exists "owner can insert" on public.%I', t);
    execute format('drop policy if exists "owner can update" on public.%I', t);
    execute format($p$create policy "owner can insert" on public.%I for insert to authenticated
      with check (owner_id = (select auth.uid())
        and exists (select 1 from public.assemblies a where a.id = assembly_id and a.owner_id = (select auth.uid())))$p$, t);
    execute format($p$create policy "owner can update" on public.%I for update to authenticated
      using (owner_id = (select auth.uid()))
      with check (owner_id = (select auth.uid())
        and exists (select 1 from public.assemblies a where a.id = assembly_id and a.owner_id = (select auth.uid())))$p$, t);
  end loop;
end $$;

-- Decisions and comments may only be attached to the user's own suggestions.
drop policy if exists "owner can insert" on public.suggestion_decisions;
create policy "owner can insert" on public.suggestion_decisions for insert to authenticated
  with check (owner_id = (select auth.uid())
    and exists (select 1 from public.suggestions s where s.id = suggestion_id and s.owner_id = (select auth.uid())));

drop policy if exists "owner can insert" on public.suggestion_comments;
create policy "owner can insert" on public.suggestion_comments for insert to authenticated
  with check (owner_id = (select auth.uid())
    and exists (select 1 from public.suggestions s where s.id = suggestion_id and s.owner_id = (select auth.uid())));
