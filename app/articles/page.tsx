// app/articles/page.tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// don't cache this page (always read latest)
export const revalidate = 0;

type Article = {
  id: number;
  title: string;
  content: string | null;
  image_url: string | null;
  slug: string;
  created_at: string | null;
};

function getPreview(html?: string | null, length = 140) {
  if (!html) return "";
  // very light strip of tags for preview
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > length ? text.slice(0, length) + "…" : text;
}

export default async function ArticlesPage() {
  // Using the public URL + anon key is fine for server-side reads on a public table
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnon);

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, content, image_url, slug, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    // show a friendly error so it's visible on the page if something goes wrong
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Articles</h1>
        <p className="text-red-600">Failed to load articles: {error.message}</p>
      </div>
    );
  }

  const articles = (data ?? []) as Article[];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Articles</h1>

      {articles.length === 0 ? (
        <p className="text-gray-500">No articles yet. Create one from the “Upload” page.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.id}
              href={`/articles/${a.slug}`}
              className="group rounded-2xl overflow-hidden border hover:shadow-lg transition"
            >
              {/* Using <img> avoids Next/Image domain config issues */}
              {a.image_url ? (
                <img
                  src={a.image_url}
                  alt={a.title}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-44 w-full bg-gray-100" />
              )}

              <div className="p-4">
                <h2 className="text-lg font-semibold group-hover:underline">
                  {a.title}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {getPreview(a.content)}
                </p>
                {a.created_at && (
                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
