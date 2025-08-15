// components/ArticleCard.tsx
import Link from "next/link";

type Props = {
  slug: string;
  title: string;
  summary?: string | null;
  image_url?: string | null;
  created_at?: string | null;
};

export default function ArticleCard({
  slug,
  title,
  summary,
  image_url,
  created_at,
}: Props) {
  const date = created_at ? new Date(created_at).toLocaleDateString() : "";
  return (
    <Link
      href={`/articles/${slug}`}
      className="group block rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow bg-white"
    >
      {image_url ? (
        <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image_url}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] w-full bg-gradient-to-br from-emerald-50 to-emerald-100" />
      )}
      <div className="p-5">
        <div className="text-xs text-gray-500">{date}</div>
        <h3 className="mt-1 text-lg font-semibold text-gray-900 group-hover:text-emerald-700">
          {title}
        </h3>
        {summary ? (
          <p className="mt-2 line-clamp-3 text-sm text-gray-600">{summary}</p>
        ) : null}
      </div>
    </Link>
  );
}
