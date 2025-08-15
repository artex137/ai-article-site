import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ArticleCard } from "@/components/ArticleCard";
import Link from "next/link";

export default async function HomePage() {
  const { data } = await supabaseAdmin
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between mb-6">
        <h1 className="text-2xl font-semibold">Featured</h1>
        <Link href="/articles" className="text-brand-700 hover:underline">See all</Link>
      </div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((a) => <ArticleCard key={a.id} a={a} />)}
      </div>
    </div>
  );
}
