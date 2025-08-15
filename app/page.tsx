import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";

export default async function HomePage() {
  const { data: articles, error } = await supabaseAdmin
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Featured</h1>
          <p className="text-sm text-gray-500">
            The latest pieces generated with Infotain.
          </p>
        </div>
        <Link
          href="/articles"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          View all →
        </Link>
      </header>

      {error ? (
        <p className="text-red-600">Failed to load articles: {error.message}</p>
      ) : articles && articles.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a as any} />
          ))}
        </section>
      ) : (
        <p className="text-gray-600">No articles yet. Create one from the Upload page!</p>
      )}
    </main>
  );
}
