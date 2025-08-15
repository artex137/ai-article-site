"use client";
import Link from "next/link";
export function Navbar() {
  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block w-2.5 h-6 bg-brand-600 rounded-sm" />
          <span>Infotain</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/upload" className="hover:text-brand-700">Upload</Link>
          <Link href="/articles" className="hover:text-brand-700">Articles</Link>
        </nav>
        <Link
          href="/upload"
          className="bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700"
        >
          Create
        </Link>
      </div>
    </header>
  );
}
