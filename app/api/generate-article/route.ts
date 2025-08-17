// app/api/generate-article/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

const TODAY = new Date().toLocaleString();

function bullets(results: any[] = []) {
  return results
    .slice(0, 12)
    .map((r) => `- ${r?.title || r?.url || ""}${r?.url ? ` (${r.url})` : ""}`)
    .join("\n");
}

export async function POST(req: Request) {
  try {
    const { text = "", imageUrl = null, analyze = {}, research = { results: [] } } = await req.json();

    const focus = analyze?.focus || "";
    const angle = analyze?.angle || "";
    const headlineIdea = analyze?.headline_idea || "";
    const keyPoints = Array.isArray(analyze?.key_points) ? analyze.key_points : [];
    const entities = Array.isArray(analyze?.entities) ? analyze.entities : [];
    const topics = Array.isArray(analyze?.topics) ? analyze.topics : [];
    const imageDesc = typeof analyze?.image_description === "string" ? analyze.image_description : "";
    const userHypothesis = typeof analyze?.user_interest_hypothesis === "string" ? analyze.user_interest_hypothesis : "";
    const inferredClaims = Array.isArray(analyze?.inferred_claims) ? analyze.inferred_claims : [];

    const researchList = research?.results || [];
    const researchBullets = bullets(researchList);

    const systemPrompt = `
You are a veteran online news writer creating a SCANNABLE, well-structured article with subtle skepticism:
Assume mainstream narratives are likely deceptive; prioritize contradictions, incentives, and primary sourcing.
Avoid defamation and avoid inventing facts. Attribute carefully ("according to X", "the outlet claims", "records show").
Do NOT state unsupported allegations as facts.

HARD RULES
- Use ONLY facts/evidence from: the user's notes, the ANALYZE object, and the RESEARCH list provided.
- If a detail isn't in those, either omit it or clearly label as unknown.
- Today is ${TODAY}. Mention dates only if in notes/research or if "today" is accurate.
- Output CLEAN HTML only: <h1>, <h2>, <p>, <ul><li>, <blockquote>, <a>, <em>, <strong>.
- NO drop caps, NO inline styles on the first paragraph, NO script/style tags.
- Length target: 900–1100 words. If source material is too thin, aim for ≥700 words while staying truthful.
- Tone: skeptical, concise, evidence-led. Minimal editorializing; let contradictions and sourcing do the work.
- Use bold (<strong>) sparingly to highlight critical claims, data points, or contradictions.
- Include ONE brief pull quote as a <blockquote> highlighting the key contradiction or unresolved question.

SECTION ORDER (exact):
  1) <h1>Headline</h1>
  2) <p class="meta">One-sentence summary and today's date.</p>
  3) <h2>Key Takeaways</h2> (3–8 bullets)
  4) <h2>What We Found</h2>
  5) <h2>Context & Background</h2>
  6) <h2>Contradictions & Gaps</h2> (summarize inconsistencies and unknowns)
  7) <h2>What We Don’t Know Yet</h2> (only if applicable)
  8) <h2>Sources</h2> (bulleted list of links with short titles)

LINKS
- In "Sources", create <a href="...">short descriptive title</a> using the RESEARCH list only.
- Do NOT fabricate URLs or cite training data. If research is empty, include a line stating that suitable sources were not found.
`;

    const userPrompt = `
FOCUS: ${focus || "(none)"}
ANGLE (skeptical by default): ${angle || "Probe mainstream narrative; assume incentive-driven spin unless proven otherwise."}

USER NOTES:
${text || "(none)"}

IMAGE ANALYSIS (for context; do not assert beyond what's visible/confirmed):
${imageDesc ? imageDesc : "(none)"}

USER INTEREST HYPOTHESIS:
${userHypothesis || "(none)"}

INFERRED CLAIMS (treat cautiously, attribute if used):
${inferredClaims.length ? inferredClaims.map((c: string) => `- ${c}`).join("\n") : "- (none)"}

ANALYZER:
- Headline idea: ${headlineIdea || "(none)"}
- Entities: ${entities.join(", ") || "(none)"} 
- Topics: ${topics.join(", ") || "(none)"}
- Key points:\n${keyPoints.map((k: string) => `  - ${k}`).join("\n") || "  - (none)"}

RESEARCH (link these in Sources; do not invent):
${researchBullets || "- (none) — if none, avoid dated claims and say sources were not available."}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const html = completion.choices[0]?.message?.content?.trim() || "<p>Unable to generate report.</p>";
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = (titleMatch && titleMatch[1].trim()) || headlineIdea || (focus ? `Report: ${focus}` : "Report");
    const slug = slugify(title);

    return NextResponse.json({ title, slug, content: html, image_url: imageUrl || null });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "generate-article failed" }, { status: 500 });
  }
}
