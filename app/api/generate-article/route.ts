import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

const TODAY = new Date().toLocaleString();

function bullets(results: any[] = []) {
  return results.slice(0, 8).map((r) => `- ${r?.title || r?.url || ""}${r?.url ? ` (${r.url})` : ""}`).join("\n");
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
    const researchList = research?.results || [];

    const researchBullets = bullets(researchList);

    const systemPrompt = `
You are a veteran online news writer producing a stylized report that is easy to scan.

HARD RULES:
- USE ONLY facts present in the user's notes, the analyzer JSON, or the RESEARCH list. If a fact (especially a DATE or number) is not in RESEARCH or notes, do NOT state it.
- If information is missing, say it's unknown; do not infer from training data.
- Today is: ${TODAY}. Only reference a date if it appears in RESEARCH/notes or is "today".
- Neutral, AP-like tone. Short paragraphs (1–3 sentences). Clean HTML only (<h1>, <h2>, <p>, <ul><li>, <blockquote>, <a>).
- Include sections in this exact order:
  1) <h1>Headline</h1>
  2) <p class="meta">One-sentence summary and today's date.</p>
  3) <h2>Key Takeaways</h2> with 3–6 bullets
  4) <h2>What We Found</h2> (tie to uploaded content and analyzer focus/angle)
  5) <h2>Context & Background</h2> (use RESEARCH bullets; link titles to URLs)
  6) <h2>What We Don’t Know Yet</h2> (only if unknowns exist)
  7) <h2>Sources</h2> <ul><li><a href>Title</a></li>...</ul>

CONSTRAINTS:
- No images; the site attaches a hero image.
- 600–900 words if material allows, else a concise brief.
`;

    const userPrompt = `
FOCUS: ${focus || "(none)"}
ANGLE: ${angle || "(none)"}

USER NOTES:
${text || "(none)"}

ANALYZER:
- Headline idea: ${headlineIdea || "(none)"}
- Entities: ${entities.join(", ") || "(none)"}
- Topics: ${topics.join(", ") || "(none)"}
- Key points:
${keyPoints.map((k: string) => `  - ${k}`).join("\n") || "  - (none)"}

RESEARCH (use these for facts; link if URL present):
${researchBullets || "- (none) — if none, avoid dates and stick to what is known"}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
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
