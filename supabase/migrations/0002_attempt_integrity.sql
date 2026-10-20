-- =============================================================================
-- 0002_attempt_integrity.sql
-- Prevent client-side score manipulation on attempts.
--
-- Problem: 0001_init.sql lets the client supply is_correct and topic_id on
-- INSERT, so a cheating user could POST is_correct = true for every attempt
-- and fake a "Ready" readiness band.
--
-- Fix: a BEFORE INSERT trigger overwrites is_correct and topic_id from the
-- questions table before the row lands, making client-supplied values for
-- those columns irrelevant.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Trigger function
-- ---------------------------------------------------------------------------
create or replace function attempts_enforce_integrity()
returns trigger
language plpgsql
security definer   -- runs as the table owner, not the anon role
set search_path = public
as $$
declare
    v_topic_id   uuid;
    v_correct_id text;
begin
    -- Pull topic_id and the correct option id from the question.
    -- Only reviewed questions are in play (RLS on questions already guards this,
    -- but we check explicitly for defence-in-depth).
    select
        q.topic_id,
        opt->>'id'
    into
        v_topic_id,
        v_correct_id
    from questions q,
         jsonb_array_elements(q.options) as opt
    where q.id                 = new.question_id
      and q.reviewed_by_human  = true
      and (opt->>'is_correct')::boolean = true
    limit 1;

    if v_topic_id is null then
        raise exception 'question % not found or not reviewed', new.question_id;
    end if;

    -- Overwrite whatever the client sent for these two fields.
    new.topic_id  := v_topic_id;
    new.is_correct := (new.chosen_id = v_correct_id);

    return new;
end;
$$;

comment on function attempts_enforce_integrity() is
    'BEFORE INSERT trigger: derives is_correct and topic_id from questions, '
    'preventing client-side score manipulation.';

-- ---------------------------------------------------------------------------
-- 2. Attach the trigger
-- ---------------------------------------------------------------------------
create trigger trg_attempts_integrity
    before insert on attempts
    for each row
    execute function attempts_enforce_integrity();

-- ---------------------------------------------------------------------------
-- 3. Consequence: topic_id and is_correct on attempts are now write-computed.
--    The RLS INSERT policy still checks session_id = auth.uid() as before.
--    The client only needs to supply: session_id, question_id, chosen_id.
-- ---------------------------------------------------------------------------
