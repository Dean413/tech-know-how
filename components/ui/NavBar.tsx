"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  href: string;
  label: string;
}

export default function NavBar({
  items,
  fullName,
  matricOrRole
}: {
  items: NavItem[];
  fullName: string;
  matricOrRole: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-navy-50 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-8">
          <p className="font-display text-base font-semibold text-navy-800">
            Ashirov Tech Know-How
          </p>
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-navy-500 hover:bg-navy-50 hover:text-navy-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-navy-800">{fullName}</p>
            <p className="font-mono text-xs text-navy-400">{matricOrRole}</p>
          </div>
          <button onClick={handleLogout} className="btn-ghost">
            Log out
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-700 hover:bg-navy-50 md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-nav" className="border-t border-navy-50 bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-navy-500 hover:bg-navy-50 hover:text-navy-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 flex items-center justify-between border-t border-navy-50 pt-3">
            <div className="leading-tight">
              <p className="text-sm font-medium text-navy-800">{fullName}</p>
              <p className="font-mono text-xs text-navy-400">{matricOrRole}</p>
            </div>
            <button onClick={handleLogout} className="btn-ghost">
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
