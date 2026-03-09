import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-purple/60 flex items-center justify-center">
            <span className="text-white font-bold text-xs">DN</span>
          </div>
          <span>DiscordNest</span>
          <span className="text-zinc-700">·</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/" className="hover:text-zinc-300 transition-colors">
            Browse
          </Link>
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
