# AZ-900 Prep Coach: MVP Spec (unofficial)

> Unofficial study tool. Not affiliated with or endorsed by Microsoft.

Deadline: Fri 23 Oct 2026, 18:00 EAT (target submit 15:00). Free-tier tools only. Solo builder.

## 1. Problem
Learners practise AZ-900 questions but rarely learn why an answer is right or wrong. They also cannot tell when they are ready to sit the exam.

## 2. Persona
An African AZ-900 candidate studying on a phone, on mobile data, in short sessions.

## 3. User stories

### US1. Choose a domain (Must)
As a learner, I pick an AZ-900 domain and start a quiz.
- Given the home screen, when I tap a domain, then I see questions from that domain only.
- Given a domain with no questions, when I open it, then I see a clear empty state.

### US2. Instant feedback (Must)
As a learner, I get instant feedback on each answer.
- Given a question, when I choose an option, then it shows right or wrong immediately.
- Given I have answered, when I try to change it, then the answer stays locked.

### US3. Per-option explanations (Must)
As a learner, I understand why every option is right or wrong.
- Given I have answered, when feedback appears, then I see a rationale for my choice and for the correct option.
- Given a published question, then all 4 options have a rationale.

### US4. Saved scores (Must)
As a learner, my results are saved per topic.
- Given I finish a quiz, when I reopen the app, then my topic scores are still there.
- Given no sign-up, then my results are tied to an anonymous session.

### US5. Readiness dashboard (Must)
As a learner, I see how ready I am.
- Given at least one attempt, when I open the dashboard, then I see a score per domain and an overall band.
- Given zero attempts, then I see "not enough data yet", not a band.

### US6. Unofficial label (Must)
As a learner, I always know the tool is unofficial.
- Given any screen, then the "Unofficial, not affiliated with Microsoft" label is visible.
- Given any screen, then no Microsoft logo appears.

### US7. Explain it simply (Should)
As a learner, I get a plain-language explanation with a Kenyan analogy.
- Given a result screen, when I tap the button, then I see a short explanation under 120 words.
- Given the explanation text, then it adds no facts beyond the stored rationale.

### US8. Weak-area retry (Should)
As a learner, I can retry my weakest topics.
- Given completed attempts, when I tap "Retry weak topics", then the quiz uses my lowest-scoring topics.
- Given only one topic attempted, then the retry uses that topic.

## 4. Rubric map

| Criterion | Weight | Earned by |
|---|---|---|
| Learning Value | 25% | Reviewed original questions, per-option rationales |
| Prompt Engineering | 20% | Versioned generator, validator and explainer prompts |
| UX and Vibes | 15% | Mobile-first quiz, instant feedback, streak animation |
| Rapid Prototyping | 15% | Working end-to-end MVP on free tools, tool log |
| Technical Creativity | 15% | Generate, validate, human-review pipeline; SQL readiness view |
| Presentation and Docs | 10% | README, demo video, Canva deck |

## 5. Out of scope
Flashcards, study planner, heavy login flows, Swahili toggle (Could), real exam questions.

## 6. Assumptions and open questions
- ASSUMPTION: domains are taken from the current public skills outline.
- ASSUMPTION: the question bank has 45-60 questions, all human-reviewed.
- ASSUMPTION: readiness is accuracy on the latest 10 attempts per topic, with tunable thresholds.
- QUESTION: should "Explain it simply" be pre-generated or a live AI call?
- QUESTION: is a minimum per-topic question count required before showing a readiness band?
