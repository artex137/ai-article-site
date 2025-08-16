// app/api/generate-image/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Ensure Node runtime (Buffer / fetch file bytes)
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { image_prompt } = await req.json();

    if (!image_prompt || typeof image_prompt !== "string") {
      return NextResponse.json({ error: "image_prompt is required" }, { status: 400 });
    }

    // 1) Generate the image via OpenAI (temporary URL is fine; we'll re-host)
    const gen = await openai.images.generate({
      model: "gpt-image-1",
      prompt: image_prompt,
      size: "1024x1024",
      response_format: "url",
    });

    const rawUrl = gen?.data?.[0]?.url?.trim();
    if (!rawUrl) {
      return NextResponse.json({ error: "OpenAI did not return an image URL" }, { status: 502 });
    }

    // 2) Download bytes from the temporary URL
    const imgRes = await fetch(rawUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ error: "Failed to fetch generated image from OpenAI" }, { status: 502 });
    }
    const contentType = imgRes.headers.get("content-type") || "image/png";
    const arrBuf = await imgRes.arrayBuffer();
    const bytes = Buffer.from(arrBuf);

    // 3) Upload bytes to your Supabase *public* bucket (per README: article-images)
    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "article-images";
    const ext = contentType.includes("png") ? "png" : contentType.includes("jpeg") ? "jpg" : "png";
    const filename = `ai-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filename, bytes, { contentType, upsert: false });

    if (uploadErr) {
      return NextResponse.json({ error: "Supabase upload failed: " + uploadErr.message }, { status: 500 });
    }

    // 4) Get a permanent public URL from Supabase
    const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename);
    const publicUrl = (pub?.publicUrl || "").trim();

    try {
      new URL(publicUrl); // sanity check
    } catch {
      return NextResponse.json({ error: "Invalid Supabase public URL produced" }, { status: 500 });
    }

    return NextResponse.json({ image_url: publicUrl }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
