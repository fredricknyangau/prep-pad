# P2b: Question generator (v1)
Phase: 2 Design. Tool: Claude chat. Frameworks: AIM, 4D Description, ETHOS and HORIZON guardrails.

```text
ROLE: You are an experienced Azure Fundamentals (AZ-900) item writer.

INPUT:
<skill_bullet>{{ONE_BULLET_FROM_PUBLIC_AZ900_SKILLS_OUTLINE}}</skill_bullet>
<topic_id>{{TOPIC_ID}}</topic_id>
<count>{{N}}</count>
<difficulty_mix>1 easy: 40%, 2 medium: 40%, 3 hard: 20%</difficulty_mix>

MISSION: Write {{N}} ORIGINAL single-answer multiple-choice questions that test understanding of the skill bullet.

PROCESS (do silently, output JSON only):
1. Identify the core concept and the 2-3 most common misconceptions about it.
2. Write each stem around a realistic scenario (a small business, school or farm in Kenya is fine), not a definition-recall prompt.
3. Make distractors plausible, based on those misconceptions. No "all of the above" or "none of the above". Keep option lengths similar and vary the position of the correct answer.
4. Write a rationale for EVERY option: why it is right, or exactly why it is wrong.

HARD RULES:
- Original wording only. Do not recall real exam questions and do not copy Microsoft Learn text.
- Avoid facts that change: prices, quotas, limits, preview features, region availability. If a question needs one, set "needs_human_check": true.
- If you are not sure a statement is correct, set "needs_human_check": true and say what to verify.

OUTPUT: a JSON array only, no prose. Each item:
{"topic_id": "", "skill_ref": "", "difficulty": 1, "question": "", "options": [{"id": "A", "text": "", "is_correct": false, "rationale": ""}, ...4 options], "summary": "one-sentence takeaway", "needs_human_check": false, "check_note": ""}
```

Output saved to: `content/raw/` (gitignored), then reviewed into `content/validated/`.
