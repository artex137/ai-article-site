import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ArticleCard from "@/components/ArticleCard";

export const revalidate = 60; // ISR: revalidate list at most once per minute

export default async function ArticlesPage() {
  const { data: articles, error } = await supabaseAdmin
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Articles</h1>

      {error ? (
        <p className="text-red-600">Failed to load articles: {error.message}</p>
      ) : articles && articles.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a as any} />
          ))}
        </section>
      ) : (
        <p className="text-gray-600">No articles found yet.</p>
      )}
    </main>
  );
}
