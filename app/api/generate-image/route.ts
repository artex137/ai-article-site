import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { image_prompt } = await req.json();

    if (!image_prompt || typeof image_prompt !== "string") {
      return NextResponse.json({ error: "Missing image prompt" }, { status: 400 });
    }

    // Generate image with DALL·E 3 widescreen format
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: image_prompt,
      size: "1792x1024", // valid widescreen
      quality: "hd" // valid quality option
    });

    const url = result.data[0]?.url;
    if (!url) {
      return NextResponse.json({ error: "No image URL returned" }, { status: 500 });
    }

    return NextResponse.json({ image_url: url });
  } catch (err: any) {
    console.error("generate-image error:", err);
    return NextResponse.json(
      { error: err?.message || "Image generation failed" },
      { status: 500 }
    );
  }
}
