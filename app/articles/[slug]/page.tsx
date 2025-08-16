export const revalidate = 0;
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

/** Simple inline SVG icons (no deps) */
function Icon({ name, className }: { name: "share" | "bookmark" | "printer"; className?: string }) {
  if (name === "share") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M13 5.5a3.5 3.5 0 1 0 6.46 1.5h.04a.5.5 0 0 0 0-1h-.04A3.5 3.5 0 0 0 13 5.5Zm-8 6A3.5 3.5 0 1 0 5.46 17h.04a.5.5 0 0 0 0-1h-.04A3.5 3.5 0 0 0 5 11.5Zm8 6a3.5 3.5 0 1 0 6.46 1.5h.04a.5.5 0 0 0 0-1h-.04A3.5 3.5 0 0 0 13 17.5Zm-5.72-4.53a.75.75 0 0 1 1.04-.22l7-4.5a.75.75 0 1 1 .8 1.26l-7 4.5a.75.75 0 0 1-.8-1.04Zm0 3a.75.75 0 0 1 .8-1.26l7 4.5a.75.75 0 0 1-.8 1.26l-7-4.5Z" />
      </svg>
    );
  }
  if (name === "bookmark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M6.75 3A2.75 2.75 0 0 0 4 5.75v14.04c0 .6.68.96 1.18.6l6.32-4.51 6.32 4.5a.75.75 0 0 0 1.18-.6V5.75A2.75 2.75 0 0 0 16.25 3h-9.5Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M6.5 4A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 17.5 4h-11Zm0 1.5h11c.55 0 1 .45 1 1V8h-13V6.5c0-.55.45-1 1-1Zm-1 4.5h13v7.5c0 .55-.45 1-1 1h-11c-.55 0-1-.45-1-1V10Z" />
    </svg>
  );
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const { data } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!data) return notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {/* Title + meta */}
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          {data.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <time dateTime={data.created_at}>
            {new Date(data.created_at).toLocaleString()}
          </time>
          <span className="inline-flex items-center gap-2">
            <button aria-label="Share" className="p-2 rounded-lg hover:bg-gray-100">
              <Icon name="share" className="w-5 h-5 fill-gray-500" />
            </button>
            <button aria-label="Bookmark" className="p-2 rounded-lg hover:bg-gray-100">
              <Icon name="bookmark" className="w-5 h-5 fill-gray-500" />
            </button>
            <button aria-label="Print" className="p-2 rounded-lg hover:bg-gray-100" onClick={() => window.print()}>
              <Icon name="printer" className="w-5 h-5 fill-gray-500" />
            </button>
          </span>
        </div>
      </header>

      {/* Hero image */}
      {data.image_url && (
        <img
          src={data.image_url}
          alt={data.title}
          className="rounded-2xl w-full h-96 object-cover mb-8"
        />
      )}

      {/* Article body (Typography-prose) */}
      <div
        className="prose prose-lg md:prose-xl prose-headings:scroll-mt-24 
                   prose-a:underline prose-a:decoration-[0.08em] prose-a:underline-offset-2
                   prose-img:rounded-xl prose-hr:my-8"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />

      {/* Footer kicker */}
      <footer className="mt-10 pt-6 border-t text-sm text-gray-500">
        <p>Filed under: <strong>Latest</strong></p>
      </footer>
    </article>
  );
}
