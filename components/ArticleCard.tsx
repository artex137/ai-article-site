import Link from "next/link";
export function ArticleCard({ a }: { a: any }) {
  return (
    <Link href={`/articles/${a.slug}`} className="group">
      <div className="border rounded-2xl overflow-hidden hover:shadow-md transition">
        {a.image_url && (
          <img src={a.image_url} alt={a.title} className="w-full h-48 object-cover" />
        )}
        <div className="p-4">
          <h3 className="font-semibold text-lg group-hover:text-brand-700">{a.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(a.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
