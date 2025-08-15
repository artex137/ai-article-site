import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({ query: z.string() });

export async function POST(req: Request) {
  try {
    const { query } = Body.parse(await req.json());

    const key = process.env.TAVILY_API_KEY;
    if (!key) {
      // No key? Still return a valid JSON shape.
      return NextResponse.json({ results: [] });
    }

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tavily-Api-Key": key,
      },
      body: JSON.stringify({ query, max_results: 5 }),
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    const results = Array.isArray(data?.results) ? data.results : [];
    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("research error:", err?.message || err);
    return NextResponse.json({ results: [], error: "research failed" }, { status: 500 });
  }
}
