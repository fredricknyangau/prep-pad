-- =============================================================================
-- 0005_learn_mode.sql
-- AZ-900 Prep Coach — Learn Mode Schema, Progress Tracking & Question Linkage
--
-- Unofficial study tool. Not affiliated with or endorsed by Microsoft.
--
-- Additive forward-only migration:
-- 1. Create helper validation function for lesson check_yourself JSONB array.
-- 2. Create lessons table for bite-sized revision units.
-- 3. Create lesson_progress table for session-based progress tracking.
-- 4. Create mark_lesson_progress RPC function (security invoker, non-downgrading).
-- 5. Add nullable lesson_id to questions with foreign key to lessons.
-- 6. Enable RLS and define strict read/write policies & role grants.
-- 7. Backfill questions.lesson_id from lessons.source_url where matching.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Helper function: validate check_yourself array structure (exactly 2 {q, a})
-- ---------------------------------------------------------------------------
create or replace function public.validate_lesson_check_yourself(items jsonb)
returns boolean
language sql
immutable
as $$
    select
        jsonb_typeof(items) = 'array'
        and jsonb_array_length(items) = 2
        and (
            select bool_and(
                (item ? 'q') and
                (item ? 'a') and
                jsonb_typeof(item->'q') = 'string' and
                jsonb_typeof(item->'a') = 'string' and
                length(trim(item->>'q')) > 0 and
                length(trim(item->>'a')) > 0
            )
            from jsonb_array_elements(items) as item
        ) = true;
$$;

comment on function public.validate_lesson_check_yourself(jsonb) is
    'Ensures check_yourself is a JSONB array of exactly 2 non-empty {q, a} objects.';

-- ---------------------------------------------------------------------------
-- 2. lessons table
-- ---------------------------------------------------------------------------
create table if not exists public.lessons (
    id                  uuid        primary key default gen_random_uuid(),
    slug                text        not null unique,
    topic_id            uuid        not null references public.topics(id) on delete restrict,
    position            integer     not null,
    title               text        not null,
    summary             text        not null,
    key_terms           jsonb       not null default '[]'::jsonb,
    real_example        text        not null,
    exam_lens           text        not null,
    common_distractor   text,
    memory_hook         text        not null,
    check_yourself      jsonb       not null default '[]'::jsonb,
    source_url          text        not null,
    est_read_minutes    integer     not null,
    needs_verification  boolean     not null default false,
    verify_note         text,
    reviewed_by_human   boolean     not null default false,
    created_at          timestamptz not null default now(),

    constraint lessons_topic_position_key unique (topic_id, position),
    constraint lessons_check_yourself_valid check (public.validate_lesson_check_yourself(check_yourself))
);

comment on table  public.lessons                   is 'Bite-sized revision lessons. Served only where reviewed_by_human = true.';
comment on column public.lessons.slug              is 'Human-readable stable identifier, e.g. p2-m1-04-physical-infrastructure.';
comment on column public.lessons.topic_id          is 'Foreign key to module topic (depth 1 in topics hierarchy).';
comment on column public.lessons.position          is 'Display order within the module (1-indexed).';
comment on column public.lessons.check_yourself    is 'Array of exactly two self-check {q, a} pairs.';
comment on column public.lessons.source_url        is 'Canonical Microsoft Learn unit URL.';
comment on column public.lessons.reviewed_by_human is 'Content gate: client queries always filter on reviewed_by_human = true.';
comment on column public.lessons.needs_verification is 'Flagged when dated baseline may differ from live training content.';

create index if not exists idx_lessons_topic_id   on public.lessons (topic_id);
create index if not exists idx_lessons_reviewed   on public.lessons (topic_id, position) where reviewed_by_human = true;
create index if not exists idx_lessons_source_url on public.lessons (source_url);

-- ---------------------------------------------------------------------------
-- 3. lesson_progress table
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_progress (
    session_id          uuid        not null default auth.uid(),
    lesson_id           uuid        not null references public.lessons(id) on delete cascade,
    status              text        not null check (status in ('viewed', 'completed')),
    first_viewed_at     timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    completed_at        timestamptz,

    primary key (session_id, lesson_id)
);

comment on table  public.lesson_progress                 is 'Per-session learner progress on revision lessons.';
comment on column public.lesson_progress.session_id      is 'auth.uid() from Supabase anonymous or authenticated session.';
comment on column public.lesson_progress.status          is 'Lesson status: viewed or completed. Completed never downgrades.';
comment on column public.lesson_progress.completed_at    is 'Timestamp when marked as completed (set once).';

create index if not exists idx_lesson_progress_session_status
    on public.lesson_progress (session_id, status);

-- ---------------------------------------------------------------------------
-- 4. RPC mark_lesson_progress (security invoker, non-downgrading upsert)
-- ---------------------------------------------------------------------------
create or replace function public.mark_lesson_progress(
    p_lesson_id uuid,
    p_status    text
)
returns public.lesson_progress
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_session_id uuid := auth.uid();
    v_row        public.lesson_progress;
begin
    if v_session_id is null then
        raise exception 'Authentication required: auth.uid() is null';
    end if;

    if p_status not in ('viewed', 'completed') then
        raise exception 'Invalid status: %. Must be "viewed" or "completed".', p_status;
    end if;

    insert into public.lesson_progress (
        session_id,
        lesson_id,
        status,
        first_viewed_at,
        updated_at,
        completed_at
    )
    values (
        v_session_id,
        p_lesson_id,
        p_status,
        now(),
        now(),
        case when p_status = 'completed' then now() else null end
    )
    on conflict (session_id, lesson_id) do update
    set
        -- Never downgrade completed to viewed
        status = case
            when public.lesson_progress.status = 'completed' then 'completed'
            else excluded.status
        end,
        updated_at = now(),
        -- Set completed_at once
        completed_at = case
            when public.lesson_progress.completed_at is not null then public.lesson_progress.completed_at
            when excluded.status = 'completed' then now()
            else null
        end
    returning * into v_row;

    return v_row;
end;
$$;

comment on function public.mark_lesson_progress(uuid, text) is
    'RPC upsert for learner lesson progress. Idempotent; never downgrades completed to viewed; records completed_at once.';

-- ---------------------------------------------------------------------------
-- 5. alter table questions add column lesson_id
-- ---------------------------------------------------------------------------
alter table public.questions
    add column if not exists lesson_id uuid references public.lessons(id) on delete set null;

create index if not exists idx_questions_lesson_id
    on public.questions (lesson_id);

-- ---------------------------------------------------------------------------
-- 6. Row-Level Security (RLS) & Grants
-- ---------------------------------------------------------------------------

-- lessons RLS: public read only where reviewed_by_human = true
alter table public.lessons enable row level security;

drop policy if exists "lessons_public_read_reviewed" on public.lessons;
create policy "lessons_public_read_reviewed"
    on public.lessons for select
    to anon, authenticated
    using (reviewed_by_human = true);

-- lesson_progress RLS: session_id = auth.uid() for select, insert, update; no delete
alter table public.lesson_progress enable row level security;

drop policy if exists "lesson_progress_select_own" on public.lesson_progress;
create policy "lesson_progress_select_own"
    on public.lesson_progress for select
    to anon, authenticated
    using (session_id = auth.uid());

drop policy if exists "lesson_progress_insert_own" on public.lesson_progress;
create policy "lesson_progress_insert_own"
    on public.lesson_progress for insert
    to anon, authenticated
    with check (session_id = auth.uid());

drop policy if exists "lesson_progress_update_own" on public.lesson_progress;
create policy "lesson_progress_update_own"
    on public.lesson_progress for update
    to anon, authenticated
    using (session_id = auth.uid())
    with check (session_id = auth.uid());

-- Permissions
grant select on table public.lessons to anon, authenticated;
grant select, insert, update on table public.lesson_progress to anon, authenticated;
grant execute on function public.mark_lesson_progress(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. Backfill questions.lesson_id from lessons.source_url
-- ---------------------------------------------------------------------------
update public.questions q
set lesson_id = l.id
from public.lessons l
where q.skill_ref = l.source_url
  and q.lesson_id is distinct from l.id;
