export async function tavilySearch(q: string, maxResults = 5) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Tavily-Api-Key": key },
    body: JSON.stringify({ query: q, max_results: maxResults })
  });
  const data = await res.json().catch(() => ({}));
  return data?.results ?? [];
}
