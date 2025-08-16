import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** Ensure a unique slug by appending -2, -3, ... */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  const { data: existing, error: checkErr } = await supabaseAdmin
    .from("articles")
    .select("slug")
    .eq("slug", baseSlug)
    .limit(1);

  if (checkErr) return baseSlug;
  if (!existing || existing.length === 0) return baseSlug;

  const { data: siblings } = await supabaseAdmin
    .from("articles")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  let max = 1;
  (siblings || []).forEach((row) => {
    const s = row.slug as string;
    const m = s.match(new RegExp(`^${baseSlug}-(\\d+)$`));
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) max = Math.max(max, n);
    } else if (s === baseSlug) {
      max = Math.max(max, 1);
    }
  });

  return `${baseSlug}-${max + 1}`;
}

export async function POST(req: Request) {
  try {
    // Quick sanity checks for env — surfaces config issues early
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SUPABASE_URL is not set." },
        { status: 500 }
      );
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is not set. Set it in Vercel → Project → Settings → Environment Variables." },
        { status: 500 }
      );
    }

    const bodyText = await req.text();
    let body: any = {};
    try {
      body = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const title = (body.title || "").toString().trim();
    const content = (body.content || "").toString().trim();
    const image_url = (body.image_url || null) as string | null;
    let slug = (body.slug || "").toString().trim();

    if (!title) return NextResponse.json({ error: "Missing title." }, { status: 400 });
    if (!content) return NextResponse.json({ error: "Missing content HTML." }, { status: 400 });
    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    slug = await ensureUniqueSlug(slug);

    const { data, error } = await supabaseAdmin
      .from("articles")
      .insert([{ title, slug, content, image_url }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `DB insert failed: ${error.message || "unknown error"}` },
        { status: 500 }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: `publish crashed: ${err?.message || "unknown error"}` },
      { status: 500 }
    );
  }
}
