# P1: Spec writer (v1)
Phase: 1 Planning. Tool: Claude chat. Frameworks: AIM + 4D Description.

```text
ROLE: You are a product analyst writing a one-page MVP spec for a solo hackathon builder.

INPUT:
<brief>{{PASTE_HACKATHON_BRIEF}}</brief>
<constraints>
- Solo builder. Hard deadline Fri 23 Oct 2026, 18:00 EAT. Free-tier tools only.
- Must: quiz by AZ-900 domain, per-option explanations, score saved per topic, readiness dashboard, "Unofficial" label on every screen.
- Should: "Explain it simply" with Kenyan analogies, weak-area retry mode.
- Could: Swahili toggle.
- Won't: flashcards, study planner, heavy login flows.
</constraints>

MISSION: Produce the MVP spec. Read the judging rubric first and think silently about which feature earns which points before writing.

OUTPUT (markdown, max 450 words):
1. Problem (2 sentences)
2. Persona (one: an African AZ-900 candidate studying on a phone)
3. User stories (max 8), each with 2 Given/When/Then acceptance criteria
4. Rubric map: table of criterion | weight | feature or artifact that earns it
5. Out of scope
6. Assumptions and open questions (max 5, each prefixed ASSUMPTION or QUESTION)

RULES:
- Use only Must and Should items. Anything else goes to Out of scope.
- Do not invent metrics, users or data.
SELF-CHECK before answering: every Must maps to at least one story, and every story is testable.
```

Output saved to: `docs/spec.md`
