# AZ-900 Prep Coach

> **Unofficial study tool. Not affiliated with, sponsored by, or endorsed by Microsoft.**
> Designed for mobile-first African candidates preparing for the Microsoft Azure Fundamentals (AZ-900) exam.

---

## Problem

When I started preparing for the AZ-900 certification in Nairobi, I hit three immediate walls with existing prep resources:

1. **Rote dumps without conceptual depth:** Most online question banks offer brain dumps with cryptic explanations that tell you *which* option is right, but never explain *why* the distractors are wrong in terms that make sense.
2. **Abstract corporate analogies:** Global practice tests explain Azure concepts using examples like multinational retail chains, Amtrak ticketing, or US banking networks. They assume Western enterprise context instead of grounding concepts in everyday regional systems like M-Pesa agent networks, SACCO cooperative ledgers, or local ISP infrastructure.
3. **Heavy, desktop-bound websites:** Most prep sites are bloated desktop portals requiring high bandwidth, full user sign-ups, and credit cards. When studying on mobile data with high latency or intermittent power, heavy web apps fail or consume expensive bundles.

---

## Solution

I built **AZ-900 Prep Coach**—a lightweight, mobile-first web app that acts as an honest exam readiness coach:

- **100% Original Question Bank:** 59 questions across all 12 official AZ-900 modules (Paths 1 to 3: Cloud Concepts, Azure Architecture & Services, and Azure Management & Governance), with zero reused questions from Microsoft Learn check-units.
- **"Explain It Simply" with Local Analogies:** Every option (all 236 choices) features a structured 3-part rationale: why the choice is right or wrong, an East African real-world analogy (e.g., M-Pesa float for Availability Zones, Matatu saccos for Resource Groups, physical titles vs digital registries for Entra ID), and the exact technical Azure term.
- **Server-Derived Readiness Tracker:** Instead of showing a vanity percentage, the app calculates a 10-attempt rolling window per topic directly in PostgreSQL. It groups candidates into honest readiness bands: *Ready* (≥80%), *Borderline* (60–79%), *Needs work* (<60%), or *Not enough data* (<5 attempts).
- **Zero Friction & Privacy-Preserving:** No email signup, passwords, or phone numbers. The app initializes instantly using the public API and a local session identifier stored in your browser.
- **Bandwidth Conscious:** A static SPA bundle under 150 kB gzipped, with large 48px touch targets for 360px mobile screens and clean Lucide SVG icons.

---

## Architecture

The system uses a serverless Jamstack pattern backed by PostgreSQL row-level security and database triggers:

```
+-------------------------------------------------------------+
|              Client: React 18 + Vite + Tailwind             |
|   (Mobile-first SPA, 360px tested, Lucide icons, ~144 kB)   |
+-------------------------------------------------------------+
                               |
                   HTTPS / Supabase PostgREST
                               |
                               v
+-------------------------------------------------------------+
|                 Supabase PostgreSQL 16 DB                   |
|                                                             |
|  - topics: Hierarchical domain & module taxonomy            |
|  - questions: 59 validated questions, reviewed_by_human     |
|  - attempts: Immutable audit log of quiz responses          |
|                                                             |
|  Security & Integrity:                                      |
|  - Row-Level Security (RLS) on public schema                |
|  - BEFORE INSERT trigger (attempts_enforce_integrity)       |
|    forces server-side derivation of is_correct & topic_id   |
|  - readiness_by_topic: Rolling 10-attempt window view       |
+-------------------------------------------------------------+
                               |
                    (Optional edge hook)
                               v
+-------------------------------------------------------------+
|         Supabase Edge Function: /functions/explain          |
|      (On-demand Deno runtime + Google Gemini API)           |
+-------------------------------------------------------------+
```

### Database Schema Highlights
- **`topics`**: Self-referencing table organizing 3 domains and 12 modules with sort ordering.
- **`questions`**: Contains stems, difficulty levels (1–3), official Microsoft Learn documentation links (`skill_ref`), structured options JSONB array with rationale and word counts, and an `IMMUTABLE` constraint validator (`validate_question_options`).
- **`attempts`**: Write-only attempt table. A `BEFORE INSERT` trigger queries `questions` directly, re-evaluating correctness on the server so malicious client payloads cannot fake high scores.
- **`readiness_by_topic`**: SQL window function (`row_number() over (partition by session_id, topic_id order by created_at desc)`) evaluating the latest 10 attempts per module and overall.

---

## The Prompt Pipeline

I did not let an LLM generate questions directly into production. I designed a 4-stage adversarial prompt pipeline to guarantee factual precision, question diversity, and zero hallucinated exam objectives:

```
[ Microsoft Learn Source Notes ]
               |
               v
  Stage 1: Generation (P2b)  -->  Claude 3.5 Sonnet generates questions from raw unit notes
               |
               v
  Stage 2: Adversarial Audit (P2c)  -->  Google Gemini analyzes questions against strict rules:
                                         - Flags repetitive stems or clues
                                         - Verifies common distractors
                                         - Checks Azure terminology changes
               |
               v
  Stage 3: Human Review & Validation  -->  I inspected all 59 questions manually:
                                           - Resolved 100% of audit flags
                                           - Verified balanced letter distribution (A-D all <35%)
                                           - Set reviewed_by_human = true
               |
               v
  Stage 4: Explainer Generation (P2d)  -->  Enriched 236 options with right/wrong reasons,
                                            Kenyan analogies, and technical summaries (<120 words)
               |
               v
  Stage 5: Automated QA Sweep (P4)  -->  Vitest suite (9 tests) verifying scoring math,
                                         distribution balance, and schema constraints
```

### Why This Pipeline?
Single-prompt question generation invariably produces hallucinated features, outdated pricing references (e.g. retired TCO Calculator), or giveaway distractor choices. Separating generation (P2b) from adversarial critique (P2c) with an independent model caught repetitive phrasing and subtle syllabus mismatches before human verification.

---

## Free-Stack Rationale

This project is built 100% on free tiers with zero credit card requirements:

| Component | Provider & Tier | Cost | Why Chosen |
|---|---|---|---|
| **Database & API** | Supabase Free Tier (PostgreSQL 16) | $0.00 | Generous 500 MB DB, native PostgREST API, RLS security, and SQL triggers. |
| **Hosting & CI/CD** | Vercel / GitHub Pages | $0.00 | Fast edge CDN distribution for static assets, automatic HTTPS, zero server maintenance. |
| **Edge Compute** | Supabase Edge Functions (Deno) | $0.00 | 500,000 free invocations/month for on-demand explanations and translations. |
| **AI LLM Validation** | Google AI Studio (Gemini 2.5 Flash) | $0.00 | Free API tier (up to 15 RPM) for adversarial schema and distractor audits. |
| **Tooling** | Vite + Tailwind + Vitest + TypeScript | $0.00 | Open source, fast build pipeline (<6s build time), zero runtime licensing fees. |

---

## Responsible AI Choices

1. **Anonymous Data & Zero Tracking:** Candidates do not register with names, phone numbers, or passwords. Quiz sessions are linked to an ephemeral UUID stored locally in `localStorage`, complying with privacy-by-design principles and the Kenya Data Protection Act (DPA 2022).
2. **Prominent Unofficial Disclaimer:** Every screen features a persistent disclaimer: *"Unofficial study tool. Not affiliated with, sponsored by, or endorsed by Microsoft."* No Microsoft logos, trademarks, or proprietary branding are used.
3. **Mandatory Human Review Gate:** AI is used as a draft assistant, never an unreviewed publisher. Only questions with `reviewed_by_human = true` in the database can ever be queried by the client interface (enforced via PostgreSQL RLS: `using (reviewed_by_human = true)`).
4. **Adversarial Content Audit:** Every generated distractor was tested against common student misconceptions rather than tricky "gotcha" wordplay.

---

## Limitations

Limitations: This is an unofficial conceptual readiness coach containing 59 curated questions across AZ-900 Paths 1–3, not an exhaustive brain dump or an official Microsoft certification exam engine.

---

## Setup Steps

### Prerequisites
- Node.js 18+ (tested on Node v20/v26)
- A free [Supabase](https://supabase.com) project

### 1. Clone & Install
```bash
git clone https://github.com/fredricknyangau/prep-pad.git
cd az900-prep
npm install
```

### 2. Configure Environment
Create `.env.local` in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### 3. Apply Database Migrations & Seed
In your Supabase project dashboard, navigate to the **SQL Editor** and execute the consolidated migration script:
```bash
# File located at:
supabase/all_migrations_and_seed.sql
```
*Alternatively, apply the individual numbered migrations in `supabase/migrations/` (0001, 0002, 0003) followed by `supabase/seed/0001_questions_seed.sql`.*

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Test Suite
```bash
npm test
```
Executes all unit tests verifying the scoring engine, band thresholds, and readiness aggregation logic.

---

## Roadmap

- [x] Complete AZ-900 Path 1 (Cloud Concepts — 15 questions)
- [x] Complete AZ-900 Path 2 (Architecture & Services — 26 questions)
- [x] Complete AZ-900 Path 3 (Management & Governance — 18 questions)
- [x] 100% option rationales with Kenyan analogies (236 options)
- [x] Anti-cheat server-side scoring trigger
- [x] Rolling 10-attempt topic readiness engine
- [ ] Offline PWA caching with Service Worker for zero-data revision
- [ ] Swahili language toggle for all 236 option explanations
- [ ] Timed 45-minute mock exam simulator matching the 35-question exam format
