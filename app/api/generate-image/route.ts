import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { image_prompt } = await req.json();

  const img = await openai.images.generate({
    model: "gpt-image-1",
    prompt: image_prompt,
    size: "1792x1024"
  });

  const b64 = img.data[0].b64_json!;
  const bytes = Buffer.from(b64, "base64");

  const name = `hero-${Date.now()}.png`;
  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET!;

  const { data, error } = await supabaseAdmin.storage.from(bucket).upload(name, bytes, {
    contentType: "image/png",
    upsert: false
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(name);
  return NextResponse.json({ image_url: pub.publicUrl });
}
