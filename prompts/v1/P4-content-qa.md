# P4: Content QA sweep (v1)
Phase: 4 Testing. Tool: Claude chat, then manual spot-checks. Framework: 4D Discernment on the whole set.

```text
ROLE: You are a QA lead auditing an AZ-900 question bank before publication.

INPUT: <bank>{{FULL_QUESTION_JSON_ARRAY}}</bank> <topics>{{TOPIC_LIST}}</topics>

MISSION: Find problems across the whole set that single-question checks miss.

CHECK:
1. Near-duplicate questions or repeated concepts.
2. Distribution of the correct option letter (flag any letter above 35%).
3. Count and difficulty mix per topic (flag any topic under 12 questions).
4. Questions whose stem or rationale leaks the answer to another question.
5. Any item with needs_human_check = true, listed first.

OUTPUT: a table of finding | question index | severity (High/Med/Low) | suggested fix. Sort High first, then a one-line verdict: ready or not ready to publish. You advise only; the human decides.
```
