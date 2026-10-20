-- =============================================================================
-- 0003_publishable_api_rls.sql
-- Allow direct Publishable API access without Supabase Auth user accounts
--
-- Context: AZ-900 Prep Coach operates as a frictionless web app accessed via
-- the Supabase Publishable API key. Requests arrive under the PostgreSQL
-- `anon` role with auth.uid() = NULL.
--
-- Previous policies on `attempts` checked `session_id = auth.uid()`, which
-- rejected INSERTs and SELECTs when auth was not used.
--
-- This migration updates RLS policies and table grants so that:
-- 1. Topics and reviewed questions remain publicly readable.
-- 2. Attempts can be inserted with client-generated session UUIDs.
-- 3. Attempts and readiness_by_topic can be queried by session_id.
-- =============================================================================

-- 1. Drop auth.uid()-dependent policies
drop policy if exists "attempts_insert_own" on public.attempts;
drop policy if exists "attempts_select_own" on public.attempts;
drop policy if exists "attempts_insert_public" on public.attempts;
drop policy if exists "attempts_select_public" on public.attempts;

-- 2. Create policies allowing Publishable API (anon & authenticated roles) access
create policy "attempts_insert_public"
    on public.attempts for insert
    to anon, authenticated
    with check (session_id is not null);

create policy "attempts_select_public"
    on public.attempts for select
    to anon, authenticated
    using (true);

-- 3. Ensure explicit schema, table, and view permissions for the anon role
grant usage on schema public to anon, authenticated;
grant select on table public.topics to anon, authenticated;
grant select on table public.questions to anon, authenticated;
grant select, insert on table public.attempts to anon, authenticated;
grant select on public.readiness_by_topic to anon, authenticated;
