-- =====================================================================
-- Remembers when each person was sent the "you're in" email, so nobody
-- ever gets it twice. Run once in Supabase → SQL Editor (after 0005).
-- =====================================================================
alter table public.waitlist add column if not exists welcome_sent_at timestamptz;
