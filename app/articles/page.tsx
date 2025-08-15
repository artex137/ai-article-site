// app/articles/page.tsx
import ArticleCard from "@/components/ArticleCard";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const revalidate = 60; // ISR: refresh the list at most once per minute

export default async function ArticlesPage() {
  // Pull recent articles (adjust limit if you like)
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("slug,title,content,image_url,created_at,summary")
    .order("created_at", { ascending: false })
    .limit(48);

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
        <p className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Failed to load articles: {error.message}
        </p>
      </main>
    );
  }

  const items =
    (data ?? []).map((row: any) => ({
      slug: row.slug,
      title: row.title,
      // prefer summary if present, else make a short preview from content
      summary:
        row.summary ??
        (typeof row.content === "string"
          ? row.content.replace(/<[^>]+>/g, "").slice(0, 160) + "…"
          : null),
      image_url: row.image_url,
      created_at: row.created_at,
    })) ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="mt-2 text-sm text-gray-600">
            Freshly generated stories, ranked by most recent.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          No articles yet. Create one from the <span className="font-medium">Upload</span> page.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <ArticleCard key={a.slug} {...a} />
          ))}
        </div>
      )}
    </main>
  );
}
