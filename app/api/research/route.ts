import { NextResponse } from "next/server";

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
      return NextResponse.json({ error: "Missing 'query' string.", results: [] }, { status: 400 });
    }

    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "TAVILY_API_KEY is not set on the server.", results: [] },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Tavily expects this exact header name:
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        query,
        topic: "news",
        search_depth: "advanced",
        max_results: 8,
        include_answer: false,
        include_images: false,
        include_raw_content: false
      }),
      cache: "no-store"
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json(
        { error: `Tavily error ${res.status}: ${txt || res.statusText}`, results: [] },
        { status: 500 }
      );
    }

    const data = await res.json();
    const results: TavilyResult[] = (data?.results || []).map((r: any) => ({
      title: r?.title,
      url: r?.url,
      content: r?.snippet || r?.content || ""
    }));

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json(
      { error: `research crashed: ${err?.message || "unknown error"}`, results: [] },
      { status: 500 }
    );
  }
}
