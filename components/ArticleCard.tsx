import Link from "next/link";
import Image from "next/image";

export function ArticleCard({ a }: { a: any }) {
  return (
    <Link href={`/articles/${a.slug}`} className="group">
      <div className="border rounded-2xl overflow-hidden hover:shadow-md transition">
        {a.image_url ? (
          <Image
            src={a.image_url}
            alt={a.title}
            width={600}
            height={300}
            className="w-full h-48 object-cover" // ensures uniform crop/resize
            unoptimized
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-lg group-hover:text-brand-700">
            {a.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(a.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
