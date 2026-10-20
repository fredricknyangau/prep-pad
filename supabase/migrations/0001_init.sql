-- =============================================================================
-- 0001_init.sql
-- AZ-900 Prep Coach — initial schema
-- Phase 2 (Design), per prompt P2a v1
-- Unofficial study tool. Not affiliated with or endorsed by Microsoft.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid() on older PG

-- ---------------------------------------------------------------------------
-- 1. topics
--    Two-level hierarchy:
--      depth 0 (parent_id IS NULL) — AZ-900 exam domain (3 rows)
--      depth 1 (parent_id = domain row) — learning module (12 rows)
--
--    Domain slugs   : cloud-concepts | azure-architecture-services |
--                     azure-management-governance
-- ---------------------------------------------------------------------------
create table topics (
    id          uuid        primary key default gen_random_uuid(),
    slug        text        not null unique,
    title       text        not null,
    parent_id   uuid        references topics (id) on delete restrict,
    sort_order  smallint    not null default 0,
    created_at  timestamptz not null default now()
);

comment on table  topics             is 'AZ-900 exam domains (depth 0) and learning modules (depth 1).';
comment on column topics.parent_id  is 'NULL for domain rows; points to a domain row for module rows.';
comment on column topics.sort_order is 'Display order within the same parent (0-indexed).';

create index idx_topics_parent_id on topics (parent_id);

-- ---------------------------------------------------------------------------
-- 2. questions
--    options   — jsonb array of exactly 4 option objects:
--                [{"id":"A","text":"…","is_correct":false,"rationale":"…"}, …]
--    skill_ref — the Microsoft Learn unit URL (authoritative source)
--    difficulty — 1 easy / 2 medium / 3 hard
--    reviewed_by_human — gate: ONLY rows where true are served. Never set
--                        programmatically; a human sets it manually.
-- ---------------------------------------------------------------------------
-- ---------------------------------------------------------------------------
-- Helper function to validate options array without subquery in check constraint
-- ---------------------------------------------------------------------------
create or replace function public.validate_question_options(opts jsonb)
returns boolean
language sql
immutable
as $$
    select
        jsonb_typeof(opts) = 'array'
        and jsonb_array_length(opts) = 4
        and (
            select count(*)
            from jsonb_array_elements(opts) as opt
            where (opt->>'is_correct')::boolean = true
        ) = 1
        and (
            select bool_and(
                (opt ? 'id') and
                (opt ? 'text') and
                (opt ? 'is_correct') and
                (opt ? 'rationale')
            )
            from jsonb_array_elements(opts) as opt
        ) = true;
$$;

create table questions (
    id                  uuid        primary key default gen_random_uuid(),
    topic_id            uuid        not null references topics (id) on delete restrict,
    skill_ref           text        not null,
    difficulty          smallint    not null check (difficulty between 1 and 3),
    question            text        not null,
    options             jsonb       not null,
    summary             text        not null,
    needs_human_check   boolean     not null default false,
    check_note          text        not null default '',
    reviewed_by_human   boolean     not null default false,
    created_at          timestamptz not null default now(),

    constraint questions_options_valid check (public.validate_question_options(options))
);

comment on table  questions                   is 'Quiz questions. Only rows with reviewed_by_human = true are served.';
comment on column questions.options           is 'jsonb array of exactly 4 {id, text, is_correct, rationale} objects.';
comment on column questions.skill_ref         is 'Microsoft Learn unit URL — canonical source for this question.';
comment on column questions.reviewed_by_human is 'Must be set manually. App WHERE clause always filters on this = true.';
comment on column questions.needs_human_check is 'Flagged by generator when a fact may be volatile (price, SLA, limit, preview).';

create index idx_questions_topic_id          on questions (topic_id);
create index idx_questions_reviewed          on questions (topic_id) where reviewed_by_human = true;
create index idx_questions_needs_human_check on questions (id)       where needs_human_check = true;

-- ---------------------------------------------------------------------------
-- 3. attempts
--    Tied to Supabase anonymous auth (auth.uid()). No PII stored.
-- ---------------------------------------------------------------------------
create table attempts (
    id          uuid        primary key default gen_random_uuid(),
    session_id  uuid        not null,
    question_id uuid        not null references questions (id) on delete restrict,
    topic_id    uuid        not null references topics    (id) on delete restrict,
    chosen_id   text        not null,
    is_correct  boolean     not null,
    created_at  timestamptz not null default now()
);

comment on table  attempts            is 'One row per question answered. session_id = auth.uid() from anon sign-in.';
comment on column attempts.session_id is 'auth.uid() from Supabase anonymous sign-in. No PII stored.';
comment on column attempts.chosen_id  is 'The option id ("A"–"D") the learner selected.';

create index idx_attempts_session_topic_ts
    on attempts (session_id, topic_id, created_at desc);

create index idx_attempts_session_ts
    on attempts (session_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. Row-Level Security (RLS)
-- ---------------------------------------------------------------------------

alter table topics enable row level security;

create policy "topics_public_read"
    on topics for select
    using (true);

alter table questions enable row level security;

create policy "questions_public_read"
    on questions for select
    using (reviewed_by_human = true);

alter table attempts enable row level security;

create policy "attempts_insert_own"
    on attempts for insert
    with check (session_id = auth.uid());

create policy "attempts_select_own"
    on attempts for select
    using (session_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 5. readiness_by_topic view
--
-- Band thresholds (tunable — edit the CASE expressions in this view):
--   READY_THRESHOLD      = 0.80   → "Ready"
--   BORDERLINE_THRESHOLD = 0.60   → "Borderline"
--   below 0.60                    → "Needs work"
--   MIN_ATTEMPTS         = 5      → fewer attempts → "Not enough data"
--
-- Window: each session's latest 10 attempts per topic.
-- "Overall" rows have topic_id IS NULL.
-- ---------------------------------------------------------------------------
create or replace view readiness_by_topic as
with latest_10 as (
    select
        a.session_id,
        a.topic_id,
        t.title                    as topic_title,
        t.parent_id                as domain_id,
        a.is_correct,
        row_number() over (
            partition by a.session_id, a.topic_id
            order by     a.created_at desc
        )                          as rn
    from   attempts  a
    join   topics    t  on t.id = a.topic_id
),
windowed as (
    select
        session_id,
        topic_id,
        topic_title,
        domain_id,
        count(*)                          as attempt_count,
        sum(is_correct::int)              as correct_count,
        round(avg(is_correct::int)::numeric, 4) as accuracy
    from   latest_10
    where  rn <= 10
    group  by session_id, topic_id, topic_title, domain_id
),
topic_band as (
    select
        session_id,
        topic_id,
        topic_title,
        domain_id,
        attempt_count,
        correct_count,
        accuracy,
        case
            when attempt_count < 5    then 'Not enough data'   -- MIN_ATTEMPTS = 5
            when accuracy >= 0.80     then 'Ready'             -- READY_THRESHOLD
            when accuracy >= 0.60     then 'Borderline'        -- BORDERLINE_THRESHOLD
            else                           'Needs work'
        end                               as band
    from   windowed
),
overall as (
    select
        session_id,
        null::uuid                        as topic_id,
        'Overall'::text                   as topic_title,
        null::uuid                        as domain_id,
        sum(attempt_count)::bigint        as attempt_count,
        sum(correct_count)::bigint        as correct_count,
        round(avg(accuracy)::numeric, 4)  as accuracy,
        case
            when count(*) = 0
                then 'Not enough data'
            when round(avg(accuracy)::numeric, 4) >= 0.80
                then 'Ready'
            when round(avg(accuracy)::numeric, 4) >= 0.60
                then 'Borderline'
            else 'Needs work'
        end                               as band
    from   topic_band
    group  by session_id
)
select * from topic_band
union all
select * from overall;

comment on view readiness_by_topic is
    'Accuracy over the latest 10 attempts per (session, topic). '
    'Band thresholds: Ready >= 0.80, Borderline >= 0.60, Needs work < 0.60. '
    'MIN_ATTEMPTS = 5. "Overall" rows have topic_id IS NULL. '
    'Tune thresholds by editing the CASE expressions above.';

-- ---------------------------------------------------------------------------
-- 6. Seed — topics
--    3 domains (parent_id IS NULL) then 12 modules (parent_id = domain id)
-- ---------------------------------------------------------------------------

-- Domains
insert into topics (slug, title, parent_id, sort_order) values
    ('cloud-concepts',              'Describe cloud concepts',                        null, 0),
    ('azure-architecture-services', 'Describe Azure architecture and services',       null, 1),
    ('azure-management-governance', 'Describe Azure management and governance',       null, 2);

-- Modules — Path 1 (3 modules under cloud-concepts)
insert into topics (slug, title, parent_id, sort_order)
select mod.slug, mod.title, d.id, mod.ord
from (values
    ('cloud-concepts-mod1', 'Describe cloud computing',                     0),
    ('cloud-concepts-mod2', 'Describe the benefits of using cloud services', 1),
    ('cloud-concepts-mod3', 'Describe cloud service types',                  2)
) as mod (slug, title, ord)
cross join topics d
where d.slug = 'cloud-concepts';

-- Modules — Path 2 (5 modules under azure-architecture-services)
insert into topics (slug, title, parent_id, sort_order)
select mod.slug, mod.title, d.id, mod.ord
from (values
    ('arch-mod1', 'Describe the core architectural components of Azure',     0),
    ('arch-mod2', 'Describe Azure compute services',                         1),
    ('arch-mod3', 'Describe Azure networking services',                      2),
    ('arch-mod4', 'Describe Azure storage services',                         3),
    ('arch-mod5', 'Describe Azure identity, access, and security',           4)
) as mod (slug, title, ord)
cross join topics d
where d.slug = 'azure-architecture-services';

-- Modules — Path 3 (4 modules under azure-management-governance)
insert into topics (slug, title, parent_id, sort_order)
select mod.slug, mod.title, d.id, mod.ord
from (values
    ('mgmt-mod1', 'Describe cost management in Azure',                               0),
    ('mgmt-mod2', 'Describe features and tools in Azure for governance and compliance', 1),
    ('mgmt-mod3', 'Describe features and tools for managing and deploying Azure resources', 2),
    ('mgmt-mod4', 'Describe monitoring tools in Azure',                              3)
) as mod (slug, title, ord)
cross join topics d
where d.slug = 'azure-management-governance';
