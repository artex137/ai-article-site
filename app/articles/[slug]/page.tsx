import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { data: article } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!article) return notFound();

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={article.image_url || "/placeholder.jpg"}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
          <div className="max-w-4xl mx-auto px-6 py-6 text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              {article.title}
            </h1>
            <p className="mt-2 text-sm opacity-80">
              {new Date(article.created_at).toLocaleDateString()} · Infotain Desk
            </p>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div
          className="prose lg:prose-lg prose-gray"
          dangerouslySetInnerHTML={{ __html: article.content || "" }}
        />
      </div>
    </article>
  );
}
