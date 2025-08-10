"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function UploadForm() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<null | string>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Analyzing…");

    let imageUrl: string | null = null;

    if (file) {
      const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET!;
      const filename = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { upsert: false });
      if (error) { setStatus("Upload failed: " + error.message); return; }
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filename);
      imageUrl = pub.publicUrl;
    }

    const analyzeRes = await fetch("/api/analyze", { method: "POST", body: JSON.stringify({ text, imageUrl }) });
    const analyze = await analyzeRes.json();

    let research = { results: [] as any[] };
    if (analyze.needs_research) {
      setStatus("Researching…");
      const res = await fetch("/api/research", { method: "POST", body: JSON.stringify({ query: analyze.research_query }) });
      research = await res.json();
    }

    setStatus("Writing article…");
    const genRes = await fetch("/api/generate-article", {
      method: "POST",
      body: JSON.stringify({ text, imageUrl, analyze, research }),
    });
    const article = await genRes.json();

    setStatus("Generating image…");
    const imgRes = await fetch("/api/generate-image", {
      method: "POST",
      body: JSON.stringify({ image_prompt: article.hero_prompt }),
    });
    const img = await imgRes.json();

    setStatus("Publishing…");
    const pubRes = await fetch("/api/publish", {
      method: "POST",
      body: JSON.stringify({ ...article, image_url: img.image_url }),
    });
    const published = await pubRes.json();

    setStatus(null);
    window.location.href = `/articles/${published.slug}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        className="w-full border rounded-xl p-3 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-brand-600"
        placeholder="Paste text or notes (optional)…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
      <button className="bg-brand-600 text-white px-5 py-2 rounded-xl hover:bg-brand-700 disabled:opacity-50" disabled={!text && !file}>
        Generate Article
      </button>
      {status && <p className="text-sm text-gray-600">{status}</p>}
      <p className="text-xs text-gray-400">Tip: include both an image and text for best results.</p>
    </form>
  );
}
