/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // OpenAI DALL·E / GPT image CDN
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      // Supabase public storage (adjust to your project ref just in case)
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
};

export default nextConfig;
