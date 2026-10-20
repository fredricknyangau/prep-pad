# AZ-900 Prep Coach — 2-Minute Demo Video Script

**Format:** Screencast with voiceover (mobile viewport: 390x844 or device frame).  
**Tone:** Confident, grounded, engineer-to-engineer. Spoken in first-person as a learner-turned-builder from Nairobi.  
**Total Runtime:** Exactly 2 minutes (120 seconds).

---

## Timing & Teleprompter Breakdown

### [0:00 – 0:20] 1. The Hook & The Personal Problem (20 seconds)
- **Visual:** Camera on speaker or screen showing the mobile view of the app loading instantly at `localhost:3000`. Quick cut to standard generic brain-dump sites with unhelpful explanations.
- **Voiceover:**
  > "Hi everyone, I'm Fredrick, a backend engineer from Nairobi. When preparing for the AZ-900 Azure Fundamentals certification, I hit a frustrating wall: existing quiz banks are either paywalled desktop dumps with zero context, or they use abstract Western corporate examples that don't stick. When you're revising on mobile data with high latency, bloated websites fail. So I built **AZ-900 Prep Coach**—an unofficial, zero-friction readiness coach grounded in real African analogies."

---

### [0:20 – 0:45] 2. The Home Screen & Frictionless UX (25 seconds)
- **Visual:** Smooth scroll down the mobile screen (360px viewport). Point to the persistent *"Unofficial: not affiliated with Microsoft"* disclaimer, the streak counter, and the 3 official exam domain groups expanding into 12 modules.
- **Voiceover:**
  > "Notice three things immediately: first, zero friction—no email signup, no passwords, no personal data collected. It loads in under 150 milliseconds. Second, every screen clearly states our unofficial disclaimer. And third, our curriculum maps cleanly to Microsoft's three official exam domains across 12 modules, with real-time readiness progress tracked per module."

---

### [0:45 – 1:15] 3. Taking a Quiz & "Explain It Simply" (30 seconds)
- **Visual:** Tap "Describe cloud service types (IaaS, PaaS, SaaS)". Tap an answer option. Show the instantaneous feedback banner. Tap the yellow lightbulb icon: **"Explain it simply"**. The drawer smoothly opens showing the 3-part explanation: Right/wrong reason, Kenyan analogy (M-Pesa agent / Matatu sacco), and exact Azure terminology.
- **Voiceover:**
  > "Let's jump into a quiz on Cloud Service Types. When I select an option, I don't just get a green or red banner—I get instant, deep conceptual clarity. By tapping 'Explain it simply', I unlock a structured three-part breakdown: why this distractor is wrong, a grounded local analogy—like comparing Infrastructure as a Service to leasing a bare commercial plot in Nairobi where you build your own shop—and the exact technical Azure terminology you need on exam day."

---

### [1:15 – 1:40] 4. Server-Side Integrity & Topic Readiness (25 seconds)
- **Visual:** Complete the 3rd question. Confetti fires on completion. The Result Screen displays score and weak areas. Tap "View Topic Readiness". Show the 10-attempt rolling window table and honest readiness badges (*Ready*, *Borderline*, *Needs work*, *Not enough data*).
- **Voiceover:**
  > "After completing the quiz, there are no vanity scores. Every answer is verified on the server via PostgreSQL database triggers, preventing client-side score tampering. Our readiness engine calculates accuracy across a rolling 10-attempt window. It tells you honestly if you're 'Ready', 'Borderline', or 'Need work', pinpointing exactly which modules to revise before spending 100 dollars on an exam voucher."

---

### [1:40 – 2:00] 5. The Pipeline, Free-Stack, & Conclusion (20 seconds)
- **Visual:** Quick cut to the repository showing the prompt pipeline diagram (`prompts/README.md`) and GitHub repository. Back to the app for a closing shot.
- **Voiceover:**
  > "All 59 questions were produced through an adversarial AI pipeline—generated with Claude, stress-tested with Gemini, and 100% human-verified. Built on PostgreSQL, React, and Supabase free tier with zero ongoing hosting costs. AZ-900 Prep Coach makes cloud certification accessible, conceptual, and fast for every African developer. Thank you!"

---

## Production Checklist for Recording
- [ ] Viewport set to mobile dimension (e.g. Chrome DevTools 390px x 844px).
- [ ] Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are populated.
- [ ] Clear `localStorage` before starting to showcase a clean first-time user experience.
- [ ] Audio recorded with clear mic; avoid ambient noise.
- [ ] Total video file length must not exceed 02:00.
