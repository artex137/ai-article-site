# AI Article Site (Starter)

User uploads image/text → Analyze (Vision) → Optional research → Article → Image → Publish.
Stack: Next.js (App Router), Tailwind, Supabase (DB + Storage), OpenAI, Tavily.

## Setup
1. `npm i`
2. Copy `.env.local.example` to `.env.local`, fill values:
   - `NEXT_PUBLIC_SUPABASE_URL=https://YOURID.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
   - `OPENAI_API_KEY=sk-...`
   - `TAVILY_API_KEY=tvly-...`
   - `NEXT_PUBLIC_STORAGE_BUCKET=article-images`
3. In Supabase create storage bucket `article-images` (Public).
4. Create table `articles` with columns:
   - `id: uuid PK default uuid_generate_v4()`
   - `title: text`
   - `slug: text` (unique)
   - `content: text`
   - `image_url: text`
   - `created_at: timestamp default now()`
5. `npm run dev`
Deploy to Vercel and set the same env vars in the Project → Settings → Environment Variables.
