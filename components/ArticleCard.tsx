import Link from "next/link";

type Article = {
  id: number;
  title: string;
  content: string | null;
  image_url: string | null;
  slug: string;
  created_at: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition">
      <Link href={`/articles/${article.slug}`} className="block">
        {/* Use <img> instead of next/image to avoid domain config issues */}
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-48 w-full bg-gray-100" />
        )}

        <div className="p-4 space-y-2">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-brand-700">
            {article.title}
          </h3>
          <p className="text-sm text-gray-500">{formatDate(article.created_at)}</p>
          {article.content ? (
            <p className="text-sm text-gray-600 line-clamp-3">
              {article.content.replace(/<[^>]+>/g, "")}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
