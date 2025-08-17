// app/api/analyze/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";

type AnalyzeOut = {
  focus: string;
  angle: string;
  headline_idea: string;
  key_points: string[];
  entities: string[];
  locations: string[];
  topics: string[];
  needs_research: boolean;
  research_query: string;
  // New (optional) enrichments — safe to ignore elsewhere if unused
  image_description?: string;
  user_interest_hypothesis?: string;
  inferred_claims?: string[];
  safety_flags?: string[];
};

export async function POST(req: Request) {
  try {
    const { text = "", imageUrl = null } = await req.json();

    // Build a single multimodal user message for 4o-mini
    const userContent: any[] = [
      {
        type: "text",
        text: [
          "You are an intake analyst for an automated newsroom.",
          "Your job: LOOK at the image (if any), READ the user's notes, and return STRICT JSON ONLY.",
          "",
          "JSON contract (keys + meaning):",
          "{",
          '  "focus": string,                 // what the user seems to care about most',
          '  "angle": string,                 // framing that assumes mainstream narratives are likely deceptive',
          '  "headline_idea": string,         // a punchy headline aligned to the angle',
          '  "key_points": string[],          // 4–10 bullet points to cover in the piece',
          '  "entities": string[],            // people/organizations/brands present or implied',
          '  "locations": string[],           // places/geos visible or referenced',
          '  "topics": string[],              // topical tags (e.g. "censorship", "biosecurity")',
          '  "needs_research": true,          // bias to true so we always enrich with fresh info',
          '  "research_query": string,        // concise query built from focus + entities + topics',
          '  "image_description": string,     // VERY DETAILED description: objects, text, symbols, composition, relationships, mood, setting, colors, logos, watermarks, time cues; include any on-image text verbatim if legible',
          '  "user_interest_hypothesis": string, // what the user is likely trying to highlight or prove',
          '  "inferred_claims": string[],     // cautious, non-definitive list of what the content could be suggesting',
          '  "safety_flags": string[]         // ["violent","medical","political","adult","copyright","unknown"] if applicable',
          "}",
          "",
          "Rules:",
          "- Output VALID JSON only. No prose, no backticks.",
          "- If something is unknown, use sensible defaults: empty arrays, empty string.",
          "- Keep angle aligned with: 'mainstream narrative is probably deceptive; probe contradictions and incentives' (do NOT assert defamation; be cautious and attribution-heavy)."
        ].join("\n")
      }
    ];

    if (imageUrl) userContent.push({ type: "image_url", image_url: { url: imageUrl } });
    if (text) userContent.push({ type: "text", text: `User notes:\n${text}` });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "Return STRICT JSON ONLY. No code fences." },
        { role: "user", content: userContent as any }
      ]
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    const json = raw.replace(/^\s*```json\s*|\s*```\s*$/g, ""); // belt + suspenders
    const parsed = JSON.parse(json);

    const array = (v: any) => (Array.isArray(v) ? v : []);
    const str = (v: any) => (typeof v === "string" ? v : "");

    // Build research query fallback if missing
    const focus = str(parsed.focus);
    const research_query =
      str(parsed.research_query) ||
      [focus, ...array(parsed.entities).slice(0, 5), ...array(parsed.topics).slice(0, 5)]
        .filter(Boolean)
        .join(" ");

    const out: AnalyzeOut = {
      focus,
      angle: str(parsed.angle),
      headline_idea: str(parsed.headline_idea),
      key_points: array(parsed.key_points),
      entities: array(parsed.entities),
      locations: array(parsed.locations),
      topics: array(parsed.topics),
      needs_research: true, // keep research on by default
      research_query,
      image_description: str(parsed.image_description),
      user_interest_hypothesis: str(parsed.user_interest_hypothesis),
      inferred_claims: array(parsed.inferred_claims),
      safety_flags: array(parsed.safety_flags)
    };

    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "analyze failed" }, { status: 500 });
  }
}
