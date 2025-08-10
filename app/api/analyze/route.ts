import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";

// Accept text optional, imageUrl optional & nullable
const Body = z.object({
  text: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const { text, imageUrl } = Body.parse(await req.json());

    const messages: any[] = [
      {
        role: "system",
        content:
          "You analyze the user's upload to infer their intent. Return JSON with fields: topic, intent_summary, needs_research (boolean), research_query.",
      },
      { role: "user", content: [{ type: "text", text: text || "No text provided." }] },
    ];

    if (imageUrl) {
      messages[1].content.push({
        type: "input_image",
        image_url: imageUrl,
      });
    }

    // Call OpenAI and request a JSON object response
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const raw = resp.choices?.[0]?.message?.content ?? "{}";

    // Safe parse
    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch {
      data = {};
    }

    return NextResponse.json({
      needs_research: Boolean(data.needs_research),
      research_query: data.research_query || data.topic || text || "",
      intent_summary: data.intent_summary || "General interest",
    });
  } catch (err: any) {
    console.error("analyze error:", err?.message || err);
    // Always return JSON on error so the client never sees "Unexpected end of JSON input"
    return NextResponse.json(
      { error: err?.message || "Analyze failed" },
      { status: 500 }
    );
  }
}
