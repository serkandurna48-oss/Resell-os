"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/items", label: "Items" },
  { href: "/workflow", label: "Workflow" },
  { href: "/finances", label: "Finanzen" },
  { href: "/storage", label: "Lagerorte" },
  { href: "/settings", label: "Einstellungen" },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const sidebar = (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-background border-r border-border">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <span className="font-semibold text-sm tracking-tight">Resell OS</span>
        {/* Close button — only on mobile */}
        <button
          className="lg:hidden text-muted-foreground hover:text-foreground text-xl leading-none"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center px-2 py-1.5 rounded-md text-sm transition-colors ${
              isActive(href)
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );

  return (
    <div className="flex h-full bg-muted/40">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col">{sidebar}</div>

      {/* Mobile: overlay + drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden">{sidebar}</div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-full overflow-auto">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-background border-b border-border lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="text-muted-foreground hover:text-foreground p-1"
            aria-label="Menü öffnen"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="4.5" x2="16" y2="4.5" />
              <line x1="2" y1="9" x2="16" y2="9" />
              <line x1="2" y1="13.5" x2="16" y2="13.5" />
            </svg>
          </button>
          <span className="font-semibold text-sm">Resell OS</span>
        </header>

        {children}
      </div>
    </div>
  );
}
