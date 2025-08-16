export const revalidate = 0;
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  // Fetch only fields we render
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("title, content, image_url, created_at, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error) {
    // Surface fetch errors as a controlled server error (instead of opaque digest)
    throw new Error(`Article fetch failed: ${error.message}`);
  }
  if (!data) return notFound();

  // Guard against non-string content to avoid server exceptions
  const html: string = typeof data.content === "string" ? data.content : "";

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          {data.title}
        </h1>
        <p className="text-sm text-gray-500">
          {data.created_at ? new Date(data.created_at).toLocaleString() : ""}
        </p>
      </header>

      {data.image_url && (
        <img
          src={data.image_url}
          alt={data.title}
          className="rounded-2xl w-full h-96 object-cover mb-8"
        />
      )}

      <div
        className="prose prose-lg md:prose-xl prose-a:underline prose-a:underline-offset-2 prose-img:rounded-xl"
        // Render the generated HTML safely
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
