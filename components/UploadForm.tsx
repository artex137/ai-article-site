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

    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "article-images";
    let imageUrl: string | null = null;

    // Upload image first (if provided)
    if (file) {
      try {
        const filename = `${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from(bucket)
          .upload(filename, file, { upsert: false });
        if (error) {
          setStatus("Upload failed: " + error.message);
          return;
        }

        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filename);
        const rawUrl = pub?.publicUrl || "";
        const cleaned = rawUrl.trim().replace(/\s+/g, "");
        imageUrl = cleaned || null;

        try {
          new URL(imageUrl!); // validate
        } catch {
          console.warn("Public URL looked malformed, got:", imageUrl);
        }
      } catch (err: any) {
        setStatus("Upload failed: " + (err?.message || "unknown error"));
        return;
      }
    }

    // Build payload; only include imageUrl if present
    const analyzePayload: any = { text };
    if (imageUrl) analyzePayload.imageUrl = imageUrl;

    // ---- ANALYZE ----
    let analyze: any;
    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analyzePayload),
      });

      const analyzeText = await analyzeRes.text();
      try {
        analyze = analyzeText ? JSON.parse(analyzeText) : {};
      } catch {
        setStatus("Analyze failed: " + analyzeText.slice(0, 200));
        return;
      }

      if (!analyzeRes.ok) {
        setStatus("Analyze failed: " + (analyze?.error || analyzeRes.statusText));
        return;
      }
    } catch (err: any) {
      setStatus("Analyze failed: " + (err?.message || "unknown error"));
      return;
    }

    // ---- RESEARCH (optional) ----
    let research = { results: [] as any[] };
    try {
      if (analyze?.needs_research && analyze?.research_query) {
        setStatus("Researching…");
        const res = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: analyze.research_query }),
        });
        const txt = await res.text();
        research = txt ? JSON.parse(txt) : { results: [] };
      }
    } catch (err: any) {
      console.warn("Research error:", err);
    }

    // ---- GENERATE ARTICLE ----
    setStatus("Writing article…");
    let article: any;
    try {
      const genRes = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, imageUrl, analyze, research }),
      });
      const txt = await genRes.text();
      try {
        article = txt ? JSON.parse(txt) : {};
      } catch {
        setStatus("Article generation failed: " + txt.slice(0, 200));
        return;
      }
      if (!genRes.ok) {
        setStatus("Article generation failed: " + (article?.error || genRes.statusText));
        return;
      }
    } catch (err: any) {
      setStatus("Article generation failed: " + (err?.message || "unknown error"));
      return;
    }

    // ---- PUBLISH ----
    setStatus("Publishing…");
    try {
      const pubRes = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...article, image_url: imageUrl }),
      });
      const txt = await pubRes.text();
      let published: any = {};
      try {
        published = txt ? JSON.parse(txt) : {};
      } catch {
        setStatus("Publish failed: " + txt.slice(0, 200));
        return;
      }
      if (!pubRes.ok) {
        setStatus("Publish failed: " + (published?.error || pubRes.statusText));
        return;
      }
      setStatus(null);
      window.location.href = `/articles/${published.slug}`;
    } catch (err: any) {
      setStatus("Publish failed: " + (err?.message || "unknown error"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        className="w-full border rounded-xl p-3 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-brand-600"
        placeholder="Paste text or notes (optional)…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm"
      />
      <button
        className="bg-brand-600 text-white px-5 py-2 rounded-xl hover:bg-brand-700 disabled:opacity-50"
        disabled={!text && !file}
      >
        Generate Article
      </button>
      {status && <p className="text-sm text-gray-600">{status}</p>}
      <p className="text-xs text-gray-400">Tip: include both an image and text for best results.</p>
    </form>
  );
}
