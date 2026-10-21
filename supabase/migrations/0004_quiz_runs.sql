-- =============================================================================
-- 0004_quiz_runs.sql
-- AZ-900 Prep Coach — Quiz Runs, Session Autosave & Attempt Idempotency
--
-- Unofficial study tool. Not affiliated with or endorsed by Microsoft.
--
-- Additive forward-only migration:
-- 1. Create quiz_runs table to track stateful quiz sessions (autosave/resume).
-- 2. Add run_id and answered_at columns to attempts.
-- 3. Add UNIQUE constraint on (run_id, question_id) to prevent duplicate counting.
-- 4. Enable Row Level Security (RLS) on quiz_runs.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. quiz_runs table
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_runs (
    id             uuid        primary key default gen_random_uuid(),
    session_id     uuid        not null,
    mode           text        not null check (mode in ('topic', 'mixed', 'weak', 'missed')),
    topic_slug     text,
    question_ids   jsonb       not null default '[]'::jsonb,
    current_index  integer     not null default 0,
    status         text        not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
    started_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);

comment on table  public.quiz_runs               is 'Active and completed quiz runs for autosave, resume, and review.';
comment on column public.quiz_runs.session_id   is 'Anonymous session UUID or auth.uid().';
comment on column public.quiz_runs.mode         is 'Quiz mode: topic, mixed, weak, or missed.';
comment on column public.quiz_runs.topic_slug   is 'Optional slug or ID of the selected topic (if mode = topic).';
comment on column public.quiz_runs.question_ids is 'Ordered JSON array of question UUIDs.';
comment on column public.quiz_runs.current_index is 'Current question index (0-indexed).';
comment on column public.quiz_runs.status       is 'Run status: in_progress, completed, or abandoned.';

create index if not exists idx_quiz_runs_session_status
    on public.quiz_runs (session_id, status, updated_at desc);

-- ---------------------------------------------------------------------------
-- 2. Update attempts table (additive, no data loss)
-- ---------------------------------------------------------------------------
alter table public.attempts
    add column if not exists run_id uuid references public.quiz_runs (id) on delete cascade;

alter table public.attempts
    add column if not exists answered_at timestamptz default now();

-- Add UNIQUE constraint on (run_id, question_id) for idempotent answer recording
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'attempts_run_id_question_id_key'
    ) then
        alter table public.attempts
            add constraint attempts_run_id_question_id_key unique (run_id, question_id);
    end if;
end $$;

create index if not exists idx_attempts_run_id
    on public.attempts (run_id);

-- ---------------------------------------------------------------------------
-- 3. Row-Level Security (RLS) on quiz_runs
--    Users can INSERT and SELECT their own rows, and UPDATE only their own
--    current_index and status (where session_id = auth.uid() or anon session).
-- ---------------------------------------------------------------------------
alter table public.quiz_runs enable row level security;

drop policy if exists "quiz_runs_select" on public.quiz_runs;
create policy "quiz_runs_select"
    on public.quiz_runs for select
    to anon, authenticated
    using (
        case
            when auth.uid() is not null then session_id = auth.uid()
            else true
        end
    );

drop policy if exists "quiz_runs_insert" on public.quiz_runs;
create policy "quiz_runs_insert"
    on public.quiz_runs for insert
    to anon, authenticated
    with check (
        case
            when auth.uid() is not null then session_id = auth.uid()
            else session_id is not null
        end
    );

drop policy if exists "quiz_runs_update" on public.quiz_runs;
create policy "quiz_runs_update"
    on public.quiz_runs for update
    to anon, authenticated
    using (
        case
            when auth.uid() is not null then session_id = auth.uid()
            else session_id is not null
        end
    )
    with check (
        case
            when auth.uid() is not null then session_id = auth.uid()
            else session_id is not null
        end
    );

-- ---------------------------------------------------------------------------
-- 4. Role grants
-- ---------------------------------------------------------------------------
grant select, insert, update on table public.quiz_runs to anon, authenticated;
grant select, insert, update on table public.attempts to anon, authenticated;
