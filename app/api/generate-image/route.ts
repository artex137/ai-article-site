// app/api/generate-image/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { image_prompt } = (await req.json()) as { image_prompt?: string };

    const prompt =
      image_prompt ||
      "Photorealistic editorial image, neutral background, high detail.";

    // Use a supported size for gpt-image-1
    const img = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1536x1024", // valid: 1024x1024, 1024x1536, 1536x1024, or 'auto'
    });

    const b64 = img?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "image generation returned no data" },
        { status: 500 }
      );
    }

    const bytes = Buffer.from(b64, "base64");
    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "article-images";
    const name = `hero-${Date.now()}.png`;

    const { error } = await supabaseAdmin.storage.from(bucket).upload(name, bytes, {
      contentType: "image/png",
      upsert: false,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(name);
    const image_url = pub?.publicUrl;
    if (!image_url) {
      return NextResponse.json({ error: "no public url returned" }, { status: 500 });
    }

    return NextResponse.json({ image_url });
  } catch (err: any) {
    console.error("generate-image error:", err?.message || err);
    return NextResponse.json(
      { error: String(err?.message || "image generation failed") },
      { status: 500 }
    );
  }
}
