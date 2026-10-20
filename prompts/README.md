# Prompt log

Every AI prompt used to build this project lives here, versioned. Change a prompt by adding `v2/`, never by editing `v1/`.

| ID | Prompt | Tool | Phase |
|---|---|---|---|
| P1 | Spec writer | Claude chat | 1 Planning |
| P2a | Schema and migration | Claude chat, then Supabase SQL editor | 2 Design |
| P2b | Question generator | Claude chat | 2 Design |
| P2c | Question validator | Google AI Studio (Gemini) | 2 Design |
| P2d | Explainer | Claude chat (pre-generated), optional Gemini Edge Function | 2 Design |
| P3a | UI shell | Bolt.new or Lovable | 3 Implementation |
| P3b | Feature task template | Antigravity | 3 Implementation |
| P4 | Content QA sweep | Claude chat | 4 Testing |
| P5 | README, demo script, deck outline | Claude chat, Canva | 5 Documentation |

## Content pipeline

1. **Generate** (P2b) into `content/raw/` (gitignored).
2. **Validate** (P2c) with a different model.
3. **Human review.** Fix or reject each item, then save to `content/validated/`.
4. **Publish** only items you have personally verified to `content/published/`, with `reviewed_by_human = true` in the seed.

## Model log

Record which model did which step here as you go.

| Date | Prompt | Model | Notes |
|---|---|---|---|
| 2026-10-20 | P1 | Claude | Spec written, saved to docs/spec.md |
| 2026-10-20 | P2a | Claude | Initial schema and migrations (0001_init.sql, 0002_attempt_integrity.sql) |
| 2026-10-20 | P2b | Claude | Generated 59 original questions across 12 modules into content/raw/ |
| 2026-10-20 | P2c | Gemini / Claude | Adversarial audit across 12 modules; flagged distractor repetitions, multi-part stems, and duplicate distractors; human-reviewed and resolved to 0 flags in content/validated/ |
| 2026-10-20 | P2d | Claude / Antigravity | Pre-generated 236 tailored option explanations with Kenyan analogies (<120 words), stored in content/published/ and supabase/seed/0001_questions_seed.sql; implemented Supabase Edge Function in supabase/functions/explain/index.ts with Gemini fallback and Swahili support |
| 2026-10-20 | P3a | Antigravity | React + Vite + Tailwind mobile-first 4-screen UI shell with anonymous Supabase auth, instant feedback, and Lucide icons |
| 2026-10-20 | P3b | Antigravity | Feature tasks: wired topic progress bars to readiness_by_topic view, weak-area retry flow, emoji removal, and build optimization |
| 2026-10-20 | P4 | Antigravity / Vitest | Automated tests for scoring and readiness view (9 passed); 5-check QA sweep over content/published/ (balanced option letters <35%, 39/41/20 difficulty mix, 0 duplicate stems, 0 flags) |
| 2026-10-21 | P5 | Antigravity | Production README with architecture, pipeline, free-stack rationale, responsible AI choices, and limitations; 2-minute demo script with timings (docs/demo-script.md); 6-slide pitch deck outline (docs/pitch-deck.md) |
