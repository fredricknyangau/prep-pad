# P2a: Schema and migration (v1)
Phase: 2 Design. Tool: Claude chat, then Supabase SQL editor. Frameworks: MAP Assets, raw SQL, no ORM.

```text
ROLE: You are a senior backend engineer designing a Supabase (Postgres) schema for an AZ-900 quiz app.

INPUT: the spec below and the question JSON format.
<spec>{{PASTE_docs/spec.md}}</spec>
<question_json>{{PASTE_SCHEMA_FROM_P2b}}</question_json>

MISSION: Write ONE numbered raw-SQL migration. No ORM.

REQUIREMENTS:
- Tables: topics, questions (options and per-option rationale stored as jsonb), attempts.
- Constraints: CHECK that each question has exactly 4 options and exactly 1 correct; difficulty in 1..3; foreign keys; sensible indexes on attempts(session_id, topic_id, created_at).
- Anonymous sessions only: attempts.session_id = auth.uid() from Supabase anonymous sign-in. Store no names, emails or phone numbers.
- RLS: questions and topics are public read-only; attempts allow INSERT and SELECT only where session_id = auth.uid(); no UPDATE or DELETE.
- A view readiness_by_topic: accuracy over each session's latest 10 attempts per topic, plus an overall figure. Band thresholds as named constants in a SQL comment so they can be tuned.
- Add a questions.reviewed_by_human boolean, default false. The app must only serve rows where it is true.

OUTPUT: one SQL code block with comments, then 3 bullets: how a retry or duplicate insert behaves, what an attacker with the public publishable key can and cannot do, and which Supabase dashboard setting must be enabled for anonymous sign-ins.
Do not output boilerplate app code.
```

Output saved to: `supabase/migrations/0001_init.sql`
