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
        text:
          `You are a newsroom analyst. Inspect the image (if provided) and the user's notes. 
Return STRICT JSON with keys:
{
  "focus": string,            // what the user seems to care about most
  "angle": string,            // the angle or frame for coverage
  "headline_idea": string,
  "key_points": string[],     // bullets of what to cover
  "entities": string[],
  "locations": string[],
  "topics": string[],
  "needs_research": boolean,  // true if web search would add useful context
  "research_query": string    // a concise query aligned to the focus
}
Only JSON. No backticks. No prose.`
      }
    ];

    if (imageUrl) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageUrl }
      });
    }
    if (text) {
      userContent.push({ type: "text", text: `User notes:\n${text}` });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a precise news analyst who outputs valid JSON only." },
        { role: "user", content: userContent as any }
      ]
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    const jsonSafe = raw.replace(/^\s*```json\s*|\s*```\s*$/g, "");
    const parsed = JSON.parse(jsonSafe) as Partial<AnalyzeOut>;

    // Minimal hardening
    const out: AnalyzeOut = {
      focus: parsed.focus || "",
      angle: parsed.angle || "",
      headline_idea: parsed.headline_idea || "",
      key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
      entities: Array.isArray(parsed.entities) ? parsed.entities : [],
      locations: Array.isArray(parsed.locations) ? parsed.locations : [],
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      needs_research: parsed.needs_research ?? true,       // bias toward researching for richer context
      research_query: parsed.research_query || parsed.focus || ""
    };

    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "analyze failed" }, { status: 500 });
  }
}
