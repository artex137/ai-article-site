import Image from "next/image";
import Link from "next/link";

type Props = {
  slug: string;
  title: string;
  image_url: string | null;
  created_at: string;
  excerpt?: string;
};

export default function ArticleCard({
  slug,
  title,
  image_url,
  created_at,
  excerpt,
}: Props) {
  // normalize a bit on the client too
  const img = image_url?.trim() || "";

  return (
    <Link
      href={`/articles/${slug}`}
      className="block rounded-2xl border bg-white hover:shadow-lg transition overflow-hidden"
    >
      <div className="relative aspect-[16/10] bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={title}
            fill
            // IMPORTANT: let the browser fetch directly
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={(e) => {
              // simple fallback if a particular URL 404s
              (e.currentTarget as any).style.display = "none";
            }}
          />
        ) : null}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold leading-snug line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-500">
          {new Date(created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        {excerpt ? (
          <p className="text-sm text-gray-600 line-clamp-3">{excerpt}</p>
        ) : null}
      </div>
    </Link>
  );
}
