export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto max-w-6xl px-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Infotain • Built with Next.js + Supabase + OpenAI
      </div>
    </footer>
  );
}
