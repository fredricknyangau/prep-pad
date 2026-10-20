# P3a: UI shell (v1)
Phase: 3 Implementation. Tool: Bolt.new (or Lovable if credits remain). One credit-heavy pass, then push to GitHub.

```text
Build a mobile-first React + Vite + Tailwind app called "AZ-900 Prep Coach" with a visible "Unofficial: not affiliated with Microsoft" footer on every screen. Use a generic cloud icon; no Microsoft logos.

STACK: Supabase JS client. Anonymous sign-in on first load. Read tables topics and questions (only where reviewed_by_human = true), insert into attempts, read view readiness_by_topic. Keep the Supabase URL and publishable key (VITE_SUPABASE_PUBLISHABLE_KEY) in env vars. Never use or reference the Supabase secret key. No other API keys in the frontend.

SCREENS (build only these 4):
1. Home: topic cards with a progress bar per topic and a "Start quiz" button.
2. Quiz: one question per screen, 4 options, a progress indicator. After the learner answers, show instant feedback with a short animation, then the rationale for the chosen option and for the correct option, and a Next button. Add an "Explain it simply" button that is disabled for now.
3. Result: score, a per-topic breakdown, and a "Retry weak topics" button.
4. Readiness dashboard: a ring gauge per topic, an overall figure, and a band label (Not yet / Getting there / Likely ready). Show the thresholds in small text and label the figure "estimate, not a guarantee".

QUALITY: Clean modern UI, large tap targets, works at 360px width, loads fast on mobile data. Add one tasteful "wow" moment on reaching a 5-question streak.

CONSTRAINTS: Do not add features beyond the list. Do not refactor. Produce everything in a single pass and keep files small.
```
