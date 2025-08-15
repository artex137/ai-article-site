import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { slugify } from "@/lib/slug";
import { z } from "zod";

const Body = z.object({
  title: z.string(),
  slug: z.string().optional(),
  summary: z.string().optional(),
  html: z.string(),
  image_url: z.string().url().optional()
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const slug = body.slug ? slugify(body.slug) : slugify(body.title);

  const { data, error } = await supabaseAdmin
    .from("articles")
    .insert({ title: body.title, slug, content: body.html, image_url: body.image_url ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, slug: data.slug });
}
