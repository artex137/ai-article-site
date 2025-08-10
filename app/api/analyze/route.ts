import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { z } from "zod";

const Body = z.object({ text: z.string().optional(), imageUrl: z.string().url().optional() });

export async function POST(req: Request) {
  const { text, imageUrl } = Body.parse(await req.json());

  const messages: any[] = [
    { role: "system", content: "You analyze the user's upload to infer their intent. Return JSON with fields: topic, intent_summary, needs_research (boolean), research_query." },
    { role: "user", content: [{ type: "text", text: text || "No text provided." }] }
  ];
  if (imageUrl) {
    messages[1].content.push({ type: "input_image", image_url: imageUrl });
  }

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    response_format: { type: "json_object" },
    temperature: 0.4
  });

  const data = JSON.parse(resp.choices[0].message.content || "{}");
  return NextResponse.json({
    needs_research: Boolean(data.needs_research),
    research_query: data.research_query || data.topic || text || "",
    intent_summary: data.intent_summary || "General interest"
  });
}
