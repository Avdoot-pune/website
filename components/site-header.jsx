import Link from "next/link";
import { navLinks } from "@/lib/site-data";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
              <path d="M4 12h4l2-6 4 12 2-6h4" />
            </svg>
          </span>
          <div>
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              AI Sprint Risk Analyzer
            </p>
            <p className="text-xs text-slate-400">Predict and prevent sprint failures</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-slate-300 lg:flex">
          {navLinks.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#analyze"
          className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.12)] hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-cyan-300/15"
        >
          Analyze My Repo
        </a>
      </div>
    </header>
  );
}
