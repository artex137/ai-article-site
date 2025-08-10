import { NextResponse } from "next/server";
import { tavilySearch } from "@/lib/tavily";
import { z } from "zod";
const Body = z.object({ query: z.string() });

export async function POST(req: Request) {
  const { query } = Body.parse(await req.json());
  const results = await tavilySearch(query, 5);
  return NextResponse.json({ results });
}
