import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { z } from "zod";

const Body = z.object({
  text: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  analyze: z.any().optional(),
  research: z
    .object({
      results: z.array(z.any()).optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const { text, imageUrl, analyze, research } = Body.parse(await req.json());

    const system = `You are a senior editor. Write a concise, factual, engaging article based on the user's upload and intent.
- You are the overseer and writer.
- Use research results only to augment understanding; never copy phrasing.
- Include a strong headline and a short dek/summary.
- Return JSON with: title, slug, summary, html, hero_prompt.`;

    const messages: any[] = [
      { role: "system", content: system },
      {
        role: "user",
        content: `User text:\n${text || "(none)"}\n\nIntent: ${
          analyze?.intent_summary || "General interest"
        }`,
      },
    ];
    if (imageUrl) messages.push({ role: "user", content: `User image URL: ${imageUrl}` });
    if (research?.results?.length) {
      messages.push({
        role: "user",
        content: `Supplementary research results (use as context only):\n${JSON.stringify(
          research.results
        )}`,
      });
    }

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const raw = resp.choices?.[0]?.message?.content ?? "{}";

    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    // Normalize output to expected shape (never undefined)
    return NextResponse.json({
      title: data.title || "Untitled Article",
      slug: data.slug || "untitled-article",
      summary: data.summary || "",
      html: data.html || "<p>(No content generated)</p>",
      hero_prompt:
        data.hero_prompt ||
        "Photorealistic editorial image matching the article topic, clean lighting, 3:2.",
    });
  } catch (err: any) {
    console.error("generate-article error:", err?.message || err);
    return NextResponse.json(
      {
        error: "article generation failed",
        title: "Untitled Article",
        slug: "untitled-article",
        summary: "",
        html: "<p>(No content generated due to an error.)</p>",
        hero_prompt:
          "Simple neutral abstract image, soft gradient background, minimal, high-resolution.",
      },
      { status: 500 }
    );
  }
}
