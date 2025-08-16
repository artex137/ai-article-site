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
};

export async function POST(req: Request) {
  try {
    const { text = "", imageUrl = null } = await req.json();

    const userContent: any[] = [
      {
        type: "text",
        text: `You are a newsroom analyst.
Inspect the image (if any) and the user's notes.
Return STRICT JSON ONLY with:
{
  "focus": string,            // user's apparent focus
  "angle": string,            // recommended framing
  "headline_idea": string,
  "key_points": string[],
  "entities": string[],
  "locations": string[],
  "topics": string[],
  "needs_research": true,     // bias to true to fetch fresh info
  "research_query": string    // concise query aligned to the focus (+ key entities)
}
No prose. No backticks.`
      }
    ];

    if (imageUrl) userContent.push({ type: "image_url", image_url: { url: imageUrl } });
    if (text) userContent.push({ type: "text", text: `User notes:\n${text}` });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "Output valid JSON only." },
        { role: "user", content: userContent as any }
      ]
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    const json = raw.replace(/^\s*```json\s*|\s*```\s*$/g, "");
    const parsed = JSON.parse(json);

    const entities = Array.isArray(parsed?.entities) ? parsed.entities : [];
    const topics = Array.isArray(parsed?.topics) ? parsed.topics : [];

    const focus: string = parsed?.focus || "";
    let research_query: string =
      parsed?.research_query ||
      [focus, ...entities.slice(0, 5), ...topics.slice(0, 3)].filter(Boolean).join(" ");

    const out: AnalyzeOut = {
      focus,
      angle: parsed?.angle || "",
      headline_idea: parsed?.headline_idea || "",
      key_points: Array.isArray(parsed?.key_points) ? parsed.key_points : [],
      entities,
      locations: Array.isArray(parsed?.locations) ? parsed.locations : [],
      topics,
      needs_research: true, // force research to enrich with current info
      research_query
    };

    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "analyze failed" }, { status: 500 });
  }
}
