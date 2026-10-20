# AZ-900 Prep Coach — 6-Slide Pitch Deck Outline

**Target Venue:** #1MillionDevs Vibe Coding Hackathon  
**Criteria Weighting:** Problem (20%) | Solution & Product (25%) | Target Users (15%) | Impact & Scalability (20%) | Clarity, Design & Delivery (20%)  
**Presenter:** Fredrick Nyang'au (Learner-turned-builder, Backend Engineer)

---

## Slide 1: Title & Mission
**Header:** AZ-900 Prep Coach  
**Subheader:** Honest, mobile-first cloud readiness with East African conceptual grounding  
**Visuals:**
- Mobile mockup displaying the app running at 360px with dark mode UI, clean Lucide icons, and the unofficial badge.
- Tagline: *"Don't memorize exam dumps. Understand cloud systems."*

**Speaker Notes:**
> "Good day judges. I'm Fredrick Nyang'au. Today I'm presenting AZ-900 Prep Coach—an unofficial, zero-friction exam readiness platform built for African developers and students preparing for the Microsoft Azure Fundamentals certification."

---

## Slide 2: Problem Understanding (Score Weight: 20%)
**Header:** The Certification Hurdle in Emerging Tech Hubs  
**Key Points:**
1. **Rote Dumps vs Real Learning:** Existing prep tools focus on memorizing stolen test dumps with zero conceptual explanation. Candidates fail when questions vary slightly.
2. **Abstract Western Context:** Enterprise exam analogies cite Amtrak train schedules, Wall Street trading systems, or massive retail chains—foreign concepts that add cognitive load to students.
3. **Heavy, Paywalled Web Portals:** Commercial test tools demand desktop monitors, mandatory sign-up flows, credit cards, and heavy payloads that fail over intermittent mobile data.
4. **Expensive Stakes:** The AZ-900 voucher costs $99 USD (~KES 13,000)—a substantial investment for an early-career engineer that cannot be wasted on guesswork.

**Speaker Notes:**
> "In Kenya and across the continent, tech talent is rising fast, but certification exams are high-stakes. At 99 dollars a voucher, you cannot afford to guess if you're ready. Yet existing prep platforms are desktop-heavy, require credit cards, and explain cloud elasticity using Amtrak train schedules instead of systems our learners actually experience."

---

## Slide 3: Solution & Product Experience (Score Weight: 25%)
**Header:** AZ-900 Prep Coach: Deep Concepts, Zero Friction  
**Key Points:**
1. **100% Original Questions:** 59 questions across all 12 official modules (Paths 1–3), audited against syllabus changes.
2. **"Explain It Simply" with Regional Grounding:** 236 option explanations mapping abstract cloud mechanics to local realities (e.g., M-Pesa float for Availability Zones, Matatu Saccos for Resource Groups).
3. **Rolling Topic Readiness Engine:** SQL window function calculates readiness over a 10-attempt rolling window per topic (*Ready*, *Borderline*, *Needs work*), eliminating vanity metrics.
4. **Sub-150ms Mobile Performance:** Zero-auth guest sessions stored in `localStorage`, 144 kB gzipped bundle, optimized for 360px mobile screens.

**Speaker Notes:**
> "AZ-900 Prep Coach solves this from first principles. It delivers 59 completely original questions across 12 modules. Every single option provides an instant 'Explain it simply' drawer that deconstructs wrong choices using local analogies—like explaining high availability through the M-Pesa agent float network. Plus, our PostgreSQL readiness engine calculates a rolling 10-attempt window to tell you honestly when you are ready to book."

---

## Slide 4: Target Users & Market Reality (Score Weight: 15%)
**Header:** Built for the African Mobile-First Learner  
**Key Points:**
1. **University Students & Bootcamp Cohorts:** Students at institutions like Kabarak University, Moringa School, and ALX seeking cloud credentials to stand out in junior hiring.
2. **Self-Taught Backend Engineers:** Developers transitioning from localhost monoliths to cloud architectures who need conceptual clarity over rote memorization.
3. **Low-Bandwidth Mobile Environments:** Learners commuting via Matatu or studying during power cuts using mobile hotspots (where lightweight SPAs excel).

**Speaker Notes:**
> "Our target audience isn't sitting in corporate Silicon Valley offices with fiber broadband. They are university students, bootcamp fellows, and self-taught developers studying on mobile phones in Nairobi, Lagos, and Kigali. We designed every touch target to be at least 48 pixels and kept the entire payload under 150 kilobytes so it loads reliably on 3G connections."

---

## Slide 5: Engineering Rigor & The Adversarial AI Pipeline (Score Weight: 20%)
**Header:** Production Backend Principles & Responsible AI  
**Key Points:**
- **Adversarial AI Pipeline:**
  - *Generation (Claude 3.5 Sonnet):* Structured drafting from raw Microsoft Learn documentation notes.
  - *Audit (Google Gemini 2.5 Flash):* Adversarial scan flagging repeated stems, giveaway distractors, and outdated syllabus terms.
  - *Human Verification:* 100% human-verified (`reviewed_by_human = true` required by RLS to display questions).
- **Zero-Trust Server Integrity:**
  - Client sends only `question_id` and `chosen_id`.
  - PostgreSQL `BEFORE INSERT` trigger queries the database to derive `is_correct` server-side, preventing client-side score spoofing.
- **100% Free-Tier Architecture:** Supabase PostgreSQL 16 + React 18 + Vite + Vercel/GitHub Pages ($0.00/mo operating cost).

**Speaker Notes:**
> "We didn't just ask an LLM to generate questions and dump them into a database. We built a 4-stage adversarial pipeline: Claude generates, Gemini audits against syllabus pitfalls, and every single question was manually verified before setting `reviewed_by_human` to true. Under the hood, a PostgreSQL database trigger computes scores server-side so no one can fake readiness. The entire stack runs on free tiers with zero ongoing infrastructure costs."

---

## Slide 6: Impact, Scalability & Roadmap (Score Weight: 20%)
**Header:** Democratizing Cloud Fluency Across Africa  
**Key Points:**
1. **Immediate Hackathon Readiness:**
   - 100% test coverage on scoring and readiness logic (9 Vitest tests passing).
   - Production bundle built and live.
2. **Scalability:**
   - Stateless client + PostgreSQL connection pooling easily supports thousands of concurrent quiz sessions without paying for database upgrades.
3. **Next Milestones:**
   - **Offline PWA:** Service Worker caching for 100% zero-data offline revision.
   - **Swahili Language Localization:** Native Swahili explanations for all 236 options.
   - **Full Mock Exam Simulator:** 45-minute timed simulation matching the 35-question testing environment.

**Speaker Notes:**
> "By combining rigorous engineering, regional context, and responsible AI validation, AZ-900 Prep Coach turns certification anxiety into genuine conceptual competence. The platform is production-ready today, completely free, and scalable across any emerging cloud hub. Thank you, and I look forward to your questions!"
