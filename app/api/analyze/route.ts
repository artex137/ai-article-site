// app/api/analyze/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";

// Force Node runtime (not Edge) so outbound HTTPS to OpenAI is reliable
export const runtime = "nodejs";

// Accept any non-empty string for imageUrl; normalize blanks/"undefined"/null to null
const Body = z.object({
  text: z.string().optional(),
  imageUrl: z
    .preprocess((v) => {
      if (v === undefined || v === null) return null;
      if (typeof v === "string") {
        const t = v.trim();
        if (!t || t === "undefined" || t === "null") return null;
        return t;
      }
      return null;
    }, z.string().nullable())
    .optional(),
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.trim()) {
      return NextResponse.json(
        { error: "OpenAI API key missing in environment" },
        { status: 500 }
      );
    }

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
      data = raw ? JSON.parse(raw) : {};
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
    // Always return JSON so the client never hits "Unexpected end of JSON input"
    return NextResponse.json(
      { error: String(err?.message || err || "Analyze failed") },
      { status: 500 }
    );
  }
}
