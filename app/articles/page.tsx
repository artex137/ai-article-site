import ArticleCard from "@/components/ArticleCard";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0; // always read latest from DB

function previewFromHtml(html?: string | null, length = 160) {
  if (!html) return null;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text ? (text.length > length ? text.slice(0, length) + "…" : text) : null;
}

export default async function ArticlesPage() {
  // server-side client using public URL + anon key is fine for public tables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, content, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

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
    (data ?? []).map((row) => ({
      slug: row.slug,
      title: row.title,
      image_url: row.image_url,
      created_at: row.created_at,
      excerpt: previewFromHtml(row.content),
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
