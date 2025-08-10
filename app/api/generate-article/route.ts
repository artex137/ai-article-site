import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { z } from "zod";

const Body = z.object({
  text: z.string().optional(),
  imageUrl: z.string().url().optional(),
  analyze: z.any(),
  research: z.object({ results: z.any().array().optional() }).optional()
});

export async function POST(req: Request) {
  const { text, imageUrl, analyze, research } = Body.parse(await req.json());

  const system = `You are a senior editor. Write a concise, factual, engaging article based on the user's upload and intent.
- You are the overseer and writer.
- Use research results only to augment understanding; never copy phrasing.
- Include a strong headline and a short dek/summary.
- Return JSON with: title, slug, summary, html, hero_prompt.`;

  const messages: any[] = [
    { role: "system", content: system },
    { role: "user", content: `User text:\n${text || "(none)"}\n\nIntent: ${analyze.intent_summary}` }
  ];
  if (imageUrl) messages.push({ role: "user", content: `User image URL: ${imageUrl}` });
  if (research?.results?.length) {
    messages.push({
      role: "user",
      content: `Supplementary research results (use as context only):\n${JSON.stringify(research.results)}`
    });
  }

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    response_format: { type: "json_object" },
    temperature: 0.6
  });

  const data = JSON.parse(resp.choices[0].message.content || "{}");
  return NextResponse.json({
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    html: data.html,
    hero_prompt: data.hero_prompt
  });
}
