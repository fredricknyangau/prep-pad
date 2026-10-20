// Supabase Edge Function: explain
// Implements P2d: Explainer, "Explain it simply" (v1)
// Unofficial study tool. Not affiliated with or endorsed by Microsoft.

interface ExplainRequest {
  question: string;
  correct_rationale: string;
  learner_choice: {
    id: string;
    text: string;
    is_correct: boolean;
    rationale: string;
  } | string;
  language?: "en" | "sw";
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const payload: ExplainRequest = await req.json();
    const { question, correct_rationale, learner_choice, language = "en" } = payload;

    if (!question || !correct_rationale || !learner_choice) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: question, correct_rationale, learner_choice" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const choiceText = typeof learner_choice === "string" 
      ? learner_choice 
      : `Option ${learner_choice.id}: "${learner_choice.text}" (${learner_choice.is_correct ? "Correct" : "Incorrect"}). Rationale: ${learner_choice.rationale}`;

    const prompt = `ROLE: You are an AZ-900 study buddy for beginners in Kenya. Unofficial; not affiliated with Microsoft.

INPUT:
<question>${question}</question>
<correct_rationale>${correct_rationale}</correct_rationale>
<learner_choice>${choiceText}</learner_choice>
<language>${language}</language>

MISSION: Explain the concept in under 120 words, in plain ${language === "sw" ? "Swahili (keeping Azure service names in English)" : "English"}.

STRUCTURE:
(1) One sentence on why the learner's choice was right or wrong.
(2) One Kenyan analogy (for example M-Pesa agent redundancy for availability zones, matatu capacity for vertical vs horizontal scaling, or SACCO governance for Azure Policy).
(3) The exact Azure term to remember.

RULES:
- Use only the facts in the rationale provided. Do not add new technical claims.
- If no analogy fits without distorting the concept, skip it and say so in one clause.
- If the question is outside AZ-900 scope, say you can only help with AZ-900.
- Never ask for or store personal information. Never promise the learner will pass.
- Maximum 120 words. No intro/outro fluff.`;

    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (apiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 250,
              temperature: 0.3,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return new Response(
            JSON.stringify({ explanation: text, source: "live_ai" }),
            { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Fallback if no API key or upstream failure: construct structured explanation from provided rationale
    const isCorrect = typeof learner_choice === "object" ? learner_choice.is_correct : choiceText.toLowerCase().includes("correct");
    const choiceRationale = typeof learner_choice === "object" ? learner_choice.rationale : "";
    const choiceId = typeof learner_choice === "object" ? `Option ${learner_choice.id}` : "Your choice";

    const fallbackExplanation = language === "sw"
      ? (isCorrect
          ? `Safi sana! ${choiceId} ni sahihi: ${correct_rationale} Fikiria hili kama mtandao wa mawakala wa M-Pesa ambapo kuwa na vituo vingi huru kunahakikisha huduma haikatiki kamwe. Neno kuu la Azure: Tazama muhtasari wa swali.`
          : `Sio sahihi: ${choiceId} sio sahihi: ${choiceRationale || "Chaguo hili halilingani na mahitaji."} Badala yake: ${correct_rationale} Fikiria hili kama sheria za SACCO zinazolinda amana za wanachama. Neno kuu la Azure: Tazama muhtasari wa swali.`)
      : (isCorrect
          ? `Spot on! ${choiceId} is correct: ${correct_rationale} Think of this like an M-Pesa agent network where having multiple independent outlets ensures service never drops. Exact Azure term to remember: Check question summary.`
          : `Not quite: ${choiceId} is incorrect: ${choiceRationale || "This option does not meet the requirements."} Instead: ${correct_rationale} Think of this like managing a SACCO where strict governance bylaws protect member deposits. Exact Azure term to remember: Check question summary.`);

    return new Response(
      JSON.stringify({ explanation: fallbackExplanation, source: "fallback_rationale" }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
