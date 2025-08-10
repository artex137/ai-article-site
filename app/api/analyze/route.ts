import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { z } from "zod";

// Allow null imageUrl
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
      messages[1].content.push({ type: "input_image", image_url: imageUrl });
    }

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const raw = resp.choices?.[0]?.message?.content ?? "{}";

    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch {
      // Fallback if model didn't return valid JSON
      data = {};
    }

    return NextResponse.json({
      needs_research: Boolean(data.needs_research),
      research_query: data.research_query || data.topic || text || "",
      intent_summary: data.intent_summary || "General interest",
    });
  } catch (err: any) {
    console.error("analyze error:", err);
    return NextResponse.json(
      { error: err?.message || "Analyze failed" },
      { status: 500 }
    );
  }
}
