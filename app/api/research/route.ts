import { NextResponse } from "next/server";
// If you already have a tavily wrapper, use it. Otherwise, simple fetch below.
// import { tavily } from "@/lib/tavily";

export const runtime = "nodejs";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
};

export async function POST(req: Request) {
  try {
    const { query = "" } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ results: [] });
    }

    // Direct fetch to Tavily (fallback if you don't use your wrapper):
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tavily-Key": process.env.TAVILY_API_KEY || ""
      },
      body: JSON.stringify({
        query,
        search_depth: "advanced",
        topic: "news",
        max_results: 8,
        include_answer: false,
        include_raw_content: false
      }),
      // Keep server-side
      cache: "no-store"
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: txt || res.statusText, results: [] }, { status: 500 });
    }

    const data = await res.json();
    const results: TavilyResult[] = (data?.results || []).map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.snippet || r.content || ""
    }));

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "research failed", results: [] }, { status: 500 });
  }
}
