import Link from "next/link";

type Props = {
  slug: string;
  title: string;
  image_url: string | null;
  created_at: string | null;
  excerpt?: string | null;
};

function formatDate(iso?: string | null) {
  if (!iso) return "";
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

export default function ArticleCard({
  slug,
  title,
  image_url,
  created_at,
  excerpt,
}: Props) {
  const img = (image_url ?? "").trim();

  return (
    <article className="group rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
      <Link href={`/articles/${slug}`} className="block">
        {/* Use <img> to avoid Next/Image domain config issues */}
        {img ? (
          <img
            src={img}
            alt={title}
            className="h-48 w-full object-cover"
            loading="lazy"
            onError={(e) => {
              // hide the broken image if the URL 404s
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="h-48 w-full bg-gray-100" />
        )}
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-brand-700">
            {title}
          </h3>
          <p className="text-sm text-gray-500">{formatDate(created_at)}</p>
          {excerpt ? (
            <p className="text-sm text-gray-600 line-clamp-3">{excerpt}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
