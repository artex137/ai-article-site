import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

function bulletList(results: any[] = []) {
  return results
    .slice(0, 8)
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

    const researchBullets = bulletList(research?.results || []);

    const systemPrompt = `
You are a veteran online news writer producing a stylized report that is easy to scan.
Rules:
- Neutral, fact-forward tone (AP-like), no hype, no speculation beyond sources.
- Use short paragraphs (1–3 sentences), scannable subheads (<h2>), bullets (<ul><li>), and small callouts.
- Include a small metadata header block and a Key Takeaways section.
- Include a "What We Found" section tied to the user's focus/angle.
- Include a "Context & Background" section leveraging research bullets.
- Include an optional "What We Don't Know Yet" section if applicable.
- Close with a "Sources" section listing the researched links.
- Output clean HTML only (no <html> or <body>). No images; the site attaches a hero image separately.
- Keep it 600–900 words if material allows. If less info exists, produce a concise but polished brief.
`;

    const userPrompt = `
USER FOCUS: ${focus || "(not provided)"}
ANGLE: ${angle || "(not provided)"}

USER NOTES (verbatim):
${text || "(none)"}

ANALYZER KEYS:
- Headline idea: ${headlineIdea || "(none)"}
- Entities: ${entities.join(", ") || "(none)"}
- Topics: ${topics.join(", ") || "(none)"}
- Key points:
${keyPoints.map((k: string) => `  - ${k}`).join("\n") || "  - (none)"}

RESEARCH (titles & links):
${researchBullets || "- (none)"}

Now write the report. Sections to include in order:
1) <h1>Headline informed by the user's focus</h1>
2) A small meta bar (date/time; 1 sentence summary) -> use a <p class="meta">…</p>
3) <h2>Key Takeaways</h2> with 3–6 bullets
4) <h2>What We Found</h2> (tie directly to the uploaded content and analyzer focus)
5) <h2>Context & Background</h2> (use the research bullets cautiously; do not overclaim)
6) <h2>What We Don’t Know Yet</h2> (only if there are material unknowns or caveats)
7) <h2>Sources</h2> as a <ul> of links (titles hyperlinked to URLs if available)

Constraints:
- If facts are unknown, say so plainly.
- Never fabricate numbers, names, or quotes.
- Keep HTML minimal: <h1>, <h2>, <p>, <ul><li>, <blockquote>, <a>.
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

    // Title from <h1>
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title =
      (titleMatch && titleMatch[1].trim()) ||
      headlineIdea ||
      (focus ? `Report: ${focus}` : "Report");

    const slug = slugify(title);

    return NextResponse.json({
      title,
      slug,
      content: html,
      image_url: imageUrl || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "generate-article failed" }, { status: 500 });
  }
}
