import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ArticleCard } from "@/components/ArticleCard";

export const metadata = { title: "Articles | AI Article Site" };
export const revalidate = 0;            // no ISR cache
export const dynamic = "force-dynamic"; // always fetch fresh

export default async function ArticlesPage() {
  const { data } = await supabaseAdmin
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">All Articles</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((a) => <ArticleCard key={a.id} a={a} />)}
      </div>
    </div>
  );
}
