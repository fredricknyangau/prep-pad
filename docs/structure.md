# Project structure

```text
az900-prep-coach/
├── README.md                  Public README (finished in Phase 5)
├── .env.example               Required env vars; copy to .env.local
├── .gitignore                 Ignores .env, node_modules, content/raw
├── docs/
│   ├── spec.md                MVP spec (P1 output)
│   └── structure.md           This file
├── prompts/
│   ├── README.md              Prompt index, content pipeline, model log
│   └── v1/                    P1 to P5, versioned
├── content/
│   ├── raw/                   Generator output (gitignored)
│   ├── validated/             Validator output + your edits
│   └── published/             Human-reviewed questions, source of the seed
├── supabase/
│   ├── migrations/            Numbered raw SQL (0001_init.sql, ...)
│   ├── seed/                  Seed SQL or JSON built from content/published
│   └── functions/explain/     Optional Edge Function for the live explainer
├── scripts/                   Helpers (e.g. JSON to seed SQL)
├── src/
│   ├── components/            Reusable UI
│   ├── pages/                 Home, Quiz, Result, Dashboard
│   ├── lib/                   Supabase client, scoring helpers
│   └── hooks/                 Data hooks
├── tests/                     Scoring and readiness tests
└── public/                    Static assets (generic cloud icon only, no Microsoft logos)
```

## Rules

- **Schema first.** Nothing in `src/` changes the schema; only `supabase/migrations/` does, numbered and forward-only.
- **Secrets.** Only the Supabase URL and publishable key may be in the frontend. The Supabase secret key is never used in this project. The Gemini key lives in Edge Function secrets.
- **Content gate.** The app serves only rows with `reviewed_by_human = true`.
- **Bolt/Lovable output** gets dropped into `src/` after the first pass. From then on, edit locally.
