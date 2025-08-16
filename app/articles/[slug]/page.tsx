export const revalidate = 0;
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

/** Remove “drop cap” patterns from the first paragraph, e.g.
 *  <p><strong>E</strong>xploring …</p> or <p><span style="...">E</span>xploring …</p>
 */
function stripDropCap(html: string): string {
  // remove the first <h1> if present (we already show page title above)
  let out = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "");

  // normalize non-breaking spaces
  out = out.replace(/&nbsp;/g, " ");

  // target the FIRST <p> only
  out = out.replace(
    /<p([^>]*)>\s*(?:<(?:span|strong|b|em)[^>]*>\s*([A-Za-z])\s*<\/(?:span|strong|b|em)>\s*)([\s\S]*?)<\/p>/i,
    (_m, attrs, letter, rest) => `<p${attrs ? attrs : ""}>${letter}${rest}</p>`
  );

  // also catch inline-styled drops like <span style="font-size:40px">E</span>
  out = out.replace(
    /<p([^>]*)>\s*<span[^>]*style="[^"]*font-size\s*:\s*(?:\d{2,}|[2-9]\d)px[^"]*"[^>]*>\s*([A-Za-z])\s*<\/span>\s*([\s\S]*?)<\/p>/i,
    (_m, attrs, letter, rest) => `<p${attrs ? attrs : ""}>${letter}${rest}</p>`
  );

  return out;
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("title, content, image_url, created_at, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error) throw new Error(`Article fetch failed: ${error.message}`);
  if (!data) return notFound();

  const rawHtml: string = typeof data.content === "string" ? data.content : "";
  const cleanedHtml = stripDropCap(rawHtml).trim();

  return (
    <article className="mx-auto max-w-3xl lg:max-w-4xl px-4 py-10">
      <div className="mb-3 text-xs uppercase tracking-wider text-gray-500">Report</div>

      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          {data.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <time dateTime={data.created_at}>
            {data.created_at ? new Date(data.created_at).toLocaleString() : ""}
          </time>
          <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
          <span className="text-gray-500">Infotain Desk</span>
        </div>
      </header>

      {data.image_url && (
        <figure className="mb-8">
          <img
            src={data.image_url}
            alt={data.title}
            className="rounded-2xl w-full h-[420px] object-cover"
          />
        </figure>
      )}

      <div
        className="prose prose-article mx-auto text-gray-800
                   prose-a:underline prose-a:decoration-[0.08em] prose-a:underline-offset-2
                   prose-img:rounded-xl prose-hr:my-8"
        dangerouslySetInnerHTML={{ __html: cleanedHtml }}
      />

      <footer className="mt-10 pt-6 border-t">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
          <div>Filed under: <span className="font-medium text-gray-700">Latest Reports</span></div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Share:</span>
            <a href="#" aria-label="Share" className="rounded-md px-2 py-1 hover:bg-gray-100">X</a>
            <a href="#" aria-label="Share" className="rounded-md px-2 py-1 hover:bg-gray-100">FB</a>
            <a href="#" aria-label="Share" className="rounded-md px-2 py-1 hover:bg-gray-100">LN</a>
          </div>
        </div>
      </footer>
    </article>
  );
}
