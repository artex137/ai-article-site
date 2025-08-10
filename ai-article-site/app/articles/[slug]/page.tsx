import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { data } = await supabaseAdmin.from("articles").select("*").eq("slug", params.slug).single();
  if (!data) return notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{new Date(data.created_at).toLocaleString()}</p>
      {data.image_url && (<img src={data.image_url} alt={data.title} className="rounded-2xl w-full mb-6" />)}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.content }} />
    </article>
  );
}
